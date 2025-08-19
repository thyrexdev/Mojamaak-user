"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

export default function EditPricesSubscriptionsPage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving prices and subscriptions data...")
    router.push("/web-control")
  }

  const handleCancel = () => {
    router.push("/web-control")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-right block">
                اسم الباقة/الخدمة<span className="text-red-500">*</span>
              </Label>
              <Input id="item-name" placeholder="الباقة الذهبية" dir="rtl" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-right block">
                السعر<span className="text-red-500">*</span>
              </Label>
              <Input id="price" type="number" placeholder="100" dir="rtl" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-right block">
                الوصف<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="وصف تفصيلي للباقة أو الخدمة"
                className="min-h-[100px] text-right"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 text-left">275 characters left</p>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-start gap-3">
              {" "}
              {/* Changed justify-end to justify-start */}
              <span className="text-sm font-medium text-gray-700">حالة الباقة</span>
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
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
