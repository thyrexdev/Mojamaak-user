"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EditSliderImagePage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving slider image...")
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
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-right block">تحميل الصورة</Label>
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                  <br />
                  <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                </p>
              </div>
            </div>
            {/* Image Link (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="image-link" className="text-right block">
                رابط الصورة (اختياري)
              </Label>
              <Input
                id="image-link"
                placeholder="https://mogamak.com/offers/image.jpg"
                dir="ltr"
                className="text-left"
                defaultValue="https://mogamak.com/offers/image.jpg"
              />
            </div>
            {/* Image Order */}
            <div className="space-y-2">
              <Label htmlFor="image-order" className="text-right block">
                ترتيب الصورة
              </Label>
              <Input id="image-order" type="number" placeholder="3" dir="rtl" defaultValue="3" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-primary-500 hover:bg-primary-600 text-white">
                حفظ الصورة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
