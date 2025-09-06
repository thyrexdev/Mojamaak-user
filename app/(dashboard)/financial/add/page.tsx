"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UploadCloud, CalendarDays, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AddPaymentPage() {
  const router = useRouter()
  const [residents, setResidents] = useState<any[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null)
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null)
  const [apartments, setApartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // form states
  const [totalAmount, setTotalAmount] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [remaining, setRemaining] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [active, setActive] = useState(true)

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        const residentList = json.data?.users || []
        setResidents(residentList)
      } catch (error) {
        console.error("Erreur lors du chargement des السكان", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResidents()
  }, [])

  useEffect(() => {
    if (!selectedResidentId) return
    const selectedUser = residents.find((res) => String(res.id) === selectedResidentId)
    setApartments(selectedUser?.apartments || [])
  }, [selectedResidentId, residents])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem("token")
    if (!token) {
      alert("مفيش توكن! سجل دخول الأول.")
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: (() => {
          const form = new FormData()
          form.append("total_amount", totalAmount)
          form.append("installment_amount", paidAmount) // عندك مثال اسمه installment_amount
          form.append("installment_period_from", dateFrom)
          form.append("installment_period_to", dateTo || dateFrom) // fallback بسيط
          form.append("description", description || "—")
          form.append("status", status) // pending, completed, failed
          form.append("user_id", selectedResidentId || "")
          if (selectedApartmentId) form.append("apartment_id", selectedApartmentId)
          form.append("is_active", active ? "1" : "0")
          return form
        })(),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`فشل الحفظ: ${res.status} → ${text}`)
      }

      // لو كله تمام
      router.push("/financial")
    } catch (err) {
      console.error("Error saving payment:", err)
      alert("حصل خطأ أثناء الحفظ")
    }
  }

  const handleCancel = () => {
    router.push("/financial")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-900">إضافة دفعة مالية جديدة</h1>
        </div>
      </div>

      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSave}>
            {/* Resident Name */}
            <div className="space-y-2">
              <Label className="text-right block">
                اسم الساكن<span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setSelectedResidentId(value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الساكن" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {residents.map((resident) => (
                    <SelectItem key={resident.id.toString()} value={resident.id.toString()}>
                      {resident.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apartment Number */}
            {selectedResidentId && (
              <div className="space-y-2">
                <Label className="text-right block">
                  رقم الشقة<span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setSelectedApartmentId(value)}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر رقم الشقة" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {apartments.map((apt) => (
                      <SelectItem key={apt.id.toString()} value={apt.id.toString()}>
                        {apt.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total Amount */}
            <div className="space-y-2">
              <Label className="text-right block">المبلغ الكلي<span className="text-red-500">*</span></Label>
              <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} dir="rtl" />
            </div>

            {/* Paid */}
            <div className="space-y-2">
              <Label className="text-right block">المبلغ المدفوع<span className="text-red-500">*</span></Label>
              <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} dir="rtl" />
            </div>

            {/* Remaining */}
            <div className="space-y-2">
              <Label className="text-right block">المتبقي</Label>
              <Input type="number" value={remaining} onChange={(e) => setRemaining(e.target.value)} dir="rtl" />
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label className="text-right block">تاريخ بداية الفترة<span className="text-red-500">*</span></Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-right" />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label className="text-right block">تاريخ نهاية الفترة</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-right" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-right block">الوصف</Label>
              <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} dir="rtl" />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-right block">الحالة</Label>
              <Select onValueChange={(value) => setStatus(value)} defaultValue={status}>
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

            {/* Active Switch */}
            <div className="flex items-center justify-start gap-3">
              <span className="text-sm font-medium text-gray-700">نشط؟</span>
              <Switch id="active-status" checked={active} onCheckedChange={setActive} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                إلغاء
              </Button>
              <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white">
                حفظ الدفعة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
