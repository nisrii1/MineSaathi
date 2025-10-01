"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardCheck, AlertTriangle, User, Mic, Video, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const mainNavItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/checklist", icon: ClipboardCheck, label: "Tasks" },
  { href: "/saathi", icon: Mic, label: "Saathi" },
  { href: "/hazards", icon: AlertTriangle, label: "Hazards" },
]

const moreNavItems = [
  { href: "/videos", icon: Video, label: "Videos" },
  { href: "/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              moreNavItems.some((item) => pathname === item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {moreNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn("flex items-center gap-3 cursor-pointer", isActive && "text-primary")}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
