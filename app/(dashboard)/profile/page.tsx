"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, User } from "lucide-react" // Changed icon from Grid3X3 to User
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const profileData = [
    {
      id: 1,
      info: "اسم المستخدم",
      value: "admin123",
      type: "text",
    },
    {
      id: 2,
      info: "البريد الإلكتروني",
      value: "admin@mogamak.com",
      type: "email",
    },
    {
      id: 3,
      info: "كلمة المرور",
      value: "********", // Placeholder for password
      actualValue: "mysecretpassword123", // Actual value for toggle
      type: "password",
    },
    {
      id: 4,
      info: "الدور الوظيفي",
      value: "سوبر ادمن",
      type: "text",
    },
    {
      id: 5,
      info: "حالة الحساب",
      value: "نشط",
      type: "text",
    },
  ]

  const handleEditProfileClick = () => {
    router.push("/profile/edit") // Navigate to the edit profile form
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      {/* Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              البروفايل
            </CardTitle>
            <p className="text-sm text-gray-500">بيانات السوبر ادمن</p>
          </div>
          <Button
            onClick={handleEditProfileClick}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            تعديل بيانات البروفايل
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 text-sm font-semibold">
                <TableHead className="text-center text-gray-700 w-[60px]">التسلسل</TableHead>
                <TableHead className="text-right text-gray-700">المعلومة</TableHead>
                <TableHead className="text-right text-gray-700">القيمة</TableHead>
                <TableHead className="text-center text-gray-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {profileData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="text-center font-semibold">{item.id}</TableCell>
                  <TableCell className="text-right">{item.info}</TableCell>
                  <TableCell className="text-right">
                    {item.type === "password" ? (showPassword ? item.actualValue : item.value) : item.value}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      {item.type === "password" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:bg-gray-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination (if needed, though usually not for a single profile) */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Page 1 of 1</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
