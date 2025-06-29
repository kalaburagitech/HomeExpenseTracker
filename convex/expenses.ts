import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const addExpense = mutation({
  args: {
    token: v.string(),
    date: v.string(),
    purpose: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    receiptFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user) throw new Error("User not found")

    return await ctx.db.insert("expenses", {
      userId: user._id,
      userName: user.name,
      homeId: user.homeId,
      date: args.date,
      purpose: args.purpose,
      amount: args.amount,
      description: args.description,
      receiptFileId: args.receiptFileId,
      createdAt: Date.now(),
    })
  },
})

export const getUserExpenses = query({
  args: {
    token: v.string(),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user) throw new Error("User not found")

    let expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect()

    // Filter by home to ensure data isolation
    expenses = expenses.filter((expense) => expense.homeId === user.homeId)

    if (args.month) {
      expenses = expenses.filter((expense) => expense.date.startsWith(args.month!))
    }

    // Add receipt URLs if they exist
    const expensesWithReceipts = await Promise.all(
      expenses.map(async (expense) => {
        let receiptUrl = null
        if (expense.receiptFileId) {
          receiptUrl = await ctx.storage.getUrl(expense.receiptFileId)
        }
        return {
          ...expense,
          receiptUrl,
        }
      }),
    )

    return expensesWithReceipts.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const getAllExpenses = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user) throw new Error("User not found")

    // Only return expenses from the same home
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_home", (q) => q.eq("homeId", user.homeId))
      .collect()

    // Add receipt URLs if they exist
    const expensesWithReceipts = await Promise.all(
      expenses.map(async (expense) => {
        let receiptUrl = null
        if (expense.receiptFileId) {
          receiptUrl = await ctx.storage.getUrl(expense.receiptFileId)
        }
        return {
          ...expense,
          receiptUrl,
        }
      }),
    )

    return expensesWithReceipts.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const updateExpense = mutation({
  args: {
    token: v.string(),
    expenseId: v.id("expenses"),
    date: v.string(),
    purpose: v.string(),
    amount: v.number(),
    description: v.string(),
    receiptFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user) throw new Error("User not found")

    const expense = await ctx.db.get(args.expenseId)
    if (!expense) throw new Error("Expense not found")

    // Ensure expense belongs to the same home
    if (expense.homeId !== user.homeId) {
      throw new Error("Access denied")
    }

    // Only admin or expense owner can update
    if (user.role !== "admin" && expense.userId !== user._id) {
      throw new Error("Permission denied")
    }

    return await ctx.db.patch(args.expenseId, {
      date: args.date,
      purpose: args.purpose,
      amount: args.amount,
      description: args.description,
      receiptFileId: args.receiptFileId,
    })
  },
})

export const deleteExpense = mutation({
  args: {
    token: v.string(),
    expenseId: v.id("expenses"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user) throw new Error("User not found")

    const expense = await ctx.db.get(args.expenseId)
    if (!expense) throw new Error("Expense not found")

    // Ensure expense belongs to the same home
    if (expense.homeId !== user.homeId) {
      throw new Error("Access denied")
    }

    // Only admin can delete
    if (user.role !== "admin") {
      throw new Error("Admin access required")
    }

    // Delete associated receipt file if exists
    if (expense.receiptFileId) {
      await ctx.storage.delete(expense.receiptFileId)
    }

    return await ctx.db.delete(args.expenseId)
  },
})

export const getExpenseStats = query({
  args: {
    token: v.string(),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session) throw new Error("Unauthorized")

    const user = await ctx.db.get(session.userId)
    if (!user) throw new Error("User not found")

    // Only get expenses and users from the same home
    let expenses = await ctx.db
      .query("expenses")
      .withIndex("by_home", (q) => q.eq("homeId", user.homeId))
      .collect()

    // Filter by month if provided
    if (args.month) {
      expenses = expenses.filter((expense) => expense.date.startsWith(args.month!))
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_home", (q) => q.eq("homeId", user.homeId))
      .collect()

    // Calculate stats
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const userStats = users.map((homeUser) => {
      const userExpenses = expenses.filter((expense) => expense.userId === homeUser._id)
      const userTotal = userExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      return {
        userId: homeUser._id,
        name: homeUser.name,
        totalPaid: userTotal,
        expenseCount: userExpenses.length,
      }
    })

    const averagePerPerson = totalAmount / users.length

    const settlements = userStats.map((stat) => ({
      ...stat,
      shouldPay: averagePerPerson,
      balance: stat.totalPaid - averagePerPerson,
    }))

    return {
      totalAmount,
      averagePerPerson,
      userStats: settlements,
      monthlyData: getMonthlyData(expenses),
    }
  },
})

function getMonthlyData(expenses: Array<{ date: string; amount: number }>) {
  const monthlyMap = new Map()

  expenses.forEach((expense) => {
    const month = expense.date.substring(0, 7) // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, 0)
    }
    monthlyMap.set(month, monthlyMap.get(month) + expense.amount)
  })

  return Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({
      month,
      amount,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// File upload helper
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId)
  },
})
