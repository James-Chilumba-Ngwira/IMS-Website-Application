// Filter representation + evaluation, covering the subset of PostgREST's
// filter language actually used in this codebase: eq/neq/lt/lte/gt/gte/in/is,
// plus the .or("a.eq.b,and(c.eq.d,e.lt.f)") mini-language.

export type SimpleClause = { column: string; op: string; value: unknown };
export type ClauseGroup = SimpleClause | { and: SimpleClause[] };

export interface SimpleFilter {
    kind: "simple";
    column: string;
    op: string;
    value: unknown;
}
export interface OrFilter {
    kind: "or";
    groups: ClauseGroup[];
}
export type Filter = SimpleFilter | OrFilter;

// splits on top-level commas only, respecting parens
function splitTopLevel(s: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of s) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
            parts.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    if (current) parts.push(current);
    return parts;
}

function parseSimpleClause(clause: string): SimpleClause {
    const [column, op, ...rest] = clause.split(".");
    return { column, op, value: rest.join(".") };
}

export function parseOrString(input: string): OrFilter {
    const groups: ClauseGroup[] = splitTopLevel(input).map((part) => {
        const trimmed = part.trim();
        const andMatch = trimmed.match(/^and\((.*)\)$/);
        if (andMatch) {
            return { and: splitTopLevel(andMatch[1]).map((c) => parseSimpleClause(c.trim())) };
        }
        return parseSimpleClause(trimmed);
    });
    return { kind: "or", groups };
}

function coerce(value: unknown): unknown {
    if (typeof value !== "string") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
}

export function evaluateOp(rowValue: unknown, op: string, rawValue: unknown): boolean {
    const value = coerce(rawValue);
    switch (op) {
        case "eq":
            return rowValue === value;
        case "neq":
            return rowValue !== value;
        case "gt":
            return (rowValue as any) > (value as any);
        case "gte":
            return (rowValue as any) >= (value as any);
        case "lt":
            return (rowValue as any) < (value as any);
        case "lte":
            return (rowValue as any) <= (value as any);
        case "is":
            return rowValue === value || (value === null && rowValue == null);
        case "in": {
            const list = Array.isArray(value)
                ? value
                : String(rawValue).replace(/^\(|\)$/g, "").split(",").map((v) => coerce(v.trim()));
            return list.includes(rowValue as never);
        }
        default:
            return false;
    }
}
