"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function PaymentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()

  const [payment, setPayment] = useState<any>(null)
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setFetching(true)
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/payments/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (!res.ok) throw new Error("فشل تحميل بيانات الدفعة")
        const json = await res.json()
        setPayment(json.data)
        setStatus(json.data?.status || "")
      } catch (err: any) {
        console.error(err)
        toast.error(err?.message || "حدث خطأ أثناء تحميل تفاصيل الدفعة")
      } finally {
        setFetching(false)
      }
    }
    if (id) fetchPayment()
  }, [id])

  const handleStatusChange = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/payments/${id}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )
      if (!res.ok) throw new Error("فشل تحديث حالة الدفعة")
      setPayment((prev: any) => ({ ...prev, status }))
      toast.success("تم تحديث حالة الدفعة بنجاح ✅")
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "فشل تحديث حالة الدفعة")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen">
        جاري التحميل...
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen">
        لا توجد بيانات للدفعة
      </div>
    )
  }

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md">
        <CardHeader>
          <CardTitle>تفاصيل الدفعة #{payment.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">المبلغ الكلي:</span>
            <span>{payment.total_amount} د.ت</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">الوصف:</span>
            <span>{payment.description || "—"}</span>
          </div>

          {/* الحالة */}
          <div className="space-y-2">
            <span className="font-medium">الحالة الحالية:</span>
            <div className="flex items-center gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[200px] text-right">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="canceled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {loading ? "جاري الحفظ..." : "حفظ الحالة"}
              </Button>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">الساكن:</span>
            <span>{payment.user?.name} ({payment.user?.phone})</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">من:</span>
            <span>{new Date(payment.installment_period_from).toLocaleDateString("fr-FR")}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">إلى:</span>
            <span>{new Date(payment.installment_period_to).toLocaleDateString("fr-FR")}</span>
          </div>

          <div>
            <span className="font-medium">الأقساط:</span>
            <ul className="list-disc pr-6 mt-2 space-y-1">
              {payment.installments.map((inst: any) => (
                <li key={inst.id}>
                  {inst.amount} د.ت -{" "}
                  {new Date(inst.payment_date).toLocaleDateString("fr-FR")}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => router.push("/financial")}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
            >
              رجوع للقائمة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
