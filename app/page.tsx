import { connection } from "next/server"
import { AppShell } from "@/components/twin/app-shell"
import { toISODate } from "@/lib/twin"

export default async function Page() {
  await connection()
  return <AppShell todayISO={toISODate(new Date())} />
}
