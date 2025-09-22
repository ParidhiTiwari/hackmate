"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  documentId,
  setDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, MessageSquare, UserPlus } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/protected-route"

interface Team {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: any
  members: string[]
  invites: string[]
  isPublic: boolean
}

interface TeamMember {
  id: string
  name: string
  photoURL: string
  email: string
}

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({})

  // Create team form
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteMessage, setInviteMessage] = useState("")

  useEffect(() => {
    if (user) {
      loadTeams()
    }
  }, [user])

  const loadTeams = async () => {
    if (!user) return

    console.log("[v0] Loading teams for user:", user.uid)

    try {
      const teamsRef = collection(db, "teams")

      // Get teams where user is a member
      const userTeamsQuery = query(teamsRef, where("members", "array-contains", user.uid))
      const userTeamsSnapshot = await getDocs(userTeamsQuery)

      // Get public teams where user is not already a member
      const publicTeamsQuery = query(teamsRef, where("isPublic", "==", true))
      const publicTeamsSnapshot = await getDocs(publicTeamsQuery)

      const teamsData: Team[] = []
      const allMemberIds = new Set<string>()
      const userTeamIds = new Set<string>()

      // Add user's teams
      userTeamsSnapshot.forEach((doc) => {
        const teamData = {
          id: doc.id,
          ...doc.data(),
        } as Team
        teamsData.push(teamData)
        userTeamIds.add(doc.id)
        teamData.members.forEach((memberId) => allMemberIds.add(memberId))
      })

      // Add public teams that user is not already a member of
      publicTeamsSnapshot.forEach((doc) => {
        if (!userTeamIds.has(doc.id)) {
          const teamData = {
            id: doc.id,
            ...doc.data(),
          } as Team
          teamsData.push(teamData)
          teamData.members.forEach((memberId) => allMemberIds.add(memberId))
        }
      })

      console.log("[v0] Loaded teams:", teamsData.length)
      setTeams(teamsData)

      if (allMemberIds.size > 0) {
        await loadAllTeamMembers(teamsData, Array.from(allMemberIds))
      }
    } catch (error) {
      console.error("Error loading teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllTeamMembers = async (teamsData: Team[], memberIds: string[]) => {
    try {
      console.log("[v0] Loading members in batch:", memberIds.length)

      // Firestore 'in' queries are limited to 10 items, so we batch them
      const batchSize = 10
      const memberData: { [key: string]: TeamMember } = {}

      for (let i = 0; i < memberIds.length; i += batchSize) {
        const batch = memberIds.slice(i, i + batchSize)
        const usersRef = collection(db, "users")
        const q = query(usersRef, where(documentId(), "in", batch))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach((doc) => {
          const userData = doc.data()
          memberData[doc.id] = {
            id: doc.id,
            name: userData.name || "Unknown User",
            photoURL: userData.photoURL || "",
            email: userData.email || "",
          }
        })
      }

      // Organize members by team
      const teamMembersMap: { [key: string]: TeamMember[] } = {}
      teamsData.forEach((team) => {
        teamMembersMap[team.id] = team.members.map((memberId) => memberData[memberId]).filter(Boolean) // Remove any undefined members
      })

      console.log("[v0] Organized team members for", Object.keys(teamMembersMap).length, "teams")
      setTeamMembers(teamMembersMap)
    } catch (error) {
      console.error("Error loading team members:", error)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreating(true)

    try {
      console.log("[v0] Creating team for user:", user.uid)

      const userRef = doc(db, "users", user.uid)
      await setDoc(
        userRef,
        {
          name: user.displayName || "Unknown User",
          email: user.email || "",
          photoURL: user.photoURL || "",
          updatedAt: new Date(),
        },
        { merge: true },
      )

      const teamData = {
        name: teamName,
        description: teamDescription,
        createdBy: user.uid,
        createdAt: new Date(),
        members: [user.uid],
        invites: [],
        isPublic,
      }

      console.log("[v0] Adding team document")
      const docRef = await addDoc(collection(db, "teams"), teamData)
      console.log("[v0] Team created successfully with ID:", docRef.id)

      setTeamName("")
      setTeamDescription("")
      setIsPublic(true)
      setShowCreateModal(false)

      // Reload teams
      await loadTeams()
    } catch (error) {
      console.error("[v0] Error creating team:", error)
      alert(`Error creating team: ${error.message}. Please try again.`)
    } finally {
      setCreating(false)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !user) return

    setInviting(true)
    setInviteMessage("")

    try {
      // Find user by email
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("email", "==", inviteEmail))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setInviteMessage("User not found with this email address")
        setInviting(false)
        return
      }

      const userDoc = querySnapshot.docs[0]
      const userId = userDoc.id

      // Check if user is already a member or invited
      if (selectedTeam.members.includes(userId)) {
        setInviteMessage("User is already a member of this team")
        setInviting(false)
        return
      }

      if (selectedTeam.invites.includes(userId)) {
        setInviteMessage("User has already been invited to this team")
        setInviting(false)
        return
      }

      // Add to invites
      const teamRef = doc(db, "teams", selectedTeam.id)
      await updateDoc(teamRef, {
        invites: arrayUnion(userId),
      })

      setInviteMessage("Invitation sent successfully!")
      setInviteEmail("")

      // Reload teams
      setTimeout(() => {
        loadTeams()
        setShowInviteModal(false)
        setInviteMessage("")
      }, 1500)
    } catch (error) {
      console.error("Error inviting user:", error)
      setInviteMessage("Error sending invitation")
    } finally {
      setInviting(false)
    }
  }

  const handleJoinTeam = async (team: Team) => {
    if (!user) return

    try {
      console.log("[v0] Joining team:", team.id)

      // Ensure user document exists
      const userRef = doc(db, "users", user.uid)
      await setDoc(
        userRef,
        {
          name: user.displayName || "Unknown User",
          email: user.email || "",
          photoURL: user.photoURL || "",
          updatedAt: new Date(),
        },
        { merge: true },
      )

      // Add user to team members
      const teamRef = doc(db, "teams", team.id)
      await updateDoc(teamRef, {
        members: arrayUnion(user.uid),
      })

      console.log("[v0] Successfully joined team")

      // Reload teams
      await loadTeams()
    } catch (error) {
      console.error("Error joining team:", error)
      alert(`Error joining team: ${error.message}`)
    }
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Teams</h1>
              <p className="text-muted-foreground mt-2">Collaborate with other developers on projects and hackathons</p>
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-description">Description</Label>
                    <Textarea
                      id="team-description"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="Describe your team's purpose and goals"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-public"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is-public">Make team publicly visible</Label>
                  </div>

                  <Button type="submit" disabled={creating} className="w-full">
                    {creating ? "Creating..." : "Create Team"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {teams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No teams yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first team to start collaborating with other developers
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {team.description || "No description provided"}
                        </CardDescription>
                      </div>
                      {team.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Members ({team.members.length})</p>
                      <div className="flex -space-x-2">
                        {teamMembers[team.id]?.slice(0, 4).map((member) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.photoURL || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 4 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{team.members.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {team.members.includes(user?.uid || "") ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setSelectedTeam(team)
                              setShowInviteModal(true)
                            }}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                          <Link href={`/teams/${team.id}/chat`} className="flex-1">
                            <Button size="sm" className="w-full">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Chat
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <Button size="sm" className="w-full" onClick={() => handleJoinTeam(team)}>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Join Team
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created {new Date(team.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Invite Modal */}
          <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to {selectedTeam?.name}</DialogTitle>
              </DialogHeader>

              {inviteMessage && (
                <Alert className={inviteMessage.includes("successfully") ? "" : "border-destructive"}>
                  <AlertDescription>{inviteMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter user's email address"
                    required
                  />
                </div>

                <Button type="submit" disabled={inviting} className="w-full">
                  {inviting ? "Sending Invitation..." : "Send Invitation"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}
