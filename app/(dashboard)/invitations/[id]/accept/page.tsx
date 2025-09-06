"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AcceptInvitationPage() {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: "Something went wrong" });
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

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Response</CardTitle>
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
