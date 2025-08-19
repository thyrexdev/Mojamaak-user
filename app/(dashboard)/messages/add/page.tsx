"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddMessagePage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Sending new message...")
    router.push("/messages")
  }

  const handleCancel = () => {
    router.push("/messages")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-900">إرسال رسالة جديدة</h1>
        </div>
      </div>

      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-right block">
                المستلم<span className="text-red-500">*</span>
              </Label>
              <Select dir="rtl">
                <SelectTrigger id="recipient" className="text-right">
                  <SelectValue placeholder="جميع السكان" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all-residents">جميع السكان</SelectItem>
                  <SelectItem value="specific-resident">ساكن محدد</SelectItem>
                  <SelectItem value="all-maintenance">جميع شركات الصيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-right block">
                الموضوع<span className="text-red-500">*</span>
              </Label>
              <Input id="subject" placeholder="إعلان هام" dir="rtl" />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="message-body" className="text-right block">
                نص الرسالة<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message-body"
                placeholder="اكتب رسالتك هنا..."
                className="min-h-[150px] text-right"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 text-left">500 characters left</p>
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
                إرسال الرسالة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
