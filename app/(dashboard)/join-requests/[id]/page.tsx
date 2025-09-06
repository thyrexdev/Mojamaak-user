"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export default function JoinRequestDetailsPage() {
  const { requestId } = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/join-requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      setRequest(json.data || null)
    } catch (err) {
      console.error("خطأ في تحميل تفاصيل الطلب:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: "approved" | "rejected") => {
    try {
      setUpdating(true)
      const token = localStorage.getItem("token")
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
      const json = await res.json()
      if (json.code === 200) {
        setRequest(json.data)
      } else {
        console.error("فشل التحديث:", json.message)
      }
    } catch (err) {
      console.error("خطأ في تحديث الحالة:", err)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (requestId) fetchRequest()
  }, [requestId])

  if (loading) return <div className="p-6">جاري التحميل...</div>
  if (!request) return <div className="p-6">لم يتم العثور على الطلب</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            تفاصيل طلب الانضمام
          </CardTitle>
          <Button variant="outline" onClick={() => router.back()}>
            رجوع
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">اسم المستخدم</p>
              <p className="font-medium">{request.user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">البريد الإلكتروني</p>
              <p className="font-medium">{request.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">رقم الهاتف</p>
              <p className="font-medium">{request.user?.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">المجمع السكني</p>
              <p className="font-medium">{request.residential_complex?.name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">الوصف</p>
              <p className="font-medium">{request.description || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">الحالة</p>
              <p>
                {request.status === "pending" ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                    قيد الانتظار
                  </span>
                ) : request.status === "approved" ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    مقبول
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    مرفوض
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-500">تاريخ الإنشاء</p>
              <p className="font-medium">{request.created_at}</p>
            </div>
            <div>
              <p className="text-gray-500">آخر تحديث</p>
              <p className="font-medium">{request.updated_at}</p>
            </div>
          </div>

          {request.status === "pending" && (
            <div className="flex gap-3 pt-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={updating}
                onClick={() => updateStatus("approved")}
              >
                <Check className="w-4 h-4 mr-1" /> {updating ? "جاري..." : "قبول"}
              </Button>
              <Button
                variant="destructive"
                disabled={updating}
                onClick={() => updateStatus("rejected")}
              >
                <X className="w-4 h-4 mr-1" /> {updating ? "جاري..." : "رفض"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
