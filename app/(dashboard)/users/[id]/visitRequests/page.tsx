"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function VisitRequestsPage() {
  const { id } = useParams()
  const [requests, setRequests] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchRequests = async (page: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users/${id}/visit-requests?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      setRequests(json.data.visit_requests)
      setMeta(json.data.meta)
    } catch (err) {
      console.error("خطأ في تحميل طلبات الزيارة:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchRequests(page)
  }, [id, page])

  if (loading) return <div className="p-6">جاري التحميل...</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            طلبات الزيارة للمستخدم #{id}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {requests.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm">
                    <TableHead className="text-right text-gray-700">اسم الزائر</TableHead>
                    <TableHead className="text-right text-gray-700">الهاتف</TableHead>
                    <TableHead className="text-right text-gray-700">التاريخ</TableHead>
                    <TableHead className="text-right text-gray-700">الوقت</TableHead>
                    <TableHead className="text-right text-gray-700">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="text-right">{req.visiter_name}</TableCell>
                      <TableCell className="text-right">{req.visiter_phone}</TableCell>
                      <TableCell className="text-right">
                        {new Date(req.visit_date).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell className="text-right">{req.visit_time}</TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" && "🟡 قيد الانتظار"}
                        {req.status === "approved" && "🟢 مقبول"}
                        {req.status === "rejected" && "🔴 مرفوض"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {meta && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <span>الصفحة {meta.current_page} من {meta.total_pages}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!meta.prev_page_url}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!meta.next_page_url}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">لا توجد طلبات زيارة لهذا المستخدم.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
