"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Loader2, RefreshCcw, X } from "lucide-react"
import { toast } from "sonner"

export default function JoinRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchJoinRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/join-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) throw new Error(`فشل في جلب طلبات الانضمام (${res.status})`)

      const json = await res.json()
      setRequests(json.data || [])
    } catch (err: any) {
      console.error("خطأ في تحميل طلبات الانضمام:", err)
      toast.error(err?.message || "حدث خطأ في تحميل طلبات الانضمام")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleAction = async (id: number, status: "accepted" | "rejected") => {
    try {
      setActionLoading(id)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/join-requests/${id}/${status}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) throw new Error(`فشل تنفيذ العملية (${res.status})`)

      toast.success(status === "accepted" ? "تم قبول الطلب بنجاح" : "تم رفض الطلب")
      fetchJoinRequests()
    } catch (err: any) {
      console.error("خطأ:", err)
      toast.error(err?.message || "حدث خطأ أثناء تنفيذ العملية")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchJoinRequests()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center text-gray-600 dark:text-gray-300">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              طلبات الانضمام
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              عرض وإدارة طلبات الانضمام للمجمعات السكنية.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setRefreshing(true)
              fetchJoinRequests()
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            <span className="mr-2">تحديث</span>
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 text-sm">
                <TableHead className="text-right text-gray-700 dark:text-gray-300">الاسم</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">البريد الإلكتروني</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">الهاتف</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">المجمع</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">الوصف</TableHead>
                <TableHead className="text-right text-gray-700 dark:text-gray-300">الحالة</TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-300">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400 py-6">
                    لا توجد طلبات انضمام حالياً
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="text-right">{req.user?.name}</TableCell>
                    <TableCell className="text-right">{req.user?.email}</TableCell>
                    <TableCell className="text-right">{req.user?.phone}</TableCell>
                    <TableCell className="text-right">{req.residential_complex?.name}</TableCell>
                    <TableCell className="text-right">{req.description}</TableCell>
                    <TableCell className="text-right">
                      {req.status === "pending" ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          قيد الانتظار
                        </span>
                      ) : req.status === "accepted" ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          مقبول
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
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
                            className="text-green-600 dark:text-green-400"
                            disabled={actionLoading === req.id}
                            onClick={() => handleAction(req.id, "accepted")}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 dark:text-red-400"
                            disabled={actionLoading === req.id}
                            onClick={() => handleAction(req.id, "rejected")}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
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
