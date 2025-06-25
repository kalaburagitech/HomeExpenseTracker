import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const register = mutation({
  args: {
    name: v.string(),
    homeName: v.string(),
    lastName: v.string(),
    contactNo: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_contact", (q) => q.eq("contactNo", args.contactNo))
      .first()

    if (existingUser) {
      throw new Error("User with this contact number already exists")
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
    })

    // Create session token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return { userId, token }
  },
})

export const login = mutation({
  args: {
    contactNo: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_contact", (q) => q.eq("contactNo", args.contactNo))
      .first()

    if (!user || user.password !== args.password) {
      throw new Error("Invalid credentials")
    }

    // Create session token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return { user, token }
  },
})

export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    const user = await ctx.db.get(session.userId)
    return user
  },
})

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (session) {
      await ctx.db.delete(session._id)
    }
  },
})
