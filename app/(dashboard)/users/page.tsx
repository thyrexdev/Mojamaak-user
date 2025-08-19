"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2,Search, SlidersHorizontal} from "lucide-react"
import { Input } from "@/components/ui/input"

const users = [
  { id: 1, name: "أحمد علي", email: "ahmed@example.com", role: "مدير", permissions: ["read", "write", "delete"] },
  { id: 2, name: "سارة محمد", email: "sara@example.com", role: "مشرف", permissions: ["read"] },
]

export default function UsersPage() {
  const router = useRouter()

  const handleAddUser = () => router.push("/users/add")

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">إدارة المستخدمين</CardTitle>
            <p className="text-sm text-gray-500">عرض وتعديل صلاحيات المستخدمين.</p>
          </div>
          <Button
            onClick={handleAddUser}
        className="bg-primary-500 text-white hover:bg-primary-600">
            <Plus className="w-4 h-4" />
           إضافة مستخدم
          </Button>
        </CardHeader>

  <CardContent className="p-6 pt-0">
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
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm">
                <TableHead className="text-right text-gray-700 ">الاسم</TableHead>
                <TableHead className="text-right text-gray-700">البريد الإلكتروني</TableHead>
                <TableHead className="text-right text-gray-700">الصلاحيات</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-right">{user.name}</TableCell>
                  <TableCell className="text-right">{user.email}</TableCell>
                  <TableCell className="text-right">
                    {user.permissions.includes("read") && "قراءة "}
                    {user.permissions.includes("write") && "تعديل "}
                    {user.permissions.includes("delete") && "حذف "}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
