import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Lock, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedCounter } from "@/components/animated-counter"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("points_required", { ascending: true })

  // Fetch user's earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", data.user.id)
    .order("earned_at", { ascending: false })

  // Fetch points history
  const { data: pointsHistory } = await supabase
    .from("points_history")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const earnedBadgeIds = new Set(earnedBadges?.map((eb: any) => eb.badge_id) || [])
  const lockedBadges = allBadges?.filter((badge: any) => !earnedBadgeIds.has(badge.id)) || []

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-muted-foreground"
      case "uncommon":
        return "text-success"
      case "rare":
        return "text-primary"
      case "epic":
        return "text-accent"
      case "legendary":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-muted"
      case "uncommon":
        return "bg-success/10"
      case "rare":
        return "bg-primary/10"
      case "epic":
        return "bg-accent/10"
      case "legendary":
        return "bg-destructive/10"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-8 h-8 text-primary" />
          Achievements
        </h1>
        <p className="text-muted-foreground mt-1">Track your progress and unlock rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 hover-lift animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Points</CardTitle>
            <Star className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">
              <AnimatedCounter value={profile?.total_points || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep earning to unlock more badges</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Badges Earned</CardTitle>
            <Trophy className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              <AnimatedCounter value={earnedBadges?.length || 0} />/<AnimatedCounter value={allBadges?.length || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(((earnedBadges?.length || 0) / (allBadges?.length || 1)) * 100)}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Next Badge</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            {lockedBadges.length > 0 ? (
              <>
                <div className="text-lg font-bold text-foreground truncate">{lockedBadges[0].name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <AnimatedCounter value={lockedBadges[0].points_required - (profile?.total_points || 0)} /> points to
                  go
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">All badges unlocked!</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6 mt-6">
          {/* Earned Badges */}
          {earnedBadges && earnedBadges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Earned Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges.map((userBadge: any, index: number) => (
                  <Card
                    key={userBadge.id}
                    className={`${getRarityBg(userBadge.badges.rarity)} hover-lift animate-scale-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center border-2 border-primary shadow-lg">
                          <Trophy className={`w-10 h-10 ${getRarityColor(userBadge.badges.rarity)}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{userBadge.badges.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {userBadge.badges.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{userBadge.badges.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Locked Badges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedBadges.map((badge: any, index: number) => (
                  <Card
                    key={badge.id}
                    className="opacity-60 hover:opacity-80 hover-lift transition-all animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-border">
                          <Lock className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{badge.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {badge.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{profile?.total_points || 0} points</span>
                            <span>{badge.points_required} required</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.min(((profile?.total_points || 0) / badge.points_required) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Points Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {pointsHistory && pointsHistory.length > 0 ? (
                <div className="space-y-3">
                  {pointsHistory.map((entry: any, index: number) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{entry.reason}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                      <div
                        className={`text-lg font-bold font-mono ${entry.points > 0 ? "text-success" : "text-destructive"}`}
                      >
                        {entry.points > 0 ? "+" : ""}
                        {entry.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No points history yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Complete tasks to start earning points</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
