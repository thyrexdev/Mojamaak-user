"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.replace("/") // Already logged in, redirect
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null // avoid hydration mismatch

  return <>{children}</>
}
