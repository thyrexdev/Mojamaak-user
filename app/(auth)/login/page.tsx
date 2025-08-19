"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const result = await res.json()

      if (result.code === 200 && result.data?.token) {
        // Save the token & admin data
        localStorage.setItem("token", result.data.token)
        localStorage.setItem("admin", JSON.stringify(result.data.admin))

        // Redirect to dashboard
        router.push("/")
      } else {
        setError(result.message || "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.")
      }
    } catch (err) {
      console.error(err)
      setError("حدث خطأ في الاتصال بالخادم.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-arabic" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <Image src="logo2.png" alt="شعار مجمعك" width={180} height={48} priority />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">تسجيل الدخول</CardTitle>
          <CardDescription className="text-gray-500">
            أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">البريد الالكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                dir="ltr"
                className="text-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                dir="ltr"
                className="text-left"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg">
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
