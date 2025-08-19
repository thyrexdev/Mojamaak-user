"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Eye } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type UserRow = {
  id: number
  name: string
  email: string
  apartments?: Array<any>
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

export default function ResidentsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // pagination
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [meta, setMeta] = useState<Meta>({})

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("لم يتم العثور على التوكن")

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/complex-admin/users?per_page=${perPage}&page=${pageNum}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error(`API ${res.status} — ${await res.text()}`)

      const json = await res.json()
      const block = json?.data ?? json
      const list: UserRow[] = block?.users ?? block?.data ?? []
      const metaBlock: Meta = block?.meta ?? {
        total: list.length,
        count: list.length,
        per_page: perPage,
        current_page: pageNum,
        total_pages: 1,
      }

      setUsers(list)
      setMeta(metaBlock)
      setPage(metaBlock.current_page || pageNum)
    } catch (e: any) {
      setError(e?.message || "حدث خطأ أثناء جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
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
          <CardTitle className="text-lg font-semibold text-gray-900">إدارة السكان</CardTitle>
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
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="text-center">
                        {((meta.current_page ?? 1) - 1) * (meta.per_page ?? perPage) + (idx + 1)}
                      </TableCell>
                      <TableCell className="text-right">{user.name}</TableCell>
                      <TableCell className="text-right">{user.email}</TableCell>
                      <TableCell className="text-right">
                        {user.apartments?.length ? "ساكن" : "غير ساكن"}
                      </TableCell>
            <TableCell className="text-right">
  <Button
    size="sm"
    variant="outline"
                            onClick={() => router.push(`/residents/${user.id}`)}
    className="flex items-center gap-2"
  >
    <Eye className="w-4 h-4" />
    عرض التفاصيل
  </Button>
</TableCell>

                    </TableRow>
                  ))}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        لا يوجد بيانات
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>الصفحة {meta.current_page ?? page} من {meta.total_pages ?? 1}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrev}
                    onClick={() => canPrev && fetchUsers((meta.current_page ?? 1) - 1)}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNext}
                    onClick={() => canNext && fetchUsers((meta.current_page ?? 1) + 1)}
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
