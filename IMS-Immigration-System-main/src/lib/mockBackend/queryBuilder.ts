// A minimal, chainable stand-in for supabase-js's PostgrestQueryBuilder,
// covering exactly the methods this codebase calls: select/insert/update/
// eq/neq/gt/gte/lt/lte/is/in/or/order/limit/single/maybeSingle. It is
// "thenable" so existing `await supabase.from(...).select()...` call sites
// work completely unchanged.

import { getDb, persist, uid, type DbShape } from "./store";
import { RELATIONS, SINGULAR_HASMANY_ALIASES, type TableName, type RelationDef } from "./schema";
import { parseSelect, type ParsedSelect } from "./parseSelect";
import { parseOrString, evaluateOp, type Filter } from "./filters";

type Row = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PostgrestResult<T = any> {
    data: T | null;
    error: { message: string; code?: string } | null;
    count?: number | null;
}

function getTableArray(db: DbShape, table: TableName): Row[] {
    return db[table] as unknown as Row[];
}

export function resolveRelation(db: DbShape, table: TableName, row: Row, relDef: RelationDef, aliasName: string): unknown {
    let sourceRow = row;
    let effectiveLocalKey = relDef.localKey;

    if (relDef.hopThrough) {
        const hopRel = RELATIONS[table]?.[relDef.hopThrough.relation];
        if (hopRel) {
            const hopped = resolveRelation(db, table, row, hopRel, relDef.hopThrough.relation) as Row | null;
            if (!hopped) return relDef.kind === "hasMany" ? [] : null;
            sourceRow = hopped;
            effectiveLocalKey = "id";
        }
    }

    const relatedTable = getTableArray(db, relDef.table);

    if (relDef.kind === "belongsTo") {
        const key = sourceRow[effectiveLocalKey];
        if (key == null) return null;
        return relatedTable.find((r) => r[relDef.foreignKey] === key) ?? null;
    }

    // hasMany
    const key = sourceRow[effectiveLocalKey];
    const matches = relatedTable.filter((r) => r[relDef.foreignKey] === key);
    if (SINGULAR_HASMANY_ALIASES.has(aliasName)) {
        const sorted = [...matches].sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
        return sorted[0] ?? null;
    }
    return matches;
}

function projectRow(db: DbShape, table: TableName, row: Row, parsed: ParsedSelect): Row {
    const out: Row = {};
    if (parsed.wildcard) Object.assign(out, row);
    for (const f of parsed.fields) out[f] = row[f];
    for (const embed of parsed.embeds) {
        const relDef = RELATIONS[table]?.[embed.table] ?? RELATIONS[table]?.[embed.alias];
        if (!relDef) {
            out[embed.alias] = null;
            continue;
        }
        const resolved = resolveRelation(db, table, row, relDef, embed.alias);
        if (Array.isArray(resolved)) {
            out[embed.alias] = resolved.map((r) => projectRow(db, relDef.table, r, embed.sub));
        } else if (resolved) {
            out[embed.alias] = projectRow(db, relDef.table, resolved as Row, embed.sub);
        } else {
            out[embed.alias] = null;
        }
    }
    return out;
}

