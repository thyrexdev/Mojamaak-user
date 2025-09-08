"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, X, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function JoinRequestDetailsPage() {
  const { requestId } = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<"approved" | "rejected" | null>(null)

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/join-requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) throw new Error(`فشل في جلب تفاصيل الطلب (${res.status})`)

      const json = await res.json()
      setRequest(json.data || null)
    } catch (err: any) {
      console.error("خطأ في تحميل تفاصيل الطلب:", err)
      toast.error(err?.message || "حدث خطأ في تحميل تفاصيل الطلب")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: "approved" | "rejected") => {
    try {
      setUpdating(status)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/join-requests/${requestId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!res.ok) throw new Error(`فشل في تحديث حالة الطلب (${res.status})`)

      const json = await res.json()
      if (json.code === 200) {
        setRequest(json.data)
        toast.success(status === "approved" ? "تم قبول الطلب بنجاح" : "تم رفض الطلب")
      } else {
        throw new Error(json.message || "فشل التحديث")
      }
    } catch (err: any) {
      console.error("خطأ في تحديث الحالة:", err)
      toast.error(err?.message || "حدث خطأ في تحديث حالة الطلب")
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    if (requestId) fetchRequest()
  }, [requestId])

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center text-gray-600 dark:text-gray-300">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        جاري التحميل...
      </div>
    )

  if (!request) return <div className="p-6 text-gray-700 dark:text-gray-300">لم يتم العثور على الطلب</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            تفاصيل طلب الانضمام
          </CardTitle>
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">اسم المستخدم</p>
              <p className="font-medium dark:text-gray-100">{request.user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
              <p className="font-medium dark:text-gray-100">{request.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">رقم الهاتف</p>
              <p className="font-medium dark:text-gray-100">{request.user?.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">المجمع السكني</p>
              <p className="font-medium dark:text-gray-100">{request.residential_complex?.name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400">الوصف</p>
              <p className="font-medium dark:text-gray-100">{request.description || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">الحالة</p>
              <p>
                {request.status === "pending" ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    قيد الانتظار
                  </span>
                ) : request.status === "approved" ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    مقبول
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    مرفوض
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">تاريخ الإنشاء</p>
              <p className="font-medium dark:text-gray-100">{request.created_at}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">آخر تحديث</p>
              <p className="font-medium dark:text-gray-100">{request.updated_at}</p>
            </div>
          </div>

          {request.status === "pending" && (
            <div className="flex gap-3 pt-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                disabled={!!updating}
                onClick={() => updateStatus("approved")}
              >
                {updating === "approved" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {updating === "approved" ? "جاري القبول..." : "قبول"}
              </Button>
              <Button
                variant="destructive"
                disabled={!!updating}
                onClick={() => updateStatus("rejected")}
                className="flex items-center gap-1"
              >
                {updating === "rejected" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {updating === "rejected" ? "جاري الرفض..." : "رفض"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
