import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getAllUsers = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Verify admin access
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required")
    }

    return await ctx.db.query("users").collect()
  },
})

export const addUser = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    homeName: v.string(),
    lastName: v.string(),
    contactNo: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const admin = await ctx.db.get(session.userId)
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required")
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_contact", (q) => q.eq("contactNo", args.contactNo))
      .first()

    if (existingUser) {
      throw new Error("User with this contact number already exists")
    }

    return await ctx.db.insert("users", {
      name: args.name,
      homeName: args.homeName,
      lastName: args.lastName,
      contactNo: args.contactNo,
      password: args.password,
      role: "user" as const,
      createdBy: admin._id,
      createdAt: Date.now(),
    })
  },
})
