// Minimal recursive-descent parser for PostgREST-style select strings, e.g.
//   "*, visa:visas(*), institution:institutions(name)"
//   "id, name, students (id, visa:visas(status, end_date))"
// Only supports the subset actually used in this codebase: wildcard, plain
// columns, and `alias:table(...)` / `table(...)` nested embeds, with an
// optional `!inner`/`!left` modifier after the table name (ignored — this
// mock always resolves the embed).

export interface ParsedSelect {
    wildcard: boolean;
    fields: string[];
    embeds: { alias: string; table: string; sub: ParsedSelect }[];
}

export function parseSelect(input: string): ParsedSelect {
    const s = input.replace(/\s+/g, " ").trim();
    let i = 0;

    function skipComma() {
        while (s[i] === "," || s[i] === " ") i++;
    }
    function skipSpace() {
        while (s[i] === " ") i++;
    }

    function readIdent(): string {
        const start = i;
        while (i < s.length && /[a-zA-Z0-9_*]/.test(s[i])) i++;
        return s.slice(start, i);
    }

    function parseGroup(): ParsedSelect {
        const result: ParsedSelect = { wildcard: false, fields: [], embeds: [] };
        skipComma();
        while (i < s.length && s[i] !== ")") {
            const first = readIdent();
            skipSpace();
            if (first === "*") {
                result.wildcard = true;
                skipComma();
                continue;
            }
            let alias = first;
            let tableOrField = first;
            if (s[i] === ":") {
                i++; // consume ':'
                skipSpace();
                tableOrField = readIdent();
                skipSpace();
            }
            // skip !inner / !left modifiers
            if (s[i] === "!") {
                i++;
                readIdent();
                skipSpace();
            }
            if (s[i] === "(") {
                i++; // consume '('
                const sub = parseGroup();
                if (s[i] === ")") i++; // consume ')'
                result.embeds.push({ alias, table: tableOrField, sub });
            } else {
                result.fields.push(tableOrField === alias ? alias : tableOrField);
            }
            skipComma();
        }
        return result;
    }

    return parseGroup();
}