// Resolves a dot-path filter column like "student.institution_id" — every
// call site in this codebase uses this only for a single-hop belongsTo (or
// singular-alias hasMany) relation, so we resolve one related row and read
// the remaining path off it directly.
function resolveDotPath(db: DbShape, table: TableName, row: Row, path: string): unknown {
    const [head, ...rest] = path.split(".");
    const relDef = RELATIONS[table]?.[head];
    if (!relDef) return row[path];
    const resolved = resolveRelation(db, table, row, relDef, head);
    const subPath = rest.join(".");
    const target = Array.isArray(resolved) ? resolved[0] : resolved;
    if (!target) return undefined;
    return subPath ? (target as Row)[subPath] : target;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches the
// original untyped `createClient(url, key)` client, whose .from() calls were
// implicitly `any` throughout the codebase; keeping that here avoids forcing
// unrelated type-narrowing changes across every hook that consumes this.
class MockQueryBuilder<T = any> implements PromiseLike<PostgrestResult<T>> {
    private table: TableName;
    private selectStr = "*";
    private countMode: "exact" | null = null;
    private headOnly = false;
    private filters: Filter[] = [];
    private orderCol: string | null = null;
    private orderAsc = true;
    private limitN: number | null = null;
    private mode: "select" | "insert" | "update" | "delete" = "select";
    private payload: Row | Row[] | null = null;
    private singleMode: "single" | "maybeSingle" | null = null;

    constructor(table: TableName) {
        this.table = table;
    }

    select(str = "*", opts?: { count?: "exact"; head?: boolean }) {
        this.selectStr = str;
        if (opts?.count) this.countMode = opts.count;
        if (opts?.head) this.headOnly = true;
        return this;
    }

    insert(payload: Row | Row[]) {
        this.mode = "insert";
        this.payload = payload;
        return this;
    }

    update(payload: Row) {
        this.mode = "update";
        this.payload = payload;
        return this;
    }

    delete() {
        this.mode = "delete";
        return this;
    }

    eq(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "eq", value });
        return this;
    }
    neq(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "neq", value });
        return this;
    }
    gt(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "gt", value });
        return this;
    }
    gte(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "gte", value });
        return this;
    }
    lt(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "lt", value });
        return this;
    }
    lte(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "lte", value });
        return this;
    }
    is(column: string, value: unknown) {
        this.filters.push({ kind: "simple", column, op: "is", value });
        return this;
    }
    in(column: string, values: unknown[]) {
        this.filters.push({ kind: "simple", column, op: "in", value: values });
        return this;
    }
    or(str: string) {
        this.filters.push(parseOrString(str));
        return this;
    }
    order(column: string, opts?: { ascending?: boolean }) {
        this.orderCol = column;
        this.orderAsc = opts?.ascending ?? true;
        return this;
    }
    limit(n: number) {
        this.limitN = n;
        return this;
    }
    single() {
        this.singleMode = "single";
        return this;
    }
    maybeSingle() {
        this.singleMode = "maybeSingle";
        return this;
    }

    private rowMatchesFilter(db: DbShape, row: Row, filter: Filter): boolean {
        if (filter.kind === "simple") {
            const rowValue = filter.column.includes(".") ? resolveDotPath(db, this.table, row, filter.column) : row[filter.column];
            return evaluateOp(rowValue, filter.op, filter.value);
        }
        // or-filter: true if any group matches (a group with "and" requires all its clauses to match)
        return filter.groups.some((g) => {
            if ("and" in g) {
                return g.and.every((c) => {
                    const rv = c.column.includes(".") ? resolveDotPath(db, this.table, row, c.column) : row[c.column];
                    return evaluateOp(rv, c.op, c.value);
                });
            }
            const rv = g.column.includes(".") ? resolveDotPath(db, this.table, row, g.column) : row[g.column];
            return evaluateOp(rv, g.op, g.value);
        });
    }

    private execute(): PostgrestResult<T> {
        const db = getDb();
        const arr = getTableArray(db, this.table);

        if (this.mode === "insert") {
            const rows = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
            const inserted = rows.map((r) => ({
                id: r.id ?? uid(),
                created_at: r.created_at ?? new Date().toISOString(),
                updated_at: r.updated_at ?? new Date().toISOString(),
                ...r,
            }));
            arr.push(...inserted);
            persist();
            const parsed = parseSelect(this.selectStr);
            const projected = inserted.map((r) => projectRow(db, this.table, r, parsed));
            return this.shapeResult(projected as unknown as T[]);
        }

        if (this.mode === "update" || this.mode === "delete") {
            const matches = arr.filter((row) => this.filters.every((f) => this.rowMatchesFilter(db, row, f)));
            if (this.mode === "update") {
                matches.forEach((row) => Object.assign(row, this.payload, { updated_at: new Date().toISOString() }));
            } else {
                matches.forEach((row) => {
                    const idx = arr.indexOf(row);
                    if (idx >= 0) arr.splice(idx, 1);
                });
            }
            persist();
            const parsed = parseSelect(this.selectStr);
            const projected = matches.map((r) => projectRow(db, this.table, r, parsed));
            return this.shapeResult(projected as unknown as T[]);
        }

        // select
        let filtered = arr.filter((row) => this.filters.every((f) => this.rowMatchesFilter(db, row, f)));

        const count = filtered.length;

        if (this.orderCol) {
            const col = this.orderCol;
            filtered = [...filtered].sort((a, b) => {
                const av = a[col];
                const bv = b[col];
                if (av === bv) return 0;
                const cmp = (av as string) < (bv as string) ? -1 : 1;
                return this.orderAsc ? cmp : -cmp;
            });
        }
        if (this.limitN != null) filtered = filtered.slice(0, this.limitN);

        if (this.headOnly) {
            return { data: null, error: null, count: this.countMode ? count : undefined };
        }

        const parsed = parseSelect(this.selectStr);
        const projected = filtered.map((r) => projectRow(db, this.table, r, parsed));

        return this.shapeResult(projected as unknown as T[], this.countMode ? count : undefined);
    }

    private shapeResult(rows: T[], count?: number): PostgrestResult<T> {
        if (this.singleMode === "single") {
            if (rows.length === 0) return { data: null, error: { message: "No rows found", code: "PGRST116" } };
            return { data: rows[0], error: null, count };
        }
        if (this.singleMode === "maybeSingle") {
            return { data: rows[0] ?? null, error: null, count };
        }
        return { data: rows as unknown as T, error: null, count };
    }

    then<TResult1 = PostgrestResult<T>, TResult2 = never>(
        onfulfilled?: ((value: PostgrestResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
        let result: PostgrestResult<T>;
        try {
            result = this.execute();
        } catch (e) {
            return Promise.reject(e).then(onfulfilled as never, onrejected);
        }
        return Promise.resolve(result).then(onfulfilled, onrejected);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function from(table: TableName): MockQueryBuilder<any> {
    return new MockQueryBuilder<any>(table);
}
