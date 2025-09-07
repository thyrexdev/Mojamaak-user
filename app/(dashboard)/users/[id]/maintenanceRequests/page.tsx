"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function MaintenanceRequestsPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const [requests, setRequests] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchRequests = async (page: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم يتم العثور على رمز الدخول"
        })
        return
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/users/${id}/maintenance-requests?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل طلبات الصيانة"
        })
        return
      }

      const json = await res.json()
      setRequests(json.data.maintenance_requests)
      setMeta(json.data.meta)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء تحميل طلبات الصيانة"
      })
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
            طلبات الصيانة للمستخدم #{id}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {requests.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm">
                    <TableHead className="text-right text-gray-700">العنوان</TableHead>
                    <TableHead className="text-right text-gray-700">الحالة</TableHead>
                    <TableHead className="text-right text-gray-700">الوحدة</TableHead>
                    <TableHead className="text-right text-gray-700">المبنى</TableHead>
                    <TableHead className="text-right text-gray-700">القسم</TableHead>
                    <TableHead className="text-right text-gray-700">الشركة</TableHead>
                    <TableHead className="text-right text-gray-700">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="text-right">{req.title}</TableCell>
                      <TableCell className="text-right">
                        {req.status === "pending" && "🟡 قيد الانتظار"}
                        {req.status === "in_progress" && "🔵 جاري التنفيذ"}
                        {req.status === "completed" && "🟢 مكتمل"}
                        {req.status === "canceled" && "🔴 ملغي"}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.complex?.building?.apartment?.number} (دور {req.complex?.building?.apartment?.floor_number})
                      </TableCell>
                      <TableCell className="text-right">{req.complex?.building?.address}</TableCell>
                      <TableCell className="text-right">{req.maintenance_department?.name}</TableCell>
                      <TableCell className="text-right">{req.maintenance_company?.name}</TableCell>
                      <TableCell className="text-right">
                        {new Date(req.created_at).toLocaleDateString("ar-EG")}
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
            <p className="text-gray-500">لا توجد طلبات صيانة لهذا المستخدم.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
