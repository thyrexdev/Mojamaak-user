"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function AddMaintenancePage() {
  const router = useRouter()
  const [type, setType] = useState("شركة")
  const [specialty, setSpecialty] = useState("صحيات")
  const [location, setLocation] = useState("")
  const [isActive, setIsActive] = useState(true)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert("تمت إضافة الجهة بنجاح")
    router.push("/companies")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white max-w-2xl mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 text-right">
            إضافة جهة صيانة
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* نوع الجهة */}
            <div className="space-y-2">
              <Label className="block text-right">نوع الجهة</Label>
              <Select value={type} onValueChange={setType} dir="rtl">
                <SelectTrigger id="type" className="text-right">
                  <SelectValue placeholder="اختر نوع الجهة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="شركة">شركة</SelectItem>
                  <SelectItem value="فرد">فرد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* الاسم */}
            <div>
              <Label htmlFor="name" className="block text-right">الاسم</Label>
              <Input id="name" required className="mt-1 text-right" />
            </div>

            {/* رقم الجوال */}
            <div>
              <Label htmlFor="phone" className="block text-right">رقم الجوال</Label>
              <Input id="phone" type="tel" required className="mt-1 text-right" />
            </div>

            {/* الموقع */}
            <div>
              <Label htmlFor="location" className="block text-right">الموقع</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 text-right"
              />
            </div>

            {/* التخصص */}
            <div className="space-y-2">
              <Label className="text-right block">التخصص</Label>
              <Select value={specialty} onValueChange={setSpecialty} dir="rtl">
                <SelectTrigger id="specialty" className="text-right">
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="صحيات">صحيات</SelectItem>
                  <SelectItem value="كهربائيات">كهربائيات</SelectItem>
                  <SelectItem value="نجارة">نجارة</SelectItem>
                  <SelectItem value="حدادة">حدادة</SelectItem>
                  <SelectItem value="زجاج">زجاج</SelectItem>
                  <SelectItem value="ترميم">ترميم</SelectItem>
                  <SelectItem value="اخر">اخر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* الحالة (نشط؟) */}
            <div className="flex items-center justify-start gap-3">
              <span className="text-sm font-medium text-gray-700">نشط؟</span>
              <Switch
                id="active-status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* زر الحفظ */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
              >
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
