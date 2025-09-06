"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UpdatePermissionsPage() {
  const { id } = useParams();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [response, setResponse] = useState<any>(null);
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
      setResponse(data);
    } catch (error) {
      setResponse({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-arabic" dir="rtl">
      <Card className="shadow-md rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            تحديث صلاحيات الإداري
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {allPermissions.map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
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

      {response && (
        <Card className="shadow-md rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg">الاستجابة</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-xl text-sm overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
