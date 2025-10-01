import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, AlertTriangle, Trophy, TrendingUp, Mic, Database } from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/animated-counter"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  let profile = null
  let checklist = null
  let dbError = false

  try {
    // Use maybeSingle() to handle 0 rows gracefully
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle()

    if (profileError) {
      // Check if it's a "table not found" error (schema cache issue)
      if (profileError.message.includes("schema cache") || profileError.code === "PGRST205") {
        console.log("[v0] Database tables not found - need to run setup scripts")
        dbError = true
      } else {
        console.log("[v0] Profile fetch error:", profileError.message)
      }
    } else if (!profileData) {
      // Profile doesn't exist - create it now (lazy creation)
      console.log("[v0] Profile not found, creating new profile for user")
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          display_name: data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "Worker",
          language: "en",
          total_points: 0,
        })
        .select()
        .single()

      if (insertError) {
        console.log("[v0] Failed to create profile:", insertError.message)
        // If insert fails due to missing table, it's a DB setup issue
        if (insertError.message.includes("schema cache") || insertError.code === "PGRST205") {
          dbError = true
        }
      } else {
        profile = newProfile
      }
    } else {
      profile = profileData
    }
  } catch (err) {
    console.log("[v0] Profile fetch exception:", err)
    dbError = true
  }

  // Only fetch checklist if we have a valid profile and no DB errors
  if (!dbError && profile) {
    try {
      const today = new Date().toISOString().split("T")[0]
      const { data: checklistData, error: checklistError } = await supabase
        .from("daily_checklists")
        .select("*, checklist_items(*)")
        .eq("user_id", data.user.id)
        .eq("date", today)
        .maybeSingle()

      if (checklistError) {
        console.log("[v0] Checklist fetch error:", checklistError.message)
      } else {
        checklist = checklistData
      }
    } catch (err) {
      console.log("[v0] Checklist fetch exception:", err)
    }
  }

  const completedTasks = checklist?.checklist_items?.filter((item: any) => item.completed).length || 0
  const totalTasks = checklist?.checklist_items?.length || 0

  if (dbError) {
    return (
      <div className="p-6 space-y-6">
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Database className="w-6 h-6" />
              Database Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The database tables haven't been created yet. Please run the database setup script:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                Look for the <strong>setup-database.js</strong> file in the Scripts section
              </li>
              <li>Click the "Run" button (▶️) to execute the setup</li>
              <li>Wait for all migrations to complete</li>
              <li>Refresh this page once setup is done</li>
            </ol>
            <div className="flex gap-2 pt-4">
              <Button asChild>
                <Link href="/saathi">Try Saathi Assistant</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/faq">View FAQs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.display_name || "Worker"}</h1>
          <p className="text-muted-foreground mt-1">Stay safe and complete your daily tasks</p>
        </div>
        <Button size="lg" className="gap-2 hover-lift" asChild>
          <Link href="/saathi">
            <Mic className="w-5 h-5" />
            <span className="hidden sm:inline">Talk to Saathi</span>
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 hover-lift animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Points</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">
              <AnimatedCounter value={profile?.total_points || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Keep earning to unlock badges</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Today's Tasks</CardTitle>
            <ClipboardCheck className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              <AnimatedCounter value={completedTasks} />/<AnimatedCounter value={totalTasks} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTasks === 0
                ? "Generate your checklist"
                : `${Math.round((completedTasks / totalTasks) * 100)}% complete`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Hazards Reported</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              <AnimatedCounter value={0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Help keep everyone safe</p>
          </CardContent>
        </Card>

        <Card className="hover-lift animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Streak</CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success">
              <AnimatedCounter value={0} suffix=" days" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Complete tasks daily</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Daily Safety Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalTasks === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No checklist for today yet</p>
                <Button asChild className="hover-lift">
                  <Link href="/checklist">Generate AI Checklist</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {checklist?.checklist_items?.slice(0, 3).map((item: any, index: number) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-secondary rounded-lg transition-all hover:bg-secondary/80 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`w-2 h-2 rounded-full ${item.completed ? "bg-success" : "bg-muted"}`} />
                      <span
                        className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {item.task}
                      </span>
                      <Badge variant={item.priority === "high" ? "destructive" : "secondary"}>{item.priority}</Badge>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full hover-lift">
                  <Link href="/checklist">View All Tasks</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Report a Hazard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Spotted something unsafe? Report it immediately to keep everyone protected.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="flex-col h-auto py-3 bg-transparent hover-lift">
                <AlertTriangle className="w-5 h-5 mb-1 text-destructive" />
                <span className="text-xs">Critical</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto py-3 bg-transparent hover-lift">
                <AlertTriangle className="w-5 h-5 mb-1 text-accent" />
                <span className="text-xs">Warning</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto py-3 bg-transparent hover-lift">
                <AlertTriangle className="w-5 h-5 mb-1 text-muted-foreground" />
                <span className="text-xs">Minor</span>
              </Button>
            </div>
            <Button asChild className="w-full hover-lift" variant="destructive">
              <Link href="/hazards">Report Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
