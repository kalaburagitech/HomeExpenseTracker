// "use client"

// import type React from "react"

// import { createContext, useContext, useEffect, useState } from "react"
// import { useMutation, useQuery } from "convex/react"
// import { api } from "../../convex/_generated/api"

// interface User {
//   _id: string
//   name: string
//   homeName: string
//   lastName: string
//   contactNo: string
//   role: "admin" | "user"
// }

// interface AuthContextType {
//   user: User | null
//   token: string | null
//   login: (contactNo: string, password: string) => Promise<void>
//   register: (data: any) => Promise<void>
//   logout: () => void
//   loading: boolean
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [token, setToken] = useState<string | null>(null)
//   const [loading, setLoading] = useState(true)

//   const loginMutation = useMutation(api.auth.login)
//   const registerMutation = useMutation(api.auth.register)
//   const logoutMutation = useMutation(api.auth.logout)

//   const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip")

//   useEffect(() => {
//     const savedToken = localStorage.getItem("auth-token")
//     if (savedToken) {
//       setToken(savedToken)
//     }
//     setLoading(false)
//   }, [])

//   const login = async (contactNo: string, password: string) => {
//     try {
//       const result = await loginMutation({ contactNo, password })
//       setToken(result.token)
//       localStorage.setItem("auth-token", result.token)
//     } catch (error) {
//       throw error
//     }
//   }

//   const register = async (data: any) => {
//     try {
//       const result = await registerMutation(data)
//       setToken(result.token)
//       localStorage.setItem("auth-token", result.token)
//     } catch (error) {
//       throw error
//     }
//   }

//   const logout = async () => {
//     if (token) {
//       await logoutMutation({ token })
//     }
//     setToken(null)
//     localStorage.removeItem("auth-token")
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user: user || null,
//         token,
//         login,
//         register,
//         logout,
//         loading: loading || (token && user === undefined),
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider")
//   }
//   return context
// }
