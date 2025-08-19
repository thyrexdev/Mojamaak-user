"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud, Phone, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function AddWebContentPage() {
  const router = useRouter()
  const [contentType, setContentType] = useState<string>("slider-images") // Default to slider images
  const [formTitle, setFormTitle] = useState("إضافة صورة جديدة للسلايدر") // Initial title based on default content type

  useEffect(() => {
    // Update title based on initial contentType or when contentType changes
    if (contentType === "slider-images") {
      setFormTitle("إضافة صورة جديدة للسلايدر")
    } else if (contentType === "homepage-text" || contentType === "privacy-policy") {
      setFormTitle("إدارة الصفحات الثابتة")
    } else if (contentType === "contact-info") {
      setFormTitle("إدارة بيانات الاتصال")
    } else if (contentType === "social-links") {
      setFormTitle("إدارة الروابط الاجتماعية")
    } else {
      setFormTitle("إضافة محتوى جديد") // Fallback for other types
    }
  }, [contentType])

  const handleSave = () => {
    // Simulate saving data based on content type
    console.log(`Saving new web content for type: ${contentType}...`)
    // Navigate back to the web control table
    router.push("/web-control")
  }

  const handleCancel = () => {
    router.push("/web-control")
  }

  const renderFormFields = () => {
    switch (contentType) {
      case "slider-images":
        return (
          <>
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
                إضافة الصورة
              </Button>
            </div>
          </>
        )
      case "homepage-text":
      case "privacy-policy":
        return (
          <>
            {/* Page Selection (if applicable, for static pages) */}
            <div className="space-y-2">
              <Label htmlFor="static-page-select" className="text-right block">
                اختيار الصفحة<span className="text-red-500">*</span>
              </Label>
              <Select dir="rtl" defaultValue={contentType === "homepage-text" ? "homepage" : "privacy-policy"}>
                <SelectTrigger id="static-page-select" className="text-right">
                  <SelectValue placeholder="اختر الصفحة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="homepage">الصفحة الرئيسية</SelectItem>
                  <SelectItem value="privacy-policy">سياسة الخصوصية</SelectItem>
                  <SelectItem value="terms-conditions">الشروط والأحكام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Page Title */}
            <div className="space-y-2">
              <Label htmlFor="page-title" className="text-right block">
                عنوان الصفحة<span className="text-red-500">*</span>
              </Label>
              <Input id="page-title" placeholder="سياسة الخصوصية" dir="rtl" defaultValue="سياسة الخصوصية" />
            </div>
            {/* Page Content */}
            <div className="space-y-2">
              <Label htmlFor="page-content" className="text-right block">
                محتوى الصفحة<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="page-content"
                placeholder="إضافة أو تعديل المحتوى"
                className="min-h-[100px] text-right"
                dir="rtl"
              />
              <p className="text-xs text-gray-500 text-left">275 characters left</p>
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
                تعديل المحتوى
              </Button>
            </div>
          </>
        )
      case "contact-info":
        return (
          <>
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
          </>
        )
      case "social-links":
        return (
          <>
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
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Content Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="content-type" className="text-right block">
                نوع المحتوى<span className="text-red-500">*</span>
              </Label>
              <Select dir="rtl" value={contentType} onValueChange={setContentType}>
                <SelectTrigger id="content-type" className="text-right">
                  <SelectValue placeholder="اختر نوع المحتوى" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="slider-images">صور السلايدر</SelectItem>
                  <SelectItem value="homepage-text">الصفحة الرئيسية</SelectItem>
                  <SelectItem value="privacy-policy">سياسة الخصوصية</SelectItem>
                  <SelectItem value="contact-info">بيانات الاتصال</SelectItem>
                  <SelectItem value="prices-subscriptions">الأسعار والاشتراكات</SelectItem>
                  <SelectItem value="ads">الإعلانات</SelectItem>
                  <SelectItem value="social-links">الروابط الاجتماعية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderFormFields()}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
