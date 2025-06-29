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

    // Create home first without createdBy (it's optional now)
    const homeId = await ctx.db.insert("homes", {
      name: args.homeName,
      createdAt: Date.now(),
    })

    // Now create the user with the homeId
    const userId = await ctx.db.insert("users", {
      name: args.name,
      lastName: args.lastName,
      contactNo: args.contactNo,
      password: args.password,
      role: args.role,
      homeId: homeId,
      createdAt: Date.now(),
    })

    // Update the home with the createdBy user ID
    await ctx.db.patch(homeId, {
      createdBy: userId,
    })

    // Create session
    const token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await ctx.db.insert("sessions", {
      userId: userId,
      token: token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return { token }
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

    // Create new session
    const token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await ctx.db.insert("sessions", {
      userId: user._id,
      token: token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return { token }
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
    if (!user) return null

    const home = await ctx.db.get(user.homeId)

    return {
      ...user,
      homeName: home?.name || "Unknown Home",
    }
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
