"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { generateDailyChecklist } from "@/app/actions/checklist-actions"
import { useRouter } from "next/navigation"

interface GenerateChecklistButtonProps {
  department?: string
  shift?: string
  role?: string
}

export function GenerateChecklistButton({ department, shift, role }: GenerateChecklistButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await generateDailyChecklist({ department, shift, role })
      router.refresh()
    } catch (error) {
      console.error("Failed to generate checklist:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button size="lg" onClick={handleGenerate} disabled={isGenerating} className="gap-2 hover-lift">
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="animate-pulse">Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          Generate AI Checklist
        </>
      )}
    </Button>
  )
}
