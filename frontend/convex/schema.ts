import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cache: defineTable({
    key: v.string(),
    val: v.string(),
  }).index("by_key", ["key"]),

  memory: defineTable({
    id: v.string(), // normalized url domain key like "lead::example.com"
    text: v.string(),
    embedding: v.array(v.float64()),
    meta: v.any(),
  })
    .index("by_doc_id", ["id"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768, // Gemini embeddings are 768 dimensions
    }),

  runs: defineTable({
    id: v.string(),
    timestamp: v.number(),
    request: v.string(),
    candidates: v.number(),
    leads: v.number(),
    duration: v.number(),
    payload: v.string(), // serialized json RunReport
  })
    .index("by_run_id", ["id"])
    .index("by_timestamp", ["timestamp"]),
});
