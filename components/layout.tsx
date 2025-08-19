"use client"

import type React from "react"
import { useState } from "react"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { usePathname } from "next/navigation" // Import usePathname

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sidebarWidth = 230 // w-80 = 320px
  const navbarHeight = 73 // h-[73px] = 73px
  const pathname = usePathname() // Get current pathname

  // Determine if the current page should have the full layout (navbar + sidebar)
  const showFullLayout = pathname !== "/login"

  return (
    <div className="min-h-screen bg-gray-50">
      {showFullLayout && (
        <>
          {/* Fixed Navbar */}
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} sidebarWidth={sidebarWidth} />

          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} sidebarWidth={sidebarWidth} />
        </>
      )}

      {/* Main Content Area */}
<main
  className={`transition-all duration-300 min-h-screen ${showFullLayout ? "" : "pt-0 mr-0"}`}
  style={{
    marginRight: showFullLayout ? `${sidebarOpen ? sidebarWidth : 64}px` : "0px",
    paddingTop: showFullLayout ? `${navbarHeight}px` : "0px",
  }}
>
  <div className="h-full">{children}</div>
</main>


      {/* Mobile Overlay */}
      {showFullLayout && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
