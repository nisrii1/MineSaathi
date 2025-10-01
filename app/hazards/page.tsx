import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function HazardsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's hazard reports
  const { data: hazards } = await supabase
    .from("hazard_reports")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      case "minor":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-destructive"
      case "warning":
        return "text-accent"
      case "minor":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            Hazard Reports
          </h1>
          <p className="text-muted-foreground mt-1">Report and track workplace hazards</p>
        </div>
        <Button size="lg" asChild>
          <Link href="/hazards/new">
            <Plus className="w-5 h-5 mr-2" />
            Report Hazard
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Reports</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">{hazards?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Critical</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive">
              {hazards?.filter((h: any) => h.severity === "critical").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Pending</CardTitle>
            <AlertTriangle className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-accent">
              {hazards?.filter((h: any) => h.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hazard List */}
      {hazards && hazards.length > 0 ? (
        <div className="space-y-4">
          {hazards.map((hazard: any) => (
            <Card key={hazard.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {hazard.photo_url && (
                    <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={hazard.photo_url || "/placeholder.svg"}
                        alt={hazard.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${getSeverityIcon(hazard.severity)}`} />
                        <h3 className="text-xl font-bold text-foreground">{hazard.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(hazard.severity)}>{hazard.severity}</Badge>
                        <Badge variant="outline">{hazard.status}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{hazard.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {hazard.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hazard.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(hazard.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Hazards Reported</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Help keep your workplace safe by reporting any hazards you encounter.
            </p>
            <Button asChild>
              <Link href="/hazards/new">
                <Plus className="w-5 h-5 mr-2" />
                Report Your First Hazard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
