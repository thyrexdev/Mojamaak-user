"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function AddPaymentPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [residents, setResidents] = useState<any[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null)
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null)
  const [apartments, setApartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // form states
  const [totalAmount, setTotalAmount] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [active, setActive] = useState(true)

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("لم يتم العثور على التوكن")
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error(`فشل في جلب قائمة السكان (${res.status})`)
        }

        const json = await res.json()
        const residentList = json.data?.users
        
        if (!residentList) {
          throw new Error("لم يتم العثور على بيانات السكان")
        }

        setResidents(residentList)
      } catch (error: any) {
        console.error("خطأ في تحميل السكان:", error)
        toast({
          title: "خطأ",
          description: error?.message || "حدث خطأ في تحميل بيانات السكان",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchResidents()
  }, [toast])

  useEffect(() => {
    if (!selectedResidentId) return
    const selectedUser = residents.find((res) => String(res.id) === selectedResidentId)
    setApartments(selectedUser?.apartments || [])
  }, [selectedResidentId, residents])

  const validateForm = () => {
    if (!selectedResidentId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الساكن",
        variant: "destructive",
      })
      return false
    }

    if (!totalAmount) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال المبلغ الكلي",
        variant: "destructive",
      })
      return false
    }

    if (!dateFrom) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تاريخ البداية",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("total_amount", totalAmount)
      formData.append("installment_amount", paidAmount)
      formData.append("installment_period_from", dateFrom)
      formData.append("installment_period_to", dateTo || dateFrom)
      formData.append("description", description || "—")
      formData.append("status", status)
      formData.append("user_id", selectedResidentId || "")
      if (selectedApartmentId) formData.append("apartment_id", selectedApartmentId)
      formData.append("is_active", active ? "1" : "0")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`فشل في حفظ الدفعة: ${res.status} - ${text}`)
      }

      await res.json()
      
      toast({
        title: "نجاح",
        description: "تم إضافة الدفعة المالية بنجاح ✅",
      })

      // Navigate back to the financial list after success
      router.push("/financial")

    } catch (err: any) {
      console.error("خطأ في حفظ الدفعة:", err)
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err?.message || "حدث خطأ في حفظ الدفعة المالية"
      })
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
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
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
