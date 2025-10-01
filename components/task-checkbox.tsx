"use client"

import { useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { toggleTaskCompletion } from "@/app/actions/checklist-actions"
import { useRouter } from "next/navigation"
import { ConfettiEffect } from "./confetti-effect"

interface TaskCheckboxProps {
  taskId: string
  completed: boolean
}

export function TaskCheckbox({ taskId, completed }: TaskCheckboxProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setIsUpdating(true)
    try {
      await toggleTaskCompletion(taskId, !completed)
      if (!completed) {
        setShowConfetti(true)
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to toggle task:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className="shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
      >
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-success animate-scale-in" />
        ) : (
          <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>
    </>
  )
}
