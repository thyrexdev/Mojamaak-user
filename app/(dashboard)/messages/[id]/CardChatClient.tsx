"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, SendHorizontal } from "lucide-react"

export default function ChatClient() {
  const { id } = useParams()
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("الرسالة:", message)
    console.log("الملف المرفق:", file)
  }

  return (
    <div className="p-6 font-arabic" dir="rtl">
      <Card className="bg-white shadow-sm max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            محادثة رقم {id}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Zone des messages */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto p-4 border rounded-lg bg-gray-50">
            <div className="text-right bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                مرحبًا، هل يمكنك مساعدتي في تعديل البيانات؟
              </p>
              <p className="text-xs text-gray-400 mt-1">منك - 09:30 صباحاً</p>
            </div>

            <div className="text-left bg-primary-100 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                نعم بالتأكيد، فقط أخبرني ما الذي تريد تعديله بالضبط.
              </p>
              <p className="text-xs text-gray-400 mt-1">من الطرف الآخر - 09:45 صباحاً</p>
            </div>
          </div>

          {/* Formulaire d'envoi */}
          <form className="space-y-2 pt-2" onSubmit={handleSend}>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="text-right"
              dir="rtl"
              rows={3}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Upload fichier */}
              <label className="relative inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer border border-dashed border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {file ? file.name : "إرفاق ملف (PDF أو صورة)"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>

              {/* Bouton envoyer */}
              <Button
                type="submit"
                className="bg-primary-500 text-white hover:bg-primary-600 w-full sm:w-auto flex items-center gap-2"
              >
                إرسال
                <SendHorizontal className="w-4 h-4 transform rotate-180" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
