"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, serverTimestamp, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/protected-route"

interface Message {
  id: string
  text: string
  userId: string
  userName: string
  userPhoto: string
  timestamp: any
  teamId: string
}

interface TeamMember {
  id: string
  name: string
  photoURL: string
  email: string
}

interface Team {
  id: string
  name: string
  description: string
  members: string[]
}

export default function TeamChatPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { user } = useAuth()

  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && teamId) {
      loadTeam()
      setupMessageListener()
    }
  }, [user, teamId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadTeam = async () => {
    try {
      const teamRef = doc(db, "teams", teamId)
      const teamSnap = await getDoc(teamRef)

      if (teamSnap.exists()) {
        const teamData = teamSnap.data()

        // Check if user is a member
        if (!teamData.members.includes(user?.uid)) {
          // Redirect or show error
          return
        }

        setTeam({
          id: teamSnap.id,
          name: teamData.name,
          description: teamData.description,
          members: teamData.members,
        })

        // Load team members
        await loadTeamMembers(teamData.members)
      }
    } catch (error) {
      console.error("Error loading team:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async (memberIds: string[]) => {
    try {
      const members: TeamMember[] = []

      for (const memberId of memberIds) {
        const userRef = doc(db, "users", memberId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          members.push({
            id: memberId,
            name: userData.name || "Unknown User",
            photoURL: userData.photoURL || "",
            email: userData.email || "",
          })
        }
      }

      setTeamMembers(members)
    } catch (error) {
      console.error("Error loading team members:", error)
    }
  }

  const setupMessageListener = () => {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("teamId", "==", teamId), orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = []
      snapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data(),
        } as Message)
      })
      setMessages(messagesData)
    })

    return unsubscribe
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || "Unknown User",
        userPhoto: user.photoURL || "",
        timestamp: serverTimestamp(),
        teamId: teamId,
      })

      setNewMessage("")
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate()
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      if (!message.timestamp) return

      const date = message.timestamp.toDate()
      const dateKey = date.toDateString()

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!team) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Team not found</h2>
              <p className="text-sm text-muted-foreground">You may not have access to this team.</p>
              <Link href="/teams">
                <Button>Back to Teams</Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            {/* Team Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Link href="/teams">
                      <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Members ({teamMembers.length})
                      </h3>
                      <div className="space-y-2">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.photoURL || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                              {member.id === user?.uid && (
                                <Badge variant="secondary" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center">
                    <span>Team Chat</span>
                    <Badge variant="secondary" className="ml-2">
                      {messages.length} messages
                    </Badge>
                  </CardTitle>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-20rem)] p-4">
                    <div className="space-y-4">
                      {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
                        <div key={dateKey}>
                          <div className="flex justify-center mb-4">
                            <Badge variant="outline" className="text-xs">
                              {new Date(dateKey).toLocaleDateString([], {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </Badge>
                          </div>

                          {dayMessages.map((message, index) => {
                            const isCurrentUser = message.userId === user?.uid
                            const showAvatar = index === 0 || dayMessages[index - 1].userId !== message.userId

                            return (
                              <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${
                                  showAvatar ? "mt-4" : "mt-1"
                                }`}
                              >
                                <div className={`flex max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                                  {showAvatar && !isCurrentUser && (
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage
                                        src={message.userPhoto || "/placeholder.svg"}
                                        alt={message.userName}
                                      />
                                      <AvatarFallback className="text-xs">{message.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  )}

                                  <div className={`${isCurrentUser ? "mr-2" : showAvatar ? "" : "ml-10"}`}>
                                    {showAvatar && (
                                      <div
                                        className={`text-xs text-muted-foreground mb-1 ${
                                          isCurrentUser ? "text-right" : "text-left"
                                        }`}
                                      >
                                        {isCurrentUser ? "You" : message.userName} • {formatTime(message.timestamp)}
                                      </div>
                                    )}

                                    <div
                                      className={`rounded-lg px-3 py-2 ${
                                        isCurrentUser
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      <p className="text-sm">{message.text}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}

                      {messages.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
