"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EditContactInfoPage() {
  const router = useRouter()

  const handleSave = () => {
    console.log("Saving contact information...")
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
            {/* Phone Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number 1 */}
              <div className="space-y-2">
                <Label htmlFor="phone-1" className="text-right block">
                  رقم الهاتف 1<span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2" dir="ltr">
                  <Select defaultValue="IQ">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">+1 US</SelectItem>
                      <SelectItem value="IQ">+964 IQ</SelectItem>
                      <SelectItem value="SA">+966 SA</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-grow">
                    <Input
                      id="phone-1"
                      placeholder="(555) 000-0000"
                      className="pl-3 pr-3 text-left"
                      dir="ltr"
                      defaultValue="(555) 000-0000"
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-left">This is a hint text to help user.</p>
              </div>
              {/* Phone Number 2 (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="phone-2" className="text-right block">
                  رقم الهاتف 2 (اختياري)
                </Label>
                <div className="flex items-center gap-2" dir="ltr">
                  <Select defaultValue="IQ">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">+1 US</SelectItem>
                      <SelectItem value="IQ">+964 IQ</SelectItem>
                      <SelectItem value="SA">+966 SA</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-grow">
                    <Input id="phone-2" placeholder="(555) 000-0000" className="pl-3 pr-3 text-left" dir="ltr" />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">
                البريد الالكتروني<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="olivia@untitledui.com"
                  className="pl-12 text-right"
                  dir="rtl"
                  defaultValue="olivia@untitledui.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-right block">
                العنوان<span className="text-red-500">*</span>
              </Label>
              <Input id="address" placeholder="الرياض، حي المنفا" dir="rtl" defaultValue="الرياض، حي المنفا" />
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
