/**
 * Relations for Drizzle's relational queries (v2). All tables are declared in
 * one `defineRelations` call; `db.query.<table>` only knows the tables listed
 * here. Passed to `drizzle()` in app/lib/db.server.ts.
 *
 * Example, once there are `posts` and `comments` tables:
 *
 *   export const relations = defineRelations(schema, (r) => ({
 *     posts: {
 *       comments: r.many.comments(),
 *     },
 *     comments: {
 *       post: r.one.posts({ from: r.comments.postId, to: r.posts.id }),
 *     },
 *   }));
 */

import { defineRelations } from "drizzle-orm";

import * as schema from "~/db/schema";

export const relations = defineRelations(schema, () => ({}));
