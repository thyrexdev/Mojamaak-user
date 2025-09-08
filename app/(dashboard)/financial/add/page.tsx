"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// --- Zod validation schema ---
const paymentSchema = z.object({
  residentId: z.string().min(1, "يرجى اختيار الساكن"),
  apartmentId: z.string().optional(),
  totalAmount: z.string().min(1, "يرجى إدخال المبلغ الكلي"),
  paidAmount: z.string().optional(),
  dateFrom: z.string().min(1, "يرجى تحديد تاريخ البداية"),
  dateTo: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]),
  active: z.boolean(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

export default function AddPaymentPage() {
  const router = useRouter()

  const [residents, setResidents] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [loadingResidents, setLoadingResidents] = useState(true)
  const [saving, setSaving] = useState(false)

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      residentId: "",
      apartmentId: "",
      totalAmount: "",
      paidAmount: "",
      dateFrom: "",
      dateTo: "",
      description: "",
      status: "pending",
      active: true,
    },
  })

  const selectedResidentId = watch("residentId")

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("لم يتم العثور على التوكن")

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(`فشل في جلب قائمة السكان (${res.status})`)

        const json = await res.json()
        setResidents(json.data?.users || [])
      } catch (err: any) {
        console.error(err)
        toast.error(err?.message || "حدث خطأ في تحميل بيانات السكان")
      } finally {
        setLoadingResidents(false)
      }
    }

    fetchResidents()
  }, [])

  useEffect(() => {
    if (!selectedResidentId) return
    const selectedUser = residents.find((r) => String(r.id) === selectedResidentId)
    setApartments(selectedUser?.apartments || [])
    setValue("apartmentId", "")
  }, [selectedResidentId, residents, setValue])

  const onSubmit = async (data: PaymentFormData) => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى")

      const formData = new FormData()
      formData.append("total_amount", data.totalAmount)
      formData.append("installment_amount", data.paidAmount || "")
      formData.append("installment_period_from", data.dateFrom)
      formData.append("installment_period_to", data.dateTo || data.dateFrom)
      formData.append("description", data.description || "—")
      formData.append("status", data.status)
      formData.append("user_id", data.residentId)
      if (data.apartmentId) formData.append("apartment_id", data.apartmentId)
      formData.append("is_active", data.active ? "1" : "0")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/payments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`فشل في حفظ الدفعة: ${res.status} - ${text}`)
      }

      await res.json()
      toast.success("تم إضافة الدفعة المالية بنجاح ✅")
      router.push("/financial")
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "حدث خطأ في حفظ الدفعة المالية")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 font-arabic dark:bg-gray-900 min-h-screen" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          إضافة دفعة مالية جديدة
        </h1>
      </div>

      <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md">
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Resident */}
            <Controller
              control={control}
              name="residentId"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">اسم الساكن <span className="text-red-500">*</span></Label>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder={loadingResidents ? "جاري التحميل..." : "اختر الساكن"} />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {residents.map((res) => (
                        <SelectItem key={res.id} value={res.id.toString()}>
                          {res.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.residentId && <p className="text-red-500 text-sm">{errors.residentId.message}</p>}
                </div>
              )}
            />

            {/* Apartment */}
            {selectedResidentId && (
              <Controller
                control={control}
                name="apartmentId"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className="text-right block">رقم الشقة</Label>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر رقم الشقة" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {apartments.map((apt) => (
                          <SelectItem key={apt.id} value={apt.id.toString()}>
                            {apt.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            )}

            {/* Total Amount */}
            <Controller
              control={control}
              name="totalAmount"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">المبلغ الكلي <span className="text-red-500">*</span></Label>
                  <Input {...field} type="number" dir="rtl" />
                  {errors.totalAmount && <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>}
                </div>
              )}
            />

            {/* Paid Amount */}
            <Controller
              control={control}
              name="paidAmount"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">المبلغ المدفوع</Label>
                  <Input {...field} type="number" dir="rtl" />
                </div>
              )}
            />

            {/* Date From */}
            <Controller
              control={control}
              name="dateFrom"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">تاريخ بداية الفترة <span className="text-red-500">*</span></Label>
                  <Input {...field} type="date" className="text-right" />
                  {errors.dateFrom && <p className="text-red-500 text-sm">{errors.dateFrom.message}</p>}
                </div>
              )}
            />

            {/* Date To */}
            <Controller
              control={control}
              name="dateTo"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">تاريخ نهاية الفترة</Label>
                  <Input {...field} type="date" className="text-right" />
                </div>
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">الوصف</Label>
                  <Input {...field} type="text" dir="rtl" />
                </div>
              )}
            />

            {/* Status */}
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-right block">الحالة</Label>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="failed">فشل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Active Switch */}
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">نشط؟</span>
                  <Switch id="active-status" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => router.push("/financial")}
              >
                إلغاء
              </Button>
              <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ الدفعة"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
