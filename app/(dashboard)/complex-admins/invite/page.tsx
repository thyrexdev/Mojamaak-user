"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function LinkComplexAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        }
      )

      const json = await res.json()
      if (res.ok) {
        toast({
          title: "نجاح",
          description: "تم إرسال الدعوة بنجاح",
        })
        setEmail("")
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: json.message || "حدث خطأ غير متوقع",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            ربط إداري جديد
          </CardTitle>
          <p className="text-sm text-gray-500">
            أدخل البريد الإلكتروني لإرسال دعوة ربط إداري جديد بالمجمع.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-gray-700">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال الدعوة"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
