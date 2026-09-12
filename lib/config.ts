/**
 * Shared constants that must be importable from client components without
 * dragging the Supabase client into the browser bundle.
 *
 * The curated demo set is anchored to a fixed reference date so that relative
 * timestamps ("3d ago") render identically on the server and on the client.
 * Using the wall clock would produce a hydration mismatch.
 */
export const REFERENCE_DATE = new Date("2026-09-12T12:00:00Z");
