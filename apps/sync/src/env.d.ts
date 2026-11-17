// Secrets are not in wrangler.jsonc: set with `wrangler secret put SYNC_TOKEN [--env staging]`.
interface Env {
  /** Shared with the collector on the VPS; lets it start the Workflow. */
  SYNC_TOKEN: string;
}
