import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HazardReportForm } from "@/components/hazard-report-form"

export default async function NewHazardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="p-6">
      <HazardReportForm />
    </div>
  )
}
