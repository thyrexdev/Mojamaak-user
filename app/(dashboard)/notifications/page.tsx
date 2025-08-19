"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, SlidersHorizontal, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const router = useRouter()

  const notifications = [
    {
      id: 1,
      title: "صيانة مجدولة للمبنى 10",
      target: "تطبيق السكان",
      date: "2025-03-10",
    },
    {
      id: 2,
      title: "تحديث الأسعار",
      target: "واجهة الويب",
      date: "2025-02-25",
    },
    {
      id: 3,
      title: "عرض جديد متاح",
      target: "تطبيق الصيانة",
      date: "2025-01-15",
    },
  ]

  const handleAddNotificationClick = () => {
    router.push("/notifications/add")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      {/* Page Title */}
      {/*
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-6 h-6 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
        </div>
      </div>
      */}

      {/* Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">الإشعارات</CardTitle>
            <p className="text-sm text-gray-500">جميع الإشعارات المرسلة للمستخدمين.</p>
          </div>
          <Button
            onClick={handleAddNotificationClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة إشعار جديد
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
              تصفية
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
                <TableHead className="text-right text-gray-700">عنوان الإشعار</TableHead>
                <TableHead className="text-right text-gray-700">الجهة المستهدفة</TableHead>
                <TableHead className="text-right text-gray-700">التاريخ</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-semibold">{notification.id}</TableCell>
                  <TableCell className="text-right">{notification.title}</TableCell>
                  <TableCell className="text-right">{notification.target}</TableCell>
                  <TableCell className="text-right">{notification.date}</TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                      >
                        إعادة إرسال
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
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
            <span>الصفحة 1 من 10</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                السابق
              </Button>
              <Button variant="outline" size="sm">
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
