"use client"

import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// --- Zod schema ---
const installmentSchema = z.object({
  amount: z.number({ invalid_type_error: "المبلغ يجب أن يكون رقمًا" }).min(1, "المبلغ لا يمكن أن يكون صفر"),
  payment_date: z.string().min(1, "يرجى تحديد تاريخ الدفع"),
})

type InstallmentForm = z.infer<typeof installmentSchema>

export default function AddInstallmentPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params?.id
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit } = useForm<InstallmentForm>({
    resolver: zodResolver(installmentSchema),
    defaultValues: {
      amount: 0,
      payment_date: "",
    },
  })

  const onSubmit = async (data: InstallmentForm) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token") || ""
      const res = await fetch(`${API_BASE_URL}/api/dashboard/complex-admin/payments/${paymentId}/installments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.amount,
          payment_date: data.payment_date,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "حدث خطأ أثناء إضافة القسط")
      }

      toast.success("تمت إضافة القسط بنجاح ✅")
      router.push(`/financial`)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "حدث خطأ أثناء إضافة القسط")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-6 py-8 bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-center mb-6 font-[cairo]">إضافة قسط جديد</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-[cairo]">
        {/* Amount */}
        <Controller
          name="amount"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                placeholder="أدخل المبلغ"
                {...field}
                className={fieldState.error ? "border-red-500" : ""}
              />
              {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />

        {/* Payment Date */}
        <Controller
          name="payment_date"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Label htmlFor="payment_date">تاريخ الدفع</Label>
              <Input
                id="payment_date"
                type="date"
                {...field}
                className={fieldState.error ? "border-red-500" : ""}
              />
              {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
            </div>
          )}
        />

        <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white" disabled={loading}>
          {loading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </form>
    </div>
  )
}
