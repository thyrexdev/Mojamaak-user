"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export default function AddNotificationPage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving new notification...")
    router.push("/notifications")
  }

  const handleCancel = () => {
    router.push("/notifications")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Notification Title */}
            <div className="space-y-2">
              <Label htmlFor="notification-title" className="text-right block">
                عنوان الإشعار<span className="text-red-500">*</span>
              </Label>
              <Input id="notification-title" placeholder="صيانة مجدولة للمبنى 10" dir="rtl" />
            </div>

            {/* Notification Text */}
            <div className="space-y-2">
              <Label htmlFor="notification-text" className="text-right block">
                نص الإشعار<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="notification-text"
                placeholder="سيتم تنفيذ أعمال صيانة في المصاعد يوم الأحد"
                className="min-h-[100px] text-right"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 text-left">275 characters left</p>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="target-audience" className="text-right block">
                الجهة المستهدفة<span className="text-red-500">*</span>
              </Label>
              <Select dir="rtl">
                <SelectTrigger id="target-audience" className="text-right">
                  <SelectValue placeholder="تطبيق السكان" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="residents-app">تطبيق السكان</SelectItem>
                  <SelectItem value="web-interface">واجهة الويب</SelectItem>
                  <SelectItem value="maintenance-app">تطبيق الصيانة</SelectItem>
                  <SelectItem value="all">الكل</SelectItem>
                </SelectContent>
              </Select>
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
                إضافة الإشعار
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
