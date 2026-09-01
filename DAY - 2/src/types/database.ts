/**
 * Supabase generated types — PLACEHOLDER.
 *
 * This file is generated, not written by hand. Once the migrations have been
 * applied to the project, regenerate it:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 *
 * Until then `Database` stays deliberately loose. The app does not depend on it
 * for safety: every query in `src/features/*\/api/` pins its own result shape
 * with `.returns<T>()` against the hand-written models in `./models.ts`, so a
 * schema/code mismatch shows up at the query call site either way.
 * Regenerating this file upgrades that to full column-level checking.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
