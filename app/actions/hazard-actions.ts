"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export async function submitHazardReport(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const severity = formData.get("severity") as string
  const location = formData.get("location") as string
  const photo = formData.get("photo") as File | null
  const video = formData.get("video") as File | null

  let photoUrl = null
  let videoUrl = null

  // Upload photo to Blob storage if provided
  if (photo && photo.size > 0) {
    const blob = await put(`hazards/${user.id}/${Date.now()}-${photo.name}`, photo, {
      access: "public",
    })
    photoUrl = blob.url
  }

  if (video && video.size > 0) {
    const blob = await put(`hazards/${user.id}/${Date.now()}-${video.name}`, video, {
      access: "public",
    })
    videoUrl = blob.url
  }

  // Insert hazard report
  const { error } = await supabase.from("hazard_reports").insert({
    user_id: user.id,
    title,
    description,
    severity,
    location,
    photo_url: photoUrl,
    video_url: videoUrl, // Added video_url field
    synced: true,
  })

  if (error) {
    throw new Error("Failed to submit hazard report")
  }

  // Award points for reporting
  const points = severity === "critical" ? 30 : severity === "warning" ? 20 : 10

  await supabase.from("points_history").insert({
    user_id: user.id,
    points,
    reason: `Reported hazard: ${title}`,
  })

  const { data: profile } = await supabase.from("profiles").select("total_points").eq("id", user.id).single()

  await supabase
    .from("profiles")
    .update({
      total_points: (profile?.total_points || 0) + points,
    })
    .eq("id", user.id)

  revalidatePath("/hazards")
  revalidatePath("/dashboard")

  return { success: true, points }
}
