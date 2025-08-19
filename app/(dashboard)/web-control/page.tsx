"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, SlidersHorizontal, Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export default function WebControlPage() {
  const router = useRouter()

  const contentItems = [
    {
      id: 1,
      type: "صور السلايدر",
      description: "إدارة الصور المتحركة في الصفحة الرئيسية",
      lastModified: "2025-03-10",
      route: "/web-control/slider-images/edit",
    },
    {
      id: 2,
      type: "الصفحة الرئيسية",
      description: "تعديل نصوص وعناصر الصفحة الرئيسية",
      lastModified: "2025-03-10",
      route: "/web-control/static-pages/edit?type=homepage-text",
    },
    {
      id: 3,
      type: "سياسة الخصوصية",
      description: "تعديل نصوص سياسة الخصوصية والشروط القانونية",
      lastModified: "2025-03-10",
      route: "/web-control/static-pages/edit?type=privacy-policy",
    },
    {
      id: 4,
      type: "صفحة اتصل بنا",
      description: "تحديث بيانات الاتصال والعنوان والبريد الإلكتروني",
      lastModified: "2025-03-10",
      route: "/web-control/contact-info/edit",
    },
    {
      id: 5,
      type: "صفحة الأسعار والاشتراكات",
      description: "تعديل تفاصيل الاشتراكات والعروض",
      lastModified: "2025-03-10",
      route: "/web-control/prices-subscriptions/edit",
    },
    {
      id: 6,
      type: "الإعلانات",
      description: "إدارة الإعلانات التي تظهر داخل الموقع",
      lastModified: "2025-03-10",
      route: "/web-control/ads/edit",
    },
    {
      id: 7,
      type: "الروابط الاجتماعية",
      description: "تحديث روابط التواصل الاجتماعي الخاصة بالنظام",
      lastModified: "2025-03-10",
      route: "/web-control/social-links/edit",
    },
  ]

  const handleAddContentClick = () => {
    router.push("/web-control/add") // This still goes to the dynamic add form
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      {/* Page Title */}

      {/* Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">التحكم بواجهة الويب</CardTitle>
            <p className="text-sm text-gray-500">تعديل صفحات الموقع الرئيسية والمحتوى الثابت.</p>
          </div>
          <Button
            onClick={handleAddContentClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة محتوى جديد
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Search & Filters */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 w-[60px]">التسلسل</TableHead>
                <TableHead className="text-right text-gray-700">نوع المحتوى</TableHead>
                <TableHead className="text-right text-gray-700">الوصف</TableHead>
                <TableHead className="text-center text-gray-700">آخر تعديل</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {contentItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-semibold">{item.id}</TableCell>
                  <TableCell className="text-right">{item.type}</TableCell>
                  <TableCell className="text-right">{item.description}</TableCell>
                  <TableCell className="text-center">{item.lastModified}</TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(item.route)}
                        className="text-gray-500 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Page 1 of 10</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
