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
  const [residents, setResidents] = useState([])
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null)
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null)
  const [apartments, setApartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  const handleSave = () => {
    console.log({
      selectedResidentId,
      selectedApartmentId,
      // You can extend this with form fields (amounts, file, date...)
    })
    router.push("/financial")
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
          <form className="space-y-6">
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
              <Label className="text-right block">
                المبلغ الكلي<span className="text-red-500">*</span>
              </Label>
              <Input type="number" placeholder="مثال: 50000" dir="rtl" />
            </div>

            {/* Paid */}
            <div className="space-y-2">
              <Label className="text-right block">
                المبلغ المدفوع<span className="text-red-500">*</span>
              </Label>
              <Input type="number" placeholder="مثال: 10000" dir="rtl" />
            </div>

            {/* Remaining */}
            <div className="space-y-2">
              <Label className="text-right block">المتبقي</Label>
              <Input type="number" placeholder="يحسب تلقائياً أو يدويًا" dir="rtl" />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-right block">
                تاريخ الدفع<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input type="date" className="text-right" dir="rtl" />
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* File Upload */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">
                اضغط للتحميل أو اسحب المرفقات هنا
                <br />
                <span className="text-xs text-gray-500">PDF، PNG، JPG (اختياري)</span>
              </p>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-start gap-3">
              <span className="text-sm font-medium text-gray-700">نشط؟</span>
              <Switch id="active-status" defaultChecked />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-primary-500 hover:bg-primary-600 text-white">
                حفظ الدفعة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
