"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function InvitationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/invitations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      setInvitation(json.data)
    } catch (err) {
      console.error("خطأ في تحميل الدعوة:", err)
    } finally {
      setLoading(false)
    }
  }

  const cancelInvitation = async () => {
    try {
      setCanceling(true)
      const token = localStorage.getItem("token")
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/invitations/${id}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const json = await res.json()
      setInvitation(json.data)
    } catch (err) {
      console.error("خطأ في إلغاء الدعوة:", err)
    } finally {
      setCanceling(false)
    }
  }

  useEffect(() => {
    if (id) fetchInvitation()
  }, [id])

  if (loading) return <div className="p-6">جاري التحميل...</div>
  if (!invitation) return <div className="p-6">لم يتم العثور على الدعوة</div>

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              تفاصيل الدعوة
            </CardTitle>
            <p className="text-sm text-gray-500">
              عرض بيانات الدعوة والتحكم في حالتها.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/complex-admin/invitations")}
          >
            رجوع للقائمة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <div>
            <h2 className="text-lg font-bold">{invitation.email}</h2>
            <p className="text-sm text-gray-600">
              الحالة:{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  invitation.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : invitation.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : invitation.status === "canceled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {invitation.status}
              </span>
            </p>
          </div>

          <div className="border p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>المجمع:</strong>{" "}
              {invitation.residential_complex?.name || "-"}
            </p>
            <p className="text-sm text-gray-500">
              <strong>تاريخ الإنشاء:</strong>{" "}
              {new Date(invitation.created_at).toLocaleString("ar-EG")}
            </p>
            <p className="text-sm text-gray-500">
              <strong>ينتهي في:</strong>{" "}
              {new Date(invitation.expires_at).toLocaleString("ar-EG")}
            </p>
          </div>

          {invitation.status !== "canceled" && (
            <Button
              variant="destructive"
              onClick={cancelInvitation}
              disabled={canceling}
            >
              {canceling ? "جاري الإلغاء..." : "إلغاء الدعوة"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
