"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Camera, Loader2, ArrowLeft, Video, X } from "lucide-react"
import { submitHazardReport } from "@/app/actions/hazard-actions"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HazardReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<string>("warning")
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Photo size must be less than 10MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setVideoPreview(null)
        setMediaType("photo")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 50MB for videos)
      if (file.size > 50 * 1024 * 1024) {
        setError("Video size must be less than 50MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
        setPhotoPreview(null)
        setMediaType("video")
      }
      reader.readAsDataURL(file)
    }
  }

  const clearMedia = () => {
    setPhotoPreview(null)
    setVideoPreview(null)
    const photoInput = document.getElementById("photo") as HTMLInputElement
    const videoInput = document.getElementById("video") as HTMLInputElement
    if (photoInput) photoInput.value = ""
    if (videoInput) videoInput.value = ""
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await submitHazardReport(formData)

      if (result.success) {
        router.push("/hazards")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/hazards">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            Report a Hazard
          </h1>
          <p className="text-muted-foreground mt-1">Help keep everyone safe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hazard Details</CardTitle>
          <CardDescription>Provide as much information as possible about the hazard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Severity Selection */}
            <div className="space-y-2">
              <Label>Severity Level</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("critical")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSeverity === "critical"
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Critical</p>
                  <p className="text-xs text-muted-foreground">Immediate danger</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("warning")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSeverity === "warning"
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <AlertTriangle className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Warning</p>
                  <p className="text-xs text-muted-foreground">Potential risk</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity("minor")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSeverity === "minor"
                      ? "border-muted-foreground bg-muted"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Minor</p>
                  <p className="text-xs text-muted-foreground">Low risk</p>
                </button>
              </div>
              <input type="hidden" name="severity" value={selectedSeverity} />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Brief description of the hazard" required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide detailed information about the hazard, including what you observed and any immediate actions taken"
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g., Section A, Near Equipment Room" required />
            </div>

            <div className="space-y-2">
              <Label>Media (Optional)</Label>
              <Tabs defaultValue="photo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photo">
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="photo" className="space-y-4">
                  {photoPreview ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={clearMedia}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="photo"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload a photo</p>
                      <p className="text-xs text-muted-foreground mt-1">Max size: 10MB</p>
                    </label>
                  )}
                  <Input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </TabsContent>
                <TabsContent value="video" className="space-y-4">
                  {videoPreview ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                      <video src={videoPreview} className="w-full h-full object-cover" controls />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={clearMedia}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="video"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <Video className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload a video</p>
                      <p className="text-xs text-muted-foreground mt-1">Max size: 50MB</p>
                    </label>
                  )}
                  <Input
                    id="video"
                    name="video"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/hazards">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
