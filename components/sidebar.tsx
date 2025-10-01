"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  ClipboardCheck,
  AlertTriangle,
  Trophy,
  User,
  Shield,
  Heart,
  Phone,
  Mic,
  HelpCircle,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/checklist", icon: ClipboardCheck, label: "Daily Tasks" },
  { href: "/saathi", icon: Mic, label: "Voice Assistant" },
  { href: "/hazards", icon: AlertTriangle, label: "Report Hazard" },
  { href: "/videos", icon: Video, label: "Safety Videos" },
  { href: "/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/wellness", icon: Heart, label: "Wellness" },
  { href: "/emergency", icon: Phone, label: "Emergency" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">MineSaathi</h1>
          <p className="text-xs text-muted-foreground">Safety Companion</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">Safety Tip</p>
          <p className="text-sm text-foreground">Always wear your PPE in designated areas</p>
        </div>
      </div>
    </aside>
  )
}
