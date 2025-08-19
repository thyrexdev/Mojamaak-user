// app/support/[id]/page.tsx

// ✅ Génère les routes statiques requises pour "output: export"
export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ]
}

// ✅ Import direct du composant client
import TicketChatClient from "./VisitCheck"

export default function TicketPage() {
  return <TicketChatClient />
}
