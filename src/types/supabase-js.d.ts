// IDE shim for resolving '@supabase/supabase-js' types when TS module resolution
// is not using the workspace version or 'bundler' resolution. Safe to keep.
declare module '@supabase/supabase-js' {
  export * from '@supabase/supabase-js/dist/module'
}

