import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Calendar } from "lucide-react"
import { GenerateChecklistButton } from "@/components/generate-checklist-button"
import { TaskCheckbox } from "@/components/task-checkbox"
import { AnimatedCounter } from "@/components/animated-counter"

export default async function ChecklistPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Fetch today's checklist
  const today = new Date().toISOString().split("T")[0]
  const { data: checklist } = await supabase
    .from("daily_checklists")
    .select("*, checklist_items(*)")
    .eq("user_id", data.user.id)
    .eq("date", today)
    .single()

  const completedTasks = checklist?.checklist_items?.filter((item: any) => item.completed).length || 0
  const totalTasks = checklist?.checklist_items?.length || 0
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Daily Safety Checklist
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {!checklist && (
          <GenerateChecklistButton department={profile?.department} shift={profile?.shift} role={profile?.role} />
        )}
      </div>

      {/* Progress Card */}
      {checklist && (
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-3xl font-bold font-mono text-primary">
                  <AnimatedCounter value={completionPercentage} suffix="%" />
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-3xl font-bold font-mono text-foreground">
                  <AnimatedCounter value={completedTasks} />/<AnimatedCounter value={totalTasks} />
                </p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {checklist ? (
        <div className="space-y-3">
          {/* High Priority Tasks */}
          {checklist.checklist_items.filter((item: any) => item.priority === "high").length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                High Priority
              </h2>
              {checklist.checklist_items
                .filter((item: any) => item.priority === "high")
                .map((item: any, index: number) => (
                  <TaskItem key={item.id} item={item} index={index} />
                ))}
            </div>
          )}

          {/* Medium Priority Tasks */}
          {checklist.checklist_items.filter((item: any) => item.priority === "medium").length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                Medium Priority
              </h2>
              {checklist.checklist_items
                .filter((item: any) => item.priority === "medium")
                .map((item: any, index: number) => (
                  <TaskItem key={item.id} item={item} index={index} />
                ))}
            </div>
          )}

          {/* Low Priority Tasks */}
          {checklist.checklist_items.filter((item: any) => item.priority === "low").length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                Low Priority
              </h2>
              {checklist.checklist_items
                .filter((item: any) => item.priority === "low")
                .map((item: any, index: number) => (
                  <TaskItem key={item.id} item={item} index={index} />
                ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="animate-scale-in">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Sparkles className="w-16 h-16 text-primary mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Checklist Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Generate your personalized AI-powered safety checklist for today. Tasks are tailored to your role,
              department, and shift.
            </p>
            <GenerateChecklistButton department={profile?.department} shift={profile?.shift} role={profile?.role} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TaskItem({ item, index }: { item: any; index: number }) {
  return (
    <Card
      className={`hover-lift transition-all ${item.completed ? "opacity-60" : ""} animate-slide-up`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <TaskCheckbox taskId={item.id} completed={item.completed} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-semibold text-foreground transition-all ${item.completed ? "line-through" : ""}`}>
                {item.task}
              </h3>
              <Badge
                variant={
                  item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"
                }
                className="shrink-0"
              >
                {item.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-mono font-semibold text-primary">+{item.points}</span> points
              </span>
              {item.completed_at && <span>Completed {new Date(item.completed_at).toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
