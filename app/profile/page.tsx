import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Globe, Trophy, Calendar, Shield } from "lucide-react"
import { ProfileEditForm } from "@/components/profile-edit-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch profile with lazy creation
  let profile = null
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle()

  if (!profileData && !profileError) {
    // Create profile if it doesn't exist
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        display_name: data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "Worker",
        language: "en",
        total_points: 0,
      })
      .select()
      .single()

    profile = newProfile
  } else {
    profile = profileData
  }

  // Fetch user stats
  const { data: badges } = await supabase.from("user_badges").select("*, badges(*)").eq("user_id", data.user.id)

  const { data: hazards } = await supabase.from("hazards").select("id").eq("reported_by", data.user.id)

  const { data: checklists } = await supabase
    .from("daily_checklists")
    .select("id, completed_at")
    .eq("user_id", data.user.id)
    .not("completed_at", "is", null)

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      en: "English",
      hi: "हिंदी (Hindi)",
      bn: "বাংলা (Bengali)",
      ta: "தமிழ் (Tamil)",
      te: "తెలుగు (Telugu)",
      mr: "मराठी (Marathi)",
    }
    return labels[lang] || "English"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-lg">Manage your account and view your safety achievements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">{profile?.display_name || "Worker"}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{data.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">{getLanguageLabel(profile?.language || "en")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <ProfileEditForm
                  userId={data.user.id}
                  currentName={profile?.display_name || ""}
                  currentLanguage={profile?.language || "en"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Earned Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((userBadge: any) => (
                    <div
                      key={userBadge.id}
                      className="flex flex-col items-center gap-2 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <div className="text-4xl">{userBadge.badges.icon}</div>
                      <div className="text-center">
                        <p className="font-semibold text-sm">{userBadge.badges.name}</p>
                        <p className="text-xs text-muted-foreground">{userBadge.badges.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No badges earned yet</p>
                  <p className="text-sm mt-1">Complete tasks and report hazards to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{profile?.total_points || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">Keep earning to unlock more badges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Safety Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hazards Reported</span>
                <Badge variant="secondary">{hazards?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Checklists Completed</span>
                <Badge variant="secondary">{checklists?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Badges Earned</span>
                <Badge variant="secondary">{badges?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Member since</span>
                <p className="font-medium">{new Date(data.user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last sign in</span>
                <p className="font-medium">
                  {data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
