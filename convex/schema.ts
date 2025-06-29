import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  homes: defineTable({
    name: v.string(),
    createdBy: v.optional(v.id("users")), // Make this optional initially
    createdAt: v.number(),
  }),

  users: defineTable({
    name: v.string(),
    lastName: v.string(),
    contactNo: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    homeId: v.id("homes"),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_contact", ["contactNo"])
    .index("by_home", ["homeId"]),

  expenses: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    homeId: v.id("homes"),
    date: v.string(),
    purpose: v.string(),
    amount: v.number(),
    createdAt: v.number(),
    description: v.optional(v.string()),
    receiptFileId: v.optional(v.id("_storage")),
  })
    .index("by_user", ["userId"])
    .index("by_home", ["homeId"])
    .index("by_date", ["date"])
    .index("by_created_at", ["createdAt"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
})
