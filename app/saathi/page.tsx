import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VoiceAssistant } from "@/components/voice-assistant"

export default async function SaathiPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen">
      <VoiceAssistant defaultLanguage={profile?.language || "en"} />
    </div>
  )
}
