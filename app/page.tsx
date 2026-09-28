import { connection } from "next/server"
import { Dashboard } from "@/components/twin/dashboard"
import { toISODate } from "@/lib/twin"

export default async function Page() {
  await connection()
  return <Dashboard todayISO={toISODate(new Date())} />
}
