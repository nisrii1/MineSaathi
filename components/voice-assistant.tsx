"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VoiceAssistantProps {
  defaultLanguage?: string
}

export function VoiceAssistant({ defaultLanguage = "en" }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [language, setLanguage] = useState(defaultLanguage)
  const [inputText, setInputText] = useState("")
  const [autoSpeak, setAutoSpeak] = useState(true)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/saathi",
      body: { language },
    }),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      const langMap: Record<string, string> = {
        en: "en-US",
        hi: "hi-IN",
        bn: "bn-IN",
        ta: "ta-IN",
        te: "te-IN",
        mr: "mr-IN",
      }
      recognitionRef.current.lang = langMap[language] || "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("")

        setInputText(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language])

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)

      const langMap: Record<string, string> = {
        en: "en-US",
        hi: "hi-IN",
        bn: "bn-IN",
        ta: "ta-IN",
        te: "te-IN",
        mr: "mr-IN",
      }
      utterance.lang = langMap[language] || "en-US"
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim()) return

    console.log("[v0] Sending message:", inputText)

    sendMessage({ text: inputText })

    setInputText("")

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
  }

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (autoSpeak && lastMessage?.role === "assistant") {
      // Extract text from parts array
      const textParts = lastMessage.parts?.filter((part: any) => part.type === "text") || []
      const text = textParts.map((part: any) => part.text).join("")
      if (text) {
        speak(text)
      }
    }
  }, [messages, autoSpeak])

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      en: "English",
      hi: "हिंदी",
      bn: "বাংলা",
      ta: "தமிழ்",
      te: "తెలుగు",
      mr: "मराठी",
    }
    return labels[lang] || "English"
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Saathi</h1>
              <p className="text-xs text-muted-foreground">Your Safety Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoSpeak ? "default" : "outline"}
              onClick={() => setAutoSpeak(!autoSpeak)}
              title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="bn">বাংলা</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Talk to Saathi</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Your AI-powered safety companion is here to help. Ask about safety procedures, report concerns, or get
              wellness support in your preferred language.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <Card
                className="cursor-pointer hover:bg-secondary transition-colors"
                onClick={() =>
                  setInputText(
                    language === "hi"
                      ? "आज मुझे कौन सा PPE पहनना चाहिए?"
                      : language === "bn"
                        ? "আজ আমার কোন PPE পরা উচিত?"
                        : "What PPE should I wear today?",
                  )
                }
              >
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">
                    {language === "hi"
                      ? "आज मुझे कौन सा PPE पहनना चाहिए?"
                      : language === "bn"
                        ? "আজ আমার কোন PPE পরা উচিত?"
                        : "What PPE should I wear today?"}
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-secondary transition-colors"
                onClick={() =>
                  setInputText(
                    language === "hi"
                      ? "मैं खतरे की रिपोर्ट कैसे करूं?"
                      : language === "bn"
                        ? "আমি কীভাবে একটি বিপদ রিপোর্ট করব?"
                        : "How do I report a hazard?",
                  )
                }
              >
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">
                    {language === "hi"
                      ? "मैं खतरे की रिपोर्ट कैसे करूं?"
                      : language === "bn"
                        ? "আমি কীভাবে একটি বিপদ রিপোর্ট করব?"
                        : "How do I report a hazard?"}
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-secondary transition-colors"
                onClick={() =>
                  setInputText(
                    language === "hi"
                      ? "मुझे तनाव महसूस हो रहा है"
                      : language === "bn"
                        ? "আমি চাপ অনুভব করছি"
                        : "I'm feeling stressed",
                  )
                }
              >
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">
                    {language === "hi"
                      ? "मुझे तनाव महसूस हो रहा है"
                      : language === "bn"
                        ? "আমি চাপ অনুভব করছি"
                        : "I'm feeling stressed"}
                  </p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:bg-secondary transition-colors"
                onClick={() =>
                  setInputText(
                    language === "hi"
                      ? "आपातकालीन निकासी प्रक्रिया"
                      : language === "bn"
                        ? "জরুরি সরিয়ে নেওয়ার পদ্ধতি"
                        : "Emergency evacuation procedure",
                  )
                }
              >
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">
                    {language === "hi"
                      ? "आपातकालीन निकासी प्रक्रिया"
                      : language === "bn"
                        ? "জরুরি সরিয়ে নেওয়ার পদ্ধতি"
                        : "Emergency evacuation procedure"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              // Extract text from parts array
              const textParts = message.parts?.filter((part: any) => part.type === "text") || []
              const text = textParts.map((part: any) => part.text).join("")

              return (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                    {message.role === "assistant" && text && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => speak(text)}>
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {status === "in_progress" && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={
                language === "hi"
                  ? "अपना संदेश टाइप करें..."
                  : language === "bn"
                    ? "আপনার বার্তা টাইপ করুন..."
                    : language === "ta"
                      ? "உங்கள் செய்தியை தட்டச்சு செய்யவும்..."
                      : language === "te"
                        ? "మీ సందేశాన్ని టైప్ చేయండి..."
                        : language === "mr"
                          ? "तुमचा संदेश टाइप करा..."
                          : "Type your message..."
              }
              className="min-h-[60px] resize-none"
              disabled={status === "in_progress"}
            />
            {isListening && (
              <Badge variant="destructive" className="mt-2 animate-pulse">
                <Mic className="w-3 h-3 mr-1 animate-pulse" />
                Listening...
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant={isListening ? "destructive" : "default"}
              onClick={toggleListening}
              disabled={status === "in_progress"}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              variant={isSpeaking ? "destructive" : "secondary"}
              onClick={isSpeaking ? stopSpeaking : () => {}}
              title={isSpeaking ? "Stop speaking" : "Voice output"}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputText.trim() || status === "in_progress"}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
