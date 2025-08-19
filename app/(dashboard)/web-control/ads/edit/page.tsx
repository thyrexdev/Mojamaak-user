"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EditAdsPage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving ad data...")
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
            {/* Ad Title */}
            <div className="space-y-2">
              <Label htmlFor="ad-title" className="text-right block">
                عنوان الإعلان<span className="text-red-500">*</span>
              </Label>
              <Input id="ad-title" placeholder="إعلان جديد" dir="rtl" />
            </div>

            {/* Ad Description */}
            <div className="space-y-2">
              <Label htmlFor="ad-description" className="text-right block">
                وصف الإعلان<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ad-description"
                placeholder="وصف تفصيلي للإعلان"
                className="min-h-[100px] text-right"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 text-left">275 characters left</p>
            </div>

            {/* Ad Image/Media */}
            <div className="space-y-2">
              <Label className="text-right block">صورة / فيديو الإعلان</Label>
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                  <br />
                  <span className="text-xs text-gray-500">SVG, PNG, JPG, GIF, MP4, MOV (max. 10MB)</span>
                </p>
              </div>
            </div>

            {/* Ad Link (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="ad-link" className="text-right block">
                رابط الإعلان (اختياري)
              </Label>
              <Input id="ad-link" placeholder="https://your-ad-link.com" dir="ltr" className="text-left" />
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
                حفظ الإعلان
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
