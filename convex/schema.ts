import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    homeName: v.string(),
    lastName: v.string(),
    contactNo: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_contact", ["contactNo"]),

  expenses: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    date: v.string(),
    purpose: v.string(),
    amount: v.number(),
    createdAt: v.number(),
    description:v.optional(v.string()),
  })
    .index("by_user", ["userId"])
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
