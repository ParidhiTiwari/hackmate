"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy, ExternalLink, Clock } from "lucide-react"

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  participants: number
  maxParticipants: number
  prize: string
  tags: string[]
  status: "ongoing" | "upcoming"
  unstopUrl: string
}

const mockHackathons: Hackathon[] = [
  {
    id: "1",
    title: "AI Innovation Challenge 2024",
    description:
      "Build innovative AI solutions that solve real-world problems. Focus on machine learning, natural language processing, and computer vision.",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    location: "Online",
    participants: 1250,
    maxParticipants: 2000,
    prize: "₹50,000",
    tags: ["AI", "Machine Learning", "Innovation"],
    status: "ongoing",
    unstopUrl: "https://unstop.com/hackathons/ai-innovation-challenge-2024",
  },
  {
    id: "2",
    title: "Web3 Future Hackathon",
    description:
      "Create decentralized applications and explore blockchain technology. Build the future of web3 with cutting-edge tools.",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    location: "Bangalore, India",
    participants: 890,
    maxParticipants: 1500,
    prize: "₹75,000",
    tags: ["Blockchain", "Web3", "DeFi"],
    status: "ongoing",
    unstopUrl: "https://unstop.com/hackathons/web3-future-hackathon",
  },
  {
    id: "3",
    title: "Sustainable Tech Challenge",
    description: "Develop technology solutions for environmental sustainability and climate change mitigation.",
    startDate: "2024-02-01",
    endDate: "2024-02-03",
    location: "Mumbai, India",
    participants: 0,
    maxParticipants: 1000,
    prize: "₹40,000",
    tags: ["Sustainability", "CleanTech", "Environment"],
    status: "upcoming",
    unstopUrl: "https://unstop.com/hackathons/sustainable-tech-challenge",
  },
  {
    id: "4",
    title: "FinTech Innovation Sprint",
    description: "Revolutionary financial technology solutions for the next generation of banking and payments.",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    location: "Online",
    participants: 0,
    maxParticipants: 1800,
    prize: "₹60,000",
    tags: ["FinTech", "Banking", "Payments"],
    status: "upcoming",
    unstopUrl: "https://unstop.com/hackathons/fintech-innovation-sprint",
  },
]

export default function HackathonsPage() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "upcoming">("ongoing")

  const filteredHackathons = mockHackathons.filter((hackathon) => hackathon.status === activeTab)

  const handleKnowMore = (unstopUrl: string) => {
    window.open(unstopUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-white dark:from-blue-950/20 dark:to-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h1 className="text-4xl font-bold text-foreground mb-4">Hackathons</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and participate in exciting hackathons. Build innovative solutions, learn new technologies, and win
            amazing prizes.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-muted/60 p-1 rounded-lg backdrop-blur">
            <Button
              variant={activeTab === "ongoing" ? "default" : "ghost"}
              onClick={() => setActiveTab("ongoing")}
              className="px-6 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              Ongoing
            </Button>
            <Button
              variant={activeTab === "upcoming" ? "default" : "ghost"}
              onClick={() => setActiveTab("upcoming")}
              className="px-6 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon, index) => (
            <Card
              key={hackathon.id}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(120px 80px at 0% 0%, rgba(59,130,246,0.08), transparent), radial-gradient(140px 90px at 100% 100%, rgba(124,58,237,0.06), transparent)",
              }}
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-200/20 via-transparent to-purple-200/20" />
              <CardHeader className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={hackathon.status === "ongoing" ? "default" : "secondary"}>
                    {hackathon.status === "ongoing" ? "Live Now" : "Coming Soon"}
                  </Badge>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                <CardDescription className="text-sm">{hackathon.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {hackathon.location}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {hackathon.participants}/{hackathon.maxParticipants} participants
                </div>

                <div className="flex items-center text-sm font-semibold text-green-600">
                  <Trophy className="h-4 w-4 mr-2" />
                  Prize: {hackathon.prize}
                </div>

                <div className="flex flex-wrap gap-2">
                  {hackathon.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button onClick={() => handleKnowMore(hackathon.unstopUrl)} className="w-full group">
                  Know More
                  <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No {activeTab} hackathons</h3>
            <p className="text-muted-foreground">Check back later for new {activeTab} hackathons!</p>
          </div>
        )}
      </div>
    </div>
  )
}


