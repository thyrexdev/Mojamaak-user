import "./globals.css"
import { Toaster } from "sonner";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`font-arabic  dark:bg-gray-950`}>
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
