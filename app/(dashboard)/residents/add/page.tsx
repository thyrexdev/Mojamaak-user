"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UploadCloud, Phone, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddResidentPage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving new resident...")
    router.push("/residents")
  }

  const handleCancel = () => {
    router.push("/residents")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-right block">
                الاسم الكامل<span className="text-red-500">*</span>
              </Label>
              <Input id="full-name" placeholder="محمد العتيبي" dir="rtl" />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block">
                رقم الهاتف<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input id="phone" placeholder="05xxxxxxxx" className="pl-12 text-right" dir="rtl" />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Apartment Number */}
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-right block">
                رقم الشقة<span className="text-red-500">*</span>
              </Label>
              <Input id="apartment" placeholder="A-10" dir="rtl" />
            </div>

            {/* Residence Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-right block">
                نوع السكن<span className="text-red-500">*</span>
              </Label>
              <Select dir="rtl">
                <SelectTrigger id="type" className="text-right">
                  <SelectValue placeholder="اختر نوع السكن" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="rent">إيجار</SelectItem>
                  <SelectItem value="own">ملك</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Residence Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-right block">
                تاريخ السكن<span className="text-red-500">*</span>
              </Label>
              <Input id="date" type="date" dir="rtl" />
            </div>

            {/* File Upload */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">
                اضغط للتحميل أو اسحب الصورة
                <br />
                <span className="text-xs text-gray-500">PNG, JPG, GIF (max. 800x400px)</span>
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
                حفظ الساكن
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
