// This project originally talked to a hosted Supabase project (Postgres +
// Auth). That project is no longer reachable (free-tier projects pause after
// inactivity), so this now points at a self-contained, in-browser demo
// backend instead — see ./mockBackend. It implements the same query-builder
// shape (`supabase.from(...).select()...`, `.auth`, `.rpc`, `.functions.invoke`)
// used throughout this codebase, so no other file needed to change.
export { supabase } from "./mockBackend";
