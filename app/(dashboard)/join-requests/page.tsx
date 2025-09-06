"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X } from "lucide-react"

export default function JoinRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJoinRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/join-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      setRequests(json.data || [])
    } catch (err) {
      console.error("خطأ في تحميل طلبات الانضمام:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJoinRequests()
  }, [])

  if (loading) return <div className="p-6">جاري التحميل...</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">طلبات الانضمام</CardTitle>
            <p className="text-sm text-gray-500">عرض وإدارة طلبات الانضمام للمجمعات السكنية.</p>
          </div>
          <Button variant="outline" onClick={() => router.refresh()}>
            تحديث
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm">
                <TableHead className="text-right text-gray-700">الاسم</TableHead>
                <TableHead className="text-right text-gray-700">البريد الإلكتروني</TableHead>
                <TableHead className="text-right text-gray-700">الهاتف</TableHead>
                <TableHead className="text-right text-gray-700">المجمع</TableHead>
                <TableHead className="text-right text-gray-700">الوصف</TableHead>
                <TableHead className="text-right text-gray-700">الحالة</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                    لا توجد طلبات انضمام حالياً
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-right">{req.user?.name}</TableCell>
                    <TableCell className="text-right">{req.user?.email}</TableCell>
                    <TableCell className="text-right">{req.user?.phone}</TableCell>
                    <TableCell className="text-right">{req.residential_complex?.name}</TableCell>
                    <TableCell className="text-right">{req.description}</TableCell>
                    <TableCell className="text-right">
                      {req.status === "pending" ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          قيد الانتظار
                        </span>
                      ) : req.status === "accepted" ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          مقبول
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          مرفوض
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {req.status === "pending" && (
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
