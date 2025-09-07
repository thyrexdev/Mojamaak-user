"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export default function AddInstallmentPage() {
  const [amount, setAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const router = useRouter()
  const params = useParams()
  const paymentId = params?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token") || ""
      const response = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/payments/${paymentId}/installments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          payment_date: paymentDate,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText)
      }

      toast({
        title: "تم بنجاح",
        description: "تمت إضافة القسط بنجاح",
      })
      router.push(`/financial`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة القسط. الرجاء التحقق من البيانات أو المحاولة لاحقًا.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-6 py-8 bg-white shadow-md rounded-xl border">
      <h2 className="text-xl font-bold text-center mb-6 font-[cairo]">إضافة قسط جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-5 font-[cairo]">
        <div>
          <Label htmlFor="amount">المبلغ</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="أدخل المبلغ"
            required
          />
        </div>
        <div>
          <Label htmlFor="payment_date">تاريخ الدفع</Label>
          <Input
            id="payment_date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </form>
    </div>
  )
}
