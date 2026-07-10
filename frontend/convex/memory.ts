import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const has = query({
  args: { id: v.string() },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("memory")
      .withIndex("by_doc_id", (q: any) => q.eq("id", args.id))
      .unique();
    return existing !== null;
  },
});

export const upsert = mutation({
  args: {
    id: v.string(),
    vector: v.array(v.float64()),
    meta: v.any(),
    text: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("memory")
      .withIndex("by_doc_id", (q: any) => q.eq("id", args.id))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        embedding: args.vector,
        meta: args.meta,
        text: args.text,
      });
    } else {
      await ctx.db.insert("memory", {
        id: args.id,
        embedding: args.vector,
        meta: args.meta,
        text: args.text,
      });
    }
  },
});

export const search = query({
  args: {
    vector: v.array(v.float64()),
    limit: v.number(),
  },
  handler: async (ctx: any, args: any) => {
    const results = await ctx.vectorSearch("memory", "by_embedding", {
      vector: args.vector,
      limit: args.limit,
    });
    return await Promise.all(
      results.map(async (r: any) => {
        const doc = await ctx.db.get(r._id);
        return {
          id: doc!.id,
          score: r._score,
          meta: doc!.meta,
          text: doc!.text,
        };
      })
    );
  },
});

export const getAll = query({
  args: { limit: v.number(), offset: v.number() },
  handler: async (ctx: any, args: any) => {
    const docs = await ctx.db.query("memory").collect();
    const sliced = docs.slice(args.offset, args.offset + args.limit);
    return sliced.map((d: any) => ({
      id: d.id,
      meta: d.meta,
      text: d.text,
    }));
  },
});

export const count = query({
  handler: async (ctx: any) => {
    const docs = await ctx.db.query("memory").collect();
    return docs.length;
  },
});

export const deleteItem = mutation({
  args: { id: v.string() },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("memory")
      .withIndex("by_doc_id", (q: any) => q.eq("id", args.id))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

export const clearAll = mutation({
  handler: async (ctx: any) => {
    const docs = await ctx.db.query("memory").collect();
    for (const d of docs) {
      await ctx.db.delete(d._id);
    }
  },
});
