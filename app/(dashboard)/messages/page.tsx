"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, SlidersHorizontal, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
  const router = useRouter()

  const messages = [
    {
      id: 1,
      sender: "نظام الإدارة",
      subject: "تحديث جديد للمنصة",
      date: "2025-03-15",
      status: "غير مقروء",
    },
    {
      id: 2,
      sender: "أحمد محمد",
      subject: "استفسار عن الصيانة",
      date: "2025-03-14",
      status: "مقروء",
    },
    {
      id: 3,
      sender: "فريق الدعم",
      subject: "رد على شكواك",
      date: "2025-03-12",
      status: "غير مقروء",
    },
  ]

  const handleAddMessageClick = () => {
    router.push("/messages/add")
  }

  const handleMarkAllAsRead = () => {
    console.log("Marking all messages as read...")
    // In a real app, you'd update the backend here
  }
  const handleViewMessage = (ticketId: number) => {
    router.push(`/messages/${ticketId}`)
  }
  return (
    <div className="p-6 font-arabic" dir="rtl">
      {/* Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">صندوق الرسائل</CardTitle>
            <p className="text-sm text-gray-500">جميع الرسائل الواردة والصادرة.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              تحديد الكل كمقروء
            </Button>
            <Button
              onClick={handleAddMessageClick}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إرسال رسالة جديدة
            </Button>
          </div>
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
                <TableHead className="text-right text-gray-700">المرسل</TableHead>
                <TableHead className="text-right text-gray-700">الموضوع</TableHead>
                <TableHead className="text-right text-gray-700">التاريخ</TableHead>
                <TableHead className="text-center text-gray-700">الحالة</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-semibold">{message.id}</TableCell>
                  <TableCell className="text-right">{message.sender}</TableCell>
                  <TableCell className="text-right">{message.subject}</TableCell>
                  <TableCell className="text-right">{message.date}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        message.status === "غير مقروء"
                          ? "bg-red-50 text-red-700 border-red-300"
                          : "bg-green-50 text-green-700 border-green-300"
                      }`}
                    >
                      {message.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                      onClick={() => handleViewMessage(message.id)}
                     >
                        عرض الرسالة
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
