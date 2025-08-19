"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, SlidersHorizontal, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  phone: string
}

interface Installment {
  id: number
  amount: string
  payment_date: string
}

interface Payment {
  id: number
  total_amount: string
  description: string
  status: string
  user: User
  installments: Installment[]
}

export default function FinancialPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `https://api.mojamaak.com/api/dashboard/complex-admin/payments?per_page=10&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const json = await res.json()
      setPayments(json.data.Payments || [])
    } catch (err) {
      console.error("Erreur lors du chargement des paiements :", err)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">إدارة الدفعات المالية</CardTitle>
            <p className="text-sm text-gray-500">تفاصيل الدفعات والأقساط الشهرية للمجمع.</p>
          </div>
          <Button
            onClick={() => router.push("/financial/add")}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> إضافة دفعة مالية جديدة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
              <SlidersHorizontal className="w-4 h-4" /> تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="بحث" className="pr-10 pl-4 py-2 w-full border-gray-300 rounded-lg text-right" dir="rtl" />
            </div>
          </div>

 <Table>
  <TableHeader>
    <TableRow className="bg-gray-50 text-sm font-semibold">
      <TableHead className="text-center w-[60px]">#</TableHead>
      <TableHead className="text-center">الساكن</TableHead>
      <TableHead className="text-center">المبلغ الكلي</TableHead>
      <TableHead className="text-center">الوصف</TableHead>
      <TableHead className="text-center">الحالة</TableHead>
      <TableHead className="text-center">الإجراءات</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {payments.map((payment, index) => (
      <React.Fragment key={payment.id}>
        <TableRow
          className="cursor-pointer hover:bg-gray-50"
          onClick={() =>
            setExpandedId(expandedId === payment.id ? null : payment.id)
          }
        >
          <TableCell className="text-center font-semibold">{index + 1}</TableCell>
          <TableCell className="text-center">{payment.user?.name}</TableCell>
          <TableCell className="text-center">{payment.total_amount} د.ت</TableCell>
          <TableCell className="text-center">{payment.description}</TableCell>
          <TableCell className="text-center">{payment.status}</TableCell>
          <TableCell className="text-center">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/financial/${payment.id}/add-installment`)
              }}
            >
              إضافة قسط
            </Button>
          </TableCell>
        </TableRow>

        {expandedId === payment.id &&
          payment.installments.map((inst) => (
            <TableRow
              key={`inst-${payment.id}-${inst.id}`}
              className="bg-gray-100 border-t border-gray-300"
            >
              <TableCell colSpan={6}>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-right space-y-1">
                    <div>المبلغ: {inst.amount} د.ت</div>
                    <div>تاريخ الدفع: {new Date(inst.payment_date).toLocaleDateString("fr-FR")}</div>
                  </div>

                  <Button variant="destructive" size="sm">
                    حذف
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </React.Fragment>
    ))}
  </TableBody>
</Table>

        </CardContent>
      </Card>
    </div>
  )
}
