import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Shield, AlertTriangle, Heart, Wrench, Users } from "lucide-react"

export default function FAQPage() {
  const faqCategories = [
    {
      icon: Shield,
      title: "Safety Equipment & PPE",
      color: "text-blue-500",
      questions: [
        {
          q: "What PPE is mandatory for underground mining?",
          a: "All underground miners must wear: hard hat with lamp, safety boots with steel toe caps, high-visibility vest, safety glasses, dust mask/respirator, hearing protection, and gloves. Additional PPE may be required based on specific tasks.",
        },
        {
          q: "How often should I replace my safety helmet?",
          a: "Replace your helmet every 2-3 years or immediately after any impact. Check monthly for cracks, dents, or UV damage. The suspension system should be replaced annually.",
        },
        {
          q: "When should I use a respirator vs. a dust mask?",
          a: "Use respirators when dust levels exceed permissible limits, working with chemicals, or in confined spaces. Dust masks are for light dust protection only. Always check with your supervisor for specific requirements.",
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: "Emergency Procedures",
      color: "text-red-500",
      questions: [
        {
          q: "What should I do if I hear the emergency siren?",
          a: "Stop work immediately, secure equipment, gather at the nearest assembly point, account for all team members, and follow evacuation procedures. Do not return until the all-clear signal is given.",
        },
        {
          q: "How do I report a gas leak?",
          a: "Evacuate the area immediately, alert nearby workers, use emergency communication system to report location and type of gas (if known), move to fresh air, and do not re-enter until cleared by safety personnel.",
        },
        {
          q: "What are the signs of roof collapse danger?",
          a: "Warning signs include: cracking sounds, falling dust or small rocks, visible cracks in roof/walls, bulging roof, popping sounds from support timbers, and increased water seepage. Report immediately and evacuate.",
        },
      ],
    },
    {
      icon: Wrench,
      title: "Equipment & Operations",
      color: "text-yellow-500",
      questions: [
        {
          q: "What pre-shift checks should I perform?",
          a: "Check all PPE, test communication devices, inspect tools and equipment, verify emergency exits are clear, check gas detection equipment, review daily hazard briefing, and report any defects.",
        },
        {
          q: "How do I safely operate drilling equipment?",
          a: "Complete training certification, perform pre-operation inspection, wear all required PPE, maintain safe distance from others, follow lockout/tagout procedures, never bypass safety guards, and report any malfunctions immediately.",
        },
        {
          q: "What should I do if equipment malfunctions?",
          a: "Stop operation immediately, apply lockout/tagout procedures, report to supervisor, tag equipment as defective, do not attempt repairs unless authorized, and document the issue in the maintenance log.",
        },
      ],
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      color: "text-pink-500",
      questions: [
        {
          q: "How can I prevent heat stress underground?",
          a: "Drink water regularly (1 cup every 15-20 minutes), take scheduled breaks in cool areas, wear moisture-wicking clothing, recognize symptoms (dizziness, nausea, confusion), and report concerns immediately.",
        },
        {
          q: "What are symptoms of silica dust exposure?",
          a: "Short-term: coughing, difficulty breathing, chest tightness. Long-term: persistent cough, fatigue, weight loss, chest pain. Always wear proper respiratory protection and get regular health screenings.",
        },
        {
          q: "How do I manage work-related stress?",
          a: "Talk to Saathi for immediate support, use the wellness resources in the app, speak with your supervisor or safety officer, take regular breaks, maintain work-life balance, and seek professional help if needed.",
        },
      ],
    },
    {
      icon: Users,
      title: "Communication & Reporting",
      color: "text-green-500",
      questions: [
        {
          q: "How do I report a near-miss incident?",
          a: "Use the Hazard Report feature in MineSaathi immediately, provide detailed description, include photos if safe to do so, inform your supervisor, and participate in the investigation if requested.",
        },
        {
          q: "What information should I include in a hazard report?",
          a: "Location (specific area/section), severity level, detailed description, potential consequences, immediate actions taken, photos/videos if available, and any witnesses. More detail helps prevent future incidents.",
        },
        {
          q: "Can I report hazards anonymously?",
          a: "Yes, MineSaathi supports anonymous reporting. However, providing contact information helps safety teams follow up and may earn you safety points. Your safety is always the priority.",
        },
      ],
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
        </div>
        <p className="text-muted-foreground text-lg">Quick answers to common mining safety questions</p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {faqCategories.map((category, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-3">
                <category.icon className={`w-6 h-6 ${category.color}`} />
                <span>{category.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, qIdx) => (
                  <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                    <AccordionTrigger className="text-left hover:text-primary">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Talk to Saathi, your AI safety assistant, for personalized guidance
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
