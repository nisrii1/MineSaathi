"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface ChecklistTask {
  task: string
  description: string
  priority: "low" | "medium" | "high"
  points: number
}

const taskTemplates: Record<string, ChecklistTask[]> = {
  general: [
    {
      task: "Inspect Personal Protective Equipment (PPE)",
      description: "Check hard hat for cracks, ensure safety boots are in good condition, verify gloves are intact",
      priority: "high",
      points: 20,
    },
    {
      task: "Verify Emergency Equipment Accessibility",
      description: "Confirm fire extinguishers are accessible, check first aid kit location, test emergency alarm",
      priority: "high",
      points: 25,
    },
    {
      task: "Conduct Work Area Hazard Assessment",
      description: "Identify potential hazards, check for proper lighting, ensure clear emergency exits",
      priority: "high",
      points: 30,
    },
    {
      task: "Test Communication Devices",
      description: "Verify radio/phone is charged and working, confirm emergency contact numbers are saved",
      priority: "medium",
      points: 15,
    },
    {
      task: "Review Daily Safety Briefing",
      description: "Attend or review shift safety briefing, note any special hazards or procedures for the day",
      priority: "medium",
      points: 20,
    },
    {
      task: "Inspect Tools and Equipment",
      description:
        "Check all tools for damage, ensure equipment is properly maintained, verify safety guards are in place",
      priority: "high",
      points: 25,
    },
    {
      task: "Hydration and Wellness Check",
      description: "Ensure adequate water supply, assess personal fitness for work, report any health concerns",
      priority: "medium",
      points: 15,
    },
  ],
  mining: [
    {
      task: "Gas Detection Equipment Check",
      description: "Test gas detector functionality, verify calibration date, ensure alarm is audible",
      priority: "high",
      points: 30,
    },
    {
      task: "Ventilation System Verification",
      description:
        "Check air flow in work area, verify ventilation fans are operating, report any air quality concerns",
      priority: "high",
      points: 25,
    },
    {
      task: "Ground Support Inspection",
      description:
        "Check roof bolts and supports, look for loose rocks or unstable ground, report any concerns immediately",
      priority: "high",
      points: 30,
    },
    {
      task: "Lighting System Check",
      description: "Test cap lamp battery and brightness, verify backup lighting is available, check area lighting",
      priority: "medium",
      points: 20,
    },
    {
      task: "Escape Route Verification",
      description:
        "Identify primary and secondary escape routes, ensure routes are clear and marked, locate refuge chambers",
      priority: "high",
      points: 25,
    },
  ],
  maintenance: [
    {
      task: "Lockout/Tagout Procedure Review",
      description: "Verify LOTO procedures for equipment, ensure tags and locks are available, confirm authorization",
      priority: "high",
      points: 30,
    },
    {
      task: "Electrical Safety Check",
      description: "Inspect cables for damage, verify grounding, test GFCIs, ensure proper voltage ratings",
      priority: "high",
      points: 25,
    },
    {
      task: "Confined Space Entry Preparation",
      description: "If applicable: test atmosphere, verify ventilation, ensure rescue equipment is ready",
      priority: "high",
      points: 30,
    },
    {
      task: "Tool and Equipment Calibration",
      description:
        "Verify calibration dates on measuring tools, check torque wrench settings, ensure proper tool selection",
      priority: "medium",
      points: 20,
    },
  ],
  operations: [
    {
      task: "Vehicle/Equipment Pre-Start Inspection",
      description: "Check fluid levels, test brakes and steering, verify lights and horn, inspect tires/tracks",
      priority: "high",
      points: 25,
    },
    {
      task: "Load Securing and Weight Verification",
      description: "Ensure loads are properly secured, verify weight limits, check load distribution",
      priority: "high",
      points: 25,
    },
    {
      task: "Traffic Management Plan Review",
      description: "Review designated routes, check for traffic controllers, verify speed limits and signage",
      priority: "medium",
      points: 20,
    },
    {
      task: "Spill Prevention Check",
      description: "Verify spill kits are available, check containment systems, ensure proper storage of materials",
      priority: "medium",
      points: 20,
    },
  ],
}

