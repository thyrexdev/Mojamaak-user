"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaymentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<any>(null)
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/payments/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        const json = await res.json()
        setPayment(json.data)
        setStatus(json.data?.status || "")
      } catch (err) {
        console.error("خطأ في تحميل تفاصيل الدفعة:", err)
      }
    }
    if (id) fetchPayment()
  }, [id])

  const handleStatusChange = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      await fetch(
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
      // Update UI locally
      setPayment((prev: any) => ({ ...prev, status }))
    } catch (err) {
      console.error("فشل تحديث الحالة:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!payment) return <div className="p-6">جاري التحميل...</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>تفاصيل الدفعة #{payment.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><strong>المبلغ الكلي:</strong> {payment.total_amount} د.ت</div>
          <div><strong>الوصف:</strong> {payment.description}</div>

          {/* الحالة */}
          <div className="space-y-2">
            <strong>الحالة الحالية:</strong>
            <Select value={status} onValueChange={(val) => setStatus(val)}>
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

          <div><strong>الساكن:</strong> {payment.user?.name} ({payment.user?.phone})</div>
          <div><strong>من:</strong> {new Date(payment.installment_period_from).toLocaleDateString("fr-FR")}</div>
          <div><strong>إلى:</strong> {new Date(payment.installment_period_to).toLocaleDateString("fr-FR")}</div>

          <div>
            <strong>الأقساط:</strong>
            <ul className="list-disc pr-6 mt-2 space-y-1">
              {payment.installments.map((inst: any) => (
                <li key={inst.id}>
                  {inst.amount} د.ت -{" "}
                  {new Date(inst.payment_date).toLocaleDateString("fr-FR")}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={() => router.push("/financial")} className="mt-4">
            رجوع للقائمة
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
