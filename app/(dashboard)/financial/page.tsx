"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ...existing interfaces...

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Installment {
  id: number;
  amount: string;
  payment_date: string;
}

interface Payment {
  id: number;
  total_amount: string;
  description: string;
  status: string;
  user: User;
  installments: Installment[];
}

const searchSchema = z.object({
  query: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export default function FinancialPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { register, handleSubmit } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
  });

  const fetchPayments = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لم يتم العثور على التوكن");
      }

      const searchParam = searchQuery ? `&search=${searchQuery}` : "";
      const res = await fetch(
        `https://api.mojamaak.com/api/dashboard/complex-admin/payments?per_page=10&page=1${searchParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`فشل في جلب الدفعات المالية (${res.status})`);
      }

      const json = await res.json();
      if (!json.data?.Payments) {
        throw new Error("لم يتم العثور على بيانات الدفعات");
      }

      setPayments(json.data.Payments);
    } catch (err: any) {
      console.error("خطأ في تحميل الدفعات:", err);
      toast.error("خطأ", {
        description: err?.message || "حدث خطأ في تحميل الدفعات المالية",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSearch = handleSubmit((data) => {
    fetchPayments(data.query);
  });

  const handleDeleteInstallment = async (
    paymentId: number,
    installmentId: number
  ) => {
    try {
      setIsDeleting(installmentId);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("لم يتم العثور على التوكن");

      const res = await fetch(
        `https://api.mojamaak.com/api/dashboard/complex-admin/payments/${paymentId}/installments/${installmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("فشل في حذف القسط");

      toast.success("تم حذف القسط بنجاح");
      fetchPayments();
    } catch (err: any) {
      toast.error("خطأ في حذف القسط", {
        description: err.message,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-6 text-center font-arabic">
        <p className="text-gray-500 dark:text-gray-400">
          لا توجد دفعات مالية حالياً
        </p>
        <Button onClick={() => router.push("/financial/add")} className="mt-4">
          <Plus className="w-4 h-4 ml-2" />
          إضافة دفعة مالية جديدة
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              إدارة الدفعات المالية
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تفاصيل الدفعات والأقساط الشهرية للمجمع.
            </p>
          </div>
          <Button
            onClick={() => router.push("/financial/add")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 ml-2" /> إضافة دفعة مالية جديدة
          </Button>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form
            onSubmit={onSearch}
            className="flex items-center justify-between mb-4 gap-4"
          >
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              <SlidersHorizontal className="w-4 h-4" /> تصفية
            </Button>
            <div className="relative flex-grow">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                {...register("query")}
                placeholder="بحث"
                className="pr-10 pl-4 py-2 w-full border-gray-300 dark:border-gray-600 rounded-lg text-right dark:bg-gray-700 dark:text-gray-100"
                dir="rtl"
              />
            </div>
          </form>

          <div className="rounded-md border dark:border-gray-700">
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
              </TableHeader>{" "}
              <TableBody className="dark:bg-gray-800">
                {payments.map((payment, index) => (
                  <React.Fragment key={payment.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => router.push(`/financial/${payment.id}`)}
                    >
                      <TableCell className="text-center font-semibold dark:text-gray-200">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.user?.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.total_amount} د.ت
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.status}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/financial/${payment.id}/add-installment`
                            );
                          }}
                          className="dark:border-gray-600 dark:text-gray-200"
                        >
                          إضافة قسط
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedId === payment.id &&
                      payment.installments.map((inst) => (
                        <TableRow
                          key={`inst-${payment.id}-${inst.id}`}
                          className="bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600"
                        >
                          <TableCell colSpan={6}>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-right space-y-1 dark:text-gray-300">
                                <div>المبلغ: {inst.amount} د.ت</div>
                                <div>
                                  تاريخ الدفع:{" "}
                                  {new Date(
                                    inst.payment_date
                                  ).toLocaleDateString("fr-FR")}
                                </div>
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteInstallment(payment.id, inst.id)
                                }
                                disabled={isDeleting === inst.id}
                              >
                                {isDeleting === inst.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                ) : (
                                  "حذف"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
