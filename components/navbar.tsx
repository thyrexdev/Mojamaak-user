"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Bell, MessageSquare, Grid3X3, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/themeToggle"
import { logout } from "@/lib/auth"

interface NavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarWidth: number
}

type AdminLS = {
  id?: number
  name?: string
  email?: string
  permissions?: string[] | Record<string, unknown>
}

function getInitials(input?: string) {
  if (!input) return "NA"
  // Try name first
  const parts = input.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  // Fallback: if it's an email, use before the @
  const first = input.split("@")[0]
  return (first.slice(0, 2) || "NA").toUpperCase()
}

export default function Navbar({ sidebarOpen, setSidebarOpen, sidebarWidth }: NavbarProps) {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminLS | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin")
      if (raw) {
        const parsed: AdminLS = JSON.parse(raw)
        setAdmin(parsed)
      }
    } catch {
      // ignore parse errors silently
      setAdmin(null)
    }
  }, [])

  const displayName = admin?.name || "مسؤول النظام"
  const displayEmail = admin?.email || "—"
  const initials = useMemo(() => getInitials(admin?.name || admin?.email), [admin])

  const handleLogout = () => {
    logout() // clears storage + redirects
  }

  return (
    <nav
      className="fixed top-0 left-0 z-50 bg-background border-b border-border font-arabic shadow-sm transition-all duration-300"
      style={{ right: `${sidebarOpen ? sidebarWidth : 64}px` }}
    >
      <div className="flex items-center justify-between h-[73px] px-4">
        {/* Right side - Menu Toggle Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-primary hover:bg-accent w-10 h-10 flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-grow mx-6 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ابحث في لوحة التحكم..."
              className="pl-10 pr-4 py-2.5 w-full text-right bg-muted/50 hover:bg-muted/80 focus:bg-background transition-colors"
              dir="rtl"
            />
          </div>
        </div>

        {/* Left side - User Profile and Icons */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex gap-2">
            <ThemeToggle />
          </div>

          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-auto p-0 flex items-center gap-3 min-w-0 hover:bg-transparent"
              >
                <div className="flex flex-col min-w-0 text-right">
                  <h3 className="font-semibold text-foreground text-sm truncate">{displayName}</h3>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
                {/* Avatar with initials */}
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">{initials}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="w-56 font-arabic" 
              align="start"
              sideOffset={8}
            >
              <DropdownMenuItem asChild>
                <Link 
                  href="/profile/edit" 
                  className="cursor-pointer flex items-center"
                >
                  تعديل الحساب
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
