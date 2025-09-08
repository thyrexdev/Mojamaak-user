import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} font-arabic dark:bg-gray-950`}>
        {children}
                <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
      </body>
    </html>
  )
}
