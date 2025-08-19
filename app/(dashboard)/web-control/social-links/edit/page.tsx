"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function EditSocialLinksPage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving social links...")
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
            {/* Instagram & Twitter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-right block">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/mogamak"
                  dir="ltr"
                  className="text-left"
                  defaultValue="https://instagram.com/mogamak"
                />
              </div>
              {/* Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-right block">
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/mogama"
                  dir="ltr"
                  className="text-left"
                  defaultValue="https://twitter.com/mogama"
                />
              </div>
            </div>
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-right block">
                Facebook
              </Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/mogama"
                dir="ltr"
                className="text-left"
                defaultValue="https://facebook.com/mogama"
              />
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
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
