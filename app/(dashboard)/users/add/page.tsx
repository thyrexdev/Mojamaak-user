"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export default function AddUserPage() {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = (document.getElementById("name") as HTMLInputElement).value
    const email = (document.getElementById("email") as HTMLInputElement).value
    const read = (document.getElementById("read") as HTMLInputElement).checked
    const write = (document.getElementById("write") as HTMLInputElement).checked
    const del = (document.getElementById("delete") as HTMLInputElement).checked

    const newUser = {
      name,
      email,
      permissions: [
        ...(read ? ["read"] : []),
        ...(write ? ["write"] : []),
        ...(del ? ["delete"] : []),
      ],
    }

    console.log("User added:", newUser)
    router.push("/users")
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-right">اسم المستخدم<span className="text-red-500">*</span></Label>
              <Input id="name" placeholder="أدخل الاسم الكامل" dir="rtl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-right">البريد الإلكتروني<span className="text-red-500">*</span></Label>
              <Input id="email" type="email" placeholder="user@example.com" dir="rtl" required />
            </div>
            <div className="space-y-2">
              <Label className="block text-right">الصلاحيات</Label>
              <div className="flex gap-4 justify-start">
                <div className="flex items-center gap-2">
                  <Checkbox id="read" />
                  <Label htmlFor="read">قراءة</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="write" />
                  <Label htmlFor="write">تعديل</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="delete" />
                  <Label htmlFor="delete">حذف</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/users")}>إلغاء</Button>
              <Button type="submit" className="bg-primary-500 text-white hover:bg-primary-600">إضافة المستخدم</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
