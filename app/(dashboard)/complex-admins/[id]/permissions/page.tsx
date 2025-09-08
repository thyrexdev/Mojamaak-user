"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpdatePermissionsPage() {
  const { id } = useParams();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const allPermissions = [
    "manage-complex",
    "manage-complex-admins",
    "manage-maintenance-requests",
    "manage-payments",
    "manage-users",
    "manage-visit-requests",
    "manage-join-requests",
  ];

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/complex-admin/complex-admins/${id}/permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "حدث خطأ أثناء تحديث الصلاحيات");

      toast.success("تم تحديث الصلاحيات بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الصلاحيات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-arabic dark:bg-gray-900 dark:text-gray-200 min-h-screen" dir="rtl">
      <Card className="shadow-md rounded-2xl bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            تحديث صلاحيات الإداري
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allPermissions.map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-2 p-3 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">{perm}</span>
              </label>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading ? "جاري التحديث..." : "تحديث الصلاحيات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
