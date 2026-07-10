import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx: any, args: any) => {
    const record = await ctx.db
      .query("cache")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .unique();
    return record ? record.val : null;
  },
});

export const set = mutation({
  args: { key: v.string(), val: v.string() },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("cache")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { val: args.val });
    } else {
      await ctx.db.insert("cache", { key: args.key, val: args.val });
    }
  },
});
