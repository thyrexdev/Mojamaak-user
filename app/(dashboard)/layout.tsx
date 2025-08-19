"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null // ⛔ Don't render anything until client checks auth

  return (
    <div className={`${inter.className} font-arabic`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
        <Layout>{children}</Layout>
      </ThemeProvider>
    </div>
  )
}
