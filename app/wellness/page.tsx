import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Heart, Brain, Activity, Moon, Droplets, Apple, Phone, AlertCircle, TrendingUp, Calendar } from "lucide-react"

export default function WellnessPage() {
  const wellnessMetrics = [
    {
      icon: Heart,
      title: "Physical Health",
      value: 85,
      status: "Good",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      tips: ["Regular exercise", "Proper lifting techniques", "Stretching before shifts"],
    },
    {
      icon: Brain,
      title: "Mental Wellness",
      value: 72,
      status: "Fair",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      tips: ["Take regular breaks", "Talk to colleagues", "Use stress management techniques"],
    },
    {
      icon: Moon,
      title: "Sleep Quality",
      value: 68,
      status: "Needs Attention",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      tips: ["Maintain sleep schedule", "Avoid caffeine before bed", "Create dark, quiet environment"],
    },
    {
      icon: Droplets,
      title: "Hydration",
      value: 90,
      status: "Excellent",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      tips: ["Drink water every hour", "Monitor urine color", "Increase intake in hot conditions"],
    },
  ]

  const emergencyContacts = [
    { name: "Emergency Services", number: "112", icon: AlertCircle, color: "text-red-500" },
    { name: "Medical Emergency", number: "108", icon: Heart, color: "text-pink-500" },
    { name: "Mental Health Helpline", number: "1800-599-0019", icon: Brain, color: "text-blue-500" },
    { name: "Mine Safety Officer", number: "Contact Supervisor", icon: Phone, color: "text-orange-500" },
  ]

  const wellnessTips = [
    {
      category: "Physical Health",
      icon: Activity,
      tips: [
        "Perform stretching exercises before and after shifts",
        "Use proper lifting techniques - bend knees, not back",
        "Take micro-breaks every 30 minutes to prevent fatigue",
        "Report any pain or discomfort immediately",
        "Maintain good posture while working",
      ],
    },
    {
      category: "Nutrition",
      icon: Apple,
      tips: [
        "Eat balanced meals with protein, carbs, and vegetables",
        "Pack healthy snacks for your shift",
        "Avoid heavy meals that cause drowsiness",
        "Limit caffeine and energy drinks",
        "Stay hydrated - drink water regularly",
      ],
    },
    {
      category: "Mental Health",
      icon: Brain,
      tips: [
        "Talk to someone if you're feeling stressed or anxious",
        "Practice deep breathing exercises during breaks",
        "Maintain work-life balance",
        "Get adequate sleep between shifts",
        "Don't hesitate to seek professional help",
      ],
    },
    {
      category: "Sleep & Recovery",
      icon: Moon,
      tips: [
        "Aim for 7-8 hours of sleep per day",
        "Keep a consistent sleep schedule",
        "Create a dark, quiet sleeping environment",
        "Avoid screens 1 hour before bed",
        "Use blackout curtains for day sleeping",
      ],
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Heart className="w-10 h-10 text-pink-500" />
          <h1 className="text-4xl font-bold text-foreground">Wellness Center</h1>
        </div>
        <p className="text-muted-foreground text-lg">Monitor your health and access wellness resources</p>
      </div>

      {/* Wellness Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wellnessMetrics.map((metric, idx) => (
          <Card key={idx} className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <Badge variant={metric.value >= 80 ? "default" : metric.value >= 60 ? "secondary" : "destructive"}>
                  {metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{metric.title}</CardTitle>
                  <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
              <div className="space-y-1">
                {metric.tips.map((tip, tipIdx) => (
                  <p key={tipIdx} className="text-xs text-muted-foreground">
                    • {tip}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Contacts */}
      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-6 h-6" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <contact.icon className={`w-8 h-8 ${contact.color}`} />
                <div>
                  <p className="font-semibold text-sm text-foreground">{contact.name}</p>
                  <p className={`text-lg font-bold ${contact.color}`}>{contact.number}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wellness Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wellnessTips.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="w-6 h-6 text-primary" />
                {section.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.tips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="w-4 h-4" />
            Schedule Health Checkup
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Brain className="w-4 h-4" />
            Mental Health Resources
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Activity className="w-4 h-4" />
            Log Physical Activity
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <TrendingUp className="w-4 h-4" />
            View Wellness History
          </Button>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Heart className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Your Health Matters</h3>
              <p className="text-muted-foreground mb-3">
                Regular wellness monitoring helps prevent injuries and ensures you're fit for work. If you're
                experiencing any health concerns, don't hesitate to speak with your supervisor or contact medical
                services.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> It's always better to report health concerns early than to risk injury or
                illness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
