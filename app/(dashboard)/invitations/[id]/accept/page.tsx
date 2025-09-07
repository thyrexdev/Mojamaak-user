"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!token || !name || !password || !passwordConfirmation) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة"
      });
      return false;
    }

    if (password !== passwordConfirmation) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقين"
      });
      return false;
    }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LOCAL}/api/invite/accept/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            password,
            password_confirmation: passwordConfirmation,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`فشل في قبول الدعوة (${res.status})`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "نجاح",
        description: "تم قبول الدعوة بنجاح"
      });

      // Navigate back to invitations list after successful acceptance
      setTimeout(() => {
        router.push("/invitations");
      }, 2000);

    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error?.message || "حدث خطأ في قبول الدعوة"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Token</label>
            <Input
              placeholder="Enter invitation token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Password Confirmation
            </label>
            <Input
              type="password"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/invitations")}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "جاري المعالجة..." : "قبول الدعوة"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
