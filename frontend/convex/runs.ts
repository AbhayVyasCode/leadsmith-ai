import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    id: v.string(),
    timestamp: v.number(),
    request: v.string(),
    candidates: v.number(),
    leads: v.number(),
    duration: v.number(),
    payload: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("runs")
      .withIndex("by_run_id", (q: any) => q.eq("id", args.id))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        timestamp: args.timestamp,
        request: args.request,
        candidates: args.candidates,
        leads: args.leads,
        duration: args.duration,
        payload: args.payload,
      });
    } else {
      await ctx.db.insert("runs", {
        id: args.id,
        timestamp: args.timestamp,
        request: args.request,
        candidates: args.candidates,
        leads: args.leads,
        duration: args.duration,
        payload: args.payload,
      });
    }
  },
});

export const getSummaries = query({
  args: { limit: v.number(), offset: v.number() },
  handler: async (ctx: any, args: any) => {
    const records = await ctx.db
      .query("runs")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
    const sliced = records.slice(args.offset, args.offset + args.limit);
    return sliced.map((r: any) => {
      let total_scanned = r.candidates;
      if (r.payload) {
        try {
          const payload = JSON.parse(r.payload);
          total_scanned = payload.metrics?.total_scanned ?? total_scanned;
        } catch (e) {}
      }
      return {
        id: r.id,
        created_at: r.timestamp,
        request: r.request,
        candidates_found: r.candidates,
        leads_count: r.leads,
        duration_seconds: r.duration,
        total_scanned: total_scanned,
      };
    });
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx: any, args: any) => {
    const record = await ctx.db
      .query("runs")
      .withIndex("by_run_id", (q: any) => q.eq("id", args.id))
      .unique();
    return record ? record.payload : null;
  },
});

export const deleteRun = mutation({
  args: { id: v.string() },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("runs")
      .withIndex("by_run_id", (q: any) => q.eq("id", args.id))
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
    const records = await ctx.db.query("runs").collect();
    for (const r of records) {
      await ctx.db.delete(r._id);
    }
  },
});

export const count = query({
  handler: async (ctx: any) => {
    const records = await ctx.db.query("runs").collect();
    return records.length;
  },
});
