"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Shield, AlertTriangle, Heart, Wrench, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  const videoCategories = [
    {
      icon: Shield,
      title: "PPE & Safety Equipment",
      color: "bg-blue-500",
      videos: [
        {
          title: "Proper Hard Hat Usage",
          duration: "3:45",
          thumbnail: "/mining-worker-wearing-hard-hat-safety-helmet.jpg",
          description: "Learn how to properly wear and maintain your safety helmet",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Respirator Fit Testing",
          duration: "5:20",
          thumbnail: "/worker-wearing-respirator-mask-safety-equipment.jpg",
          description: "Step-by-step guide to ensuring proper respirator fit",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Safety Boot Inspection",
          duration: "2:30",
          thumbnail: "/safety-boots-steel-toe-work-boots.jpg",
          description: "Daily checks for your safety footwear",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: "Emergency Response",
      color: "bg-red-500",
      videos: [
        {
          title: "Fire Emergency Evacuation",
          duration: "6:15",
          thumbnail: "/mine-emergency-evacuation-fire-safety.jpg",
          description: "What to do when the fire alarm sounds",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Gas Leak Response",
          duration: "4:50",
          thumbnail: "/gas-detector-mining-safety-equipment.jpg",
          description: "Identifying and responding to gas leaks safely",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "First Aid Basics",
          duration: "8:30",
          thumbnail: "/first-aid-kit-medical-emergency-response.jpg",
          description: "Essential first aid for common mining injuries",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Roof Fall Prevention",
          duration: "5:45",
          thumbnail: "/mine-roof-support-underground-mining.jpg",
          description: "Recognizing warning signs and prevention measures",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
      ],
    },
    {
      icon: Wrench,
      title: "Equipment Operation",
      color: "bg-yellow-500",
      videos: [
        {
          title: "Drilling Machine Safety",
          duration: "7:20",
          thumbnail: "/mining-drilling-machine-equipment-operation.jpg",
          description: "Safe operation of drilling equipment",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Lockout/Tagout Procedures",
          duration: "4:15",
          thumbnail: "/lockout-tagout-safety-procedure-equipment.jpg",
          description: "Proper LOTO procedures for equipment maintenance",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Conveyor Belt Safety",
          duration: "3:55",
          thumbnail: "/conveyor-belt-mining-industrial-equipment.jpg",
          description: "Working safely around conveyor systems",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
      ],
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      color: "bg-pink-500",
      videos: [
        {
          title: "Heat Stress Prevention",
          duration: "4:40",
          thumbnail: "/worker-drinking-water-heat-stress-prevention.jpg",
          description: "Staying safe in hot underground conditions",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Dust Control Measures",
          duration: "5:10",
          thumbnail: "/dust-control-mining-ventilation-system.jpg",
          description: "Protecting your lungs from silica dust",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
        {
          title: "Mental Health Awareness",
          duration: "6:00",
          thumbnail: "/mental-health-workplace-wellness-support.jpg",
          description: "Managing stress and seeking support",
          offline: true,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        },
      ],
    },
  ]

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Play className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Safety Videos</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Watch and learn essential safety procedures - Available offline
          </p>
        </div>

        {/* Video Categories */}
        <div className="space-y-8">
          {videoCategories.map((category, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.videos.map((video, vIdx) => (
                  <Card
                    key={vIdx}
                    className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="lg" className="rounded-full w-16 h-16">
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                      {video.offline && (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          <Download className="w-3 h-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                      <Badge variant="secondary" className="absolute bottom-2 right-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Download className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Offline Access</h3>
                <p className="text-muted-foreground">
                  All videos are cached for offline viewing. You can watch them anytime, even without internet
                  connection. Videos are automatically updated when you're online.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo?.videoUrl ? (
                <iframe
                  src={selectedVideo.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Video player placeholder</p>
                    <p className="text-sm opacity-75 mt-2">In production, this would play the actual safety video</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">{selectedVideo?.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedVideo?.duration}
                </Badge>
                {selectedVideo?.offline && (
                  <Badge className="bg-green-500">
                    <Download className="w-3 h-3 mr-1" />
                    Available Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
