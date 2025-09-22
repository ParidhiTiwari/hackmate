"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { MessageSquare, Search, User, Trophy } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-on-scroll">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Connect with <span className="text-primary">Developers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            HackMate is the platform where developers create profiles, discover teammates, and collaborate on
            hackathons, coding events, and exciting projects.
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Browse Developers
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="text-lg px-8 py-3">
                  Find Teammates
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Update Profile
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-card hover:to-blue-50/50 dark:hover:to-blue-950/20 animate-on-scroll animate-delay-100">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <User className="h-6 w-6 text-primary group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <CardTitle className="group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                Create Your Profile
              </CardTitle>
              <CardDescription>
                Showcase your skills, university, experience, and interests to connect with like-minded developers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-card hover:to-purple-50/50 dark:hover:to-purple-950/20 animate-on-scroll animate-delay-200">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                <Search className="h-6 w-6 text-secondary group-hover:text-purple-600 transition-colors duration-300" />
              </div>
              <CardTitle className="group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                Discover Developers
              </CardTitle>
              <CardDescription>
                Browse and search through developer profiles filtered by skills, university, and experience level.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-card hover:to-blue-50/50 dark:hover:to-blue-950/20 animate-on-scroll animate-delay-300">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <MessageSquare className="h-6 w-6 text-accent group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <CardTitle className="group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                Team Collaboration
              </CardTitle>
              <CardDescription>
                Create teams, invite members, and collaborate with real-time chat for your projects and hackathons.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-16 animate-on-scroll animate-delay-400">
          <Card className="group hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-card hover:to-yellow-50/50 dark:hover:to-yellow-950/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all duration-300">
                <Trophy className="h-8 w-8 text-yellow-500 group-hover:text-yellow-600 transition-colors duration-300" />
              </div>
              <CardTitle className="text-2xl group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors duration-300">
                Upcoming Hackathons
              </CardTitle>
              <CardDescription className="text-lg">
                Discover exciting hackathons and coding competitions. Join teams, build innovative solutions, and win
                amazing prizes.
              </CardDescription>
              <div className="pt-4">
                <Link href="/hackathons">
                  <Button
                    size="lg"
                    className="group-hover:bg-yellow-600 group-hover:shadow-lg transition-all duration-300"
                  >
                    Explore Hackathons
                    <Trophy className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-lg p-8 text-center animate-on-scroll">
          <h2 className="text-3xl font-bold text-card-foreground mb-8">Join the Developer Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-primary mb-2 group-hover:text-blue-600 transition-colors duration-300">
                1000+
              </div>
              <div className="text-muted-foreground">Active Developers</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-secondary mb-2 group-hover:text-purple-600 transition-colors duration-300">
                500+
              </div>
              <div className="text-muted-foreground">Teams Formed</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-accent mb-2 group-hover:text-blue-600 transition-colors duration-300">
                200+
              </div>
              <div className="text-muted-foreground">Projects Completed</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
