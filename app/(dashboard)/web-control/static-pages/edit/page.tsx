"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditStaticPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageType = searchParams.get("type") || "homepage" // Default to homepage if no type specified

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    // Simulate fetching data based on pageType
    if (pageType === "privacy-policy") {
      setTitle("سياسة الخصوصية")
      setContent("هذا هو محتوى سياسة الخصوصية...")
    } else if (pageType === "homepage-text") {
      setTitle("الصفحة الرئيسية")
      setContent("هذا هو محتوى الصفحة الرئيسية...")
    } else {
      setTitle("عنوان الصفحة")
      setContent("محتوى الصفحة...")
    }
  }, [pageType])

  const handleSave = () => {
    console.log(`Saving static page: ${pageType}`)
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
            {/* Page Selection */}
            <div className="space-y-2">
              <Label htmlFor="static-page-select" className="text-right block">
                اختيار الصفحة<span className="text-red-500">*</span>
              </Label>
              <Select
                dir="rtl"
                value={pageType}
                onValueChange={(value) => router.push(`/web-control/static-pages/edit?type=${value}`)}
              >
                <SelectTrigger id="static-page-select" className="text-right">
                  <SelectValue placeholder="اختر الصفحة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="homepage-text">الصفحة الرئيسية</SelectItem>
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
              <Input
                id="page-title"
                placeholder="عنوان الصفحة"
                dir="rtl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
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
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