export async function generateDailyChecklist(context?: {
  department?: string
  shift?: string
  role?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get user profile for context
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const today = new Date().toISOString().split("T")[0]

  // Check if checklist already exists for today
  const { data: existingChecklist } = await supabase
    .from("daily_checklists")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  if (existingChecklist) {
    return { success: true, message: "Checklist already exists for today" }
  }

  const role = context?.role || profile?.role || "worker"
  const department = context?.department || profile?.department || "general"
  const shift = context?.shift || "day"

  let tasks: ChecklistTask[]

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a mining safety expert. Generate a daily safety checklist for mine workers. Return ONLY valid JSON array with 6-7 tasks. Each task must have: task (string), description (string), priority ("low"|"medium"|"high"), points (number 10-30).`,
          },
          {
            role: "user",
            content: `Generate a safety checklist for: Role: ${role}, Department: ${department}, Shift: ${shift}. Focus on mining-specific safety tasks.`,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      const parsed = JSON.parse(content)
      tasks = parsed.tasks || parsed.checklist || Object.values(parsed)[0]
    } else {
      // Fallback to template if API fails
      tasks = generateChecklistForRole(role, department)
    }
  } catch (error) {
    console.error("[v0] Checklist generation error:", error)
    // Fallback to template
    tasks = generateChecklistForRole(role, department)
  }

  // Create checklist in database
  const { data: checklist, error: checklistError } = await supabase
    .from("daily_checklists")
    .insert({
      user_id: user.id,
      date: today,
      context: context || {},
    })
    .select()
    .single()

  if (checklistError) {
    throw new Error("Failed to create checklist")
  }

  // Insert checklist items
  const items = tasks.map((task) => ({
    checklist_id: checklist.id,
    task: task.task,
    description: task.description,
    priority: task.priority,
    points: task.points,
  }))

  const { error: itemsError } = await supabase.from("checklist_items").insert(items)

  if (itemsError) {
    throw new Error("Failed to create checklist items")
  }

  revalidatePath("/checklist")
  revalidatePath("/dashboard")

  return { success: true, message: "Checklist generated successfully" }
}

function generateChecklistForRole(role: string, department: string): ChecklistTask[] {
  const taskTemplates: Record<string, ChecklistTask[]> = {
    general: [
      {
        task: "Inspect Personal Protective Equipment (PPE)",
        description: "Check hard hat for cracks, ensure safety boots are in good condition, verify gloves are intact",
        priority: "high",
        points: 20,
      },
      {
        task: "Verify Emergency Equipment Accessibility",
        description: "Confirm fire extinguishers are accessible, check first aid kit location, test emergency alarm",
        priority: "high",
        points: 25,
      },
      {
        task: "Conduct Work Area Hazard Assessment",
        description: "Identify potential hazards, check for proper lighting, ensure clear emergency exits",
        priority: "high",
        points: 30,
      },
      {
        task: "Test Communication Devices",
        description: "Verify radio/phone is charged and working, confirm emergency contact numbers are saved",
        priority: "medium",
        points: 15,
      },
      {
        task: "Review Daily Safety Briefing",
        description: "Attend or review shift safety briefing, note any special hazards or procedures for the day",
        priority: "medium",
        points: 20,
      },
    ],
    mining: [
      {
        task: "Gas Detection Equipment Check",
        description: "Test gas detector functionality, verify calibration date, ensure alarm is audible",
        priority: "high",
        points: 30,
      },
      {
        task: "Ventilation System Verification",
        description:
          "Check air flow in work area, verify ventilation fans are operating, report any air quality concerns",
        priority: "high",
        points: 25,
      },
      {
        task: "Ground Support Inspection",
        description:
          "Check roof bolts and supports, look for loose rocks or unstable ground, report any concerns immediately",
        priority: "high",
        points: 30,
      },
      {
        task: "Lighting System Check",
        description: "Test cap lamp battery and brightness, verify backup lighting is available, check area lighting",
        priority: "medium",
        points: 20,
      },
      {
        task: "Escape Route Verification",
        description:
          "Identify primary and secondary escape routes, ensure routes are clear and marked, locate refuge chambers",
        priority: "high",
        points: 25,
      },
    ],
  }

  const generalTasks = taskTemplates.general
  const roleTasks = taskTemplates[department.toLowerCase()] || []
  const allTasks = [...generalTasks, ...roleTasks]
  const shuffled = allTasks.sort(() => Math.random() - 0.5)

  return shuffled.slice(0, 6)
}

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get task details
  const { data: task } = await supabase
    .from("checklist_items")
    .select("*, daily_checklists(user_id)")
    .eq("id", taskId)
    .single()

  if (!task || task.daily_checklists.user_id !== user.id) {
    throw new Error("Task not found or unauthorized")
  }

  // Update task completion
  const { error: updateError } = await supabase
    .from("checklist_items")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", taskId)

  if (updateError) {
    throw new Error("Failed to update task")
  }

  // Award points if completing (not uncompleting)
  if (completed && !task.completed) {
    // Add points to history
    await supabase.from("points_history").insert({
      user_id: user.id,
      points: task.points,
      reason: `Completed: ${task.task}`,
    })

    // Update total points
    const { data: profile } = await supabase.from("profiles").select("total_points").eq("id", user.id).single()

    const newTotalPoints = (profile?.total_points || 0) + task.points

    await supabase
      .from("profiles")
      .update({
        total_points: newTotalPoints,
      })
      .eq("id", user.id)

    await checkBadgeUnlocks(user.id, newTotalPoints)
  } else if (!completed && task.completed) {
    // Remove points if uncompleting
    await supabase.from("points_history").insert({
      user_id: user.id,
      points: -task.points,
      reason: `Uncompleted: ${task.task}`,
    })

    const { data: profile } = await supabase.from("profiles").select("total_points").eq("id", user.id).single()

    await supabase
      .from("profiles")
      .update({
        total_points: Math.max(0, (profile?.total_points || 0) - task.points),
      })
      .eq("id", user.id)
  }

  revalidatePath("/checklist")
  revalidatePath("/dashboard")
  revalidatePath("/achievements")

  return { success: true }
}

async function checkBadgeUnlocks(userId: string, totalPoints: number) {
  const supabase = await createClient()

  // Get all badges
  const { data: allBadges } = await supabase.from("badges").select("*")

  // Get user's earned badges
  const { data: earnedBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId)

  const earnedBadgeIds = new Set(earnedBadges?.map((eb: any) => eb.badge_id) || [])

  // Check which badges can be unlocked
  const badgesToUnlock = allBadges?.filter(
    (badge: any) => !earnedBadgeIds.has(badge.id) && totalPoints >= badge.points_required,
  )

  // Award new badges
  if (badgesToUnlock && badgesToUnlock.length > 0) {
    const newBadges = badgesToUnlock.map((badge: any) => ({
      user_id: userId,
      badge_id: badge.id,
    }))

    await supabase.from("user_badges").insert(newBadges)
  }
}
