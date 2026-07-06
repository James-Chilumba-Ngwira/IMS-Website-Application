// Self-contained demo backend replacing the (now-unreachable) hosted
// Supabase project. Implements the slice of the supabase-js interface this
// app actually calls — .from()/.auth/.rpc()/.functions.invoke() — backed by
// a seeded, localStorage-persisted in-memory store. No external service,
// no server to host: everything runs in the visitor's own browser.

import { from } from "./queryBuilder";
import { auth } from "./auth";
import { rpc } from "./rpc";
import { invokeFunction } from "./functions";

export const supabase = {
    from,
    auth,
    rpc,
    functions: {
        invoke: (name: string, opts?: { body?: { card_id?: string }; method?: string }) => invokeFunction(name, opts),
    },
};
