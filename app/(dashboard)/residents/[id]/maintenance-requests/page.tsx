"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type MaintenanceRequest = {
  id: number
  title: string
  status: string
  assigned_at?: string
  created_at: string
  maintenance_department?: { id: number; name: string }
  maintenance_company?: { id: number; name: string }
  complex?: {
    id: number
    name: string
    building: {
      id: number
      address: string
      description: string
      apartment: {
        id: number
        number: string
        floor_number: number
      }
    }
  }
}

type Meta = {
  total?: number
  count?: number
  per_page?: number
  current_page?: number
  total_pages?: number
  next_page_url?: string | null
  prev_page_url?: string | null
}

export default function MaintenanceRequestsPage({ userId }: { userId: number }) {
  const router = useRouter()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [meta, setMeta] = useState<Meta>({})

  const fetchRequests = async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users/${userId}/maintenance-requests?per_page=${perPage}&page=${pageNum}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error(`API ${res.status} — ${await res.text()}`)

      const json = await res.json()
      const block = json?.data ?? json
      const list: MaintenanceRequest[] = block?.maintenance_requests ?? []
      const metaBlock: Meta = block?.meta ?? {
        total: list.length,
        count: list.length,
        per_page: perPage,
        current_page: pageNum,
        total_pages: 1,
      }

      setRequests(list)
      setMeta(metaBlock)
      setPage(metaBlock.current_page || pageNum)
    } catch (e: any) {
      setError(e?.message || "حدث خطأ أثناء جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canPrev = (meta.current_page ?? 1) > 1
  const canNext =
    (meta.current_page ?? 1) < (meta.total_pages ?? 1) ||
    Boolean(meta.next_page_url)

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            طلبات الصيانة
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-center py-10">جارٍ التحميل...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-sm font-semibold">
                    <TableHead className="text-center w-[60px]">#</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">الشركة</TableHead>
                    <TableHead className="text-right">الشقة</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req, idx) => (
                    <TableRow key={req.id} className="hover:bg-gray-50">
                      <TableCell className="text-center">
                        {((meta.current_page ?? 1) - 1) * (meta.per_page ?? perPage) + (idx + 1)}
                      </TableCell>
                      <TableCell className="text-right">{req.title}</TableCell>
                      <TableCell className="text-right">{req.status}</TableCell>
                      <TableCell className="text-right">
                        {req.maintenance_department?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.maintenance_company?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {req.complex?.building?.apartment?.number ?? "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(req.created_at).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/maintenance/${req.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          تفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                        لا يوجد طلبات صيانة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>
                  الصفحة {meta.current_page ?? page} من {meta.total_pages ?? 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrev}
                    onClick={() => canPrev && fetchRequests((meta.current_page ?? 1) - 1)}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNext}
                    onClick={() => canNext && fetchRequests((meta.current_page ?? 1) + 1)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
