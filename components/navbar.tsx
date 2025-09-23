"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Code2, Users, User, LogOut, MessageSquare, Bell, Check, X, CalendarDays } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface TeamInvite {
  teamId: string
  teamName: string
  invitedBy: string
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadInvites()
    }
  }, [user])

  const loadInvites = async () => {
    if (!user) return

    try {
      console.log("[v0] Loading invites for user:", user.uid)

      // Find teams where user is in the invites array
      const teamsRef = collection(db, "teams")
      const q = query(teamsRef, where("invites", "array-contains", user.uid))
      const querySnapshot = await getDocs(q)

      const invitesData: TeamInvite[] = []
      querySnapshot.forEach((doc) => {
        const teamData = doc.data()
        invitesData.push({
          teamId: doc.id,
          teamName: teamData.name,
          invitedBy: teamData.createdBy, // Could be enhanced to track who sent the invite
        })
      })

      console.log("[v0] Found invites:", invitesData.length)
      setInvites(invitesData)
    } catch (error) {
      console.error("Error loading invites:", error)
    }
  }

  const handleAcceptInvite = async (teamId: string) => {
    if (!user) return

    setLoading(true)
    try {
      console.log("[v0] Accepting invite for team:", teamId)

      const teamRef = doc(db, "teams", teamId)

      // Move user from invites to members
      await updateDoc(teamRef, {
        invites: arrayRemove(user.uid),
        members: arrayUnion(user.uid),
      })

      // Remove from local state
      setInvites((prev) => prev.filter((invite) => invite.teamId !== teamId))

      console.log("[v0] Successfully accepted invite")
    } catch (error) {
      console.error("Error accepting invite:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRejectInvite = async (teamId: string) => {
    if (!user) return

    setLoading(true)
    try {
      console.log("[v0] Rejecting invite for team:", teamId)

      const teamRef = doc(db, "teams", teamId)

      // Remove user from invites
      await updateDoc(teamRef, {
        invites: arrayRemove(user.uid),
      })

      // Remove from local state
      setInvites((prev) => prev.filter((invite) => invite.teamId !== teamId))

      console.log("[v0] Successfully rejected invite")
    } catch (error) {
      console.error("Error rejecting invite:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">HackMate</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/browse">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Developers
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Teams
                  </Button>
                </Link>
                <Link href="/hackathons">
                  <Button variant="ghost" size="sm">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Hackathons
                  </Button>
                </Link>

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      {invites.length > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {invites.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <div className="px-3 py-2 border-b">
                      <h3 className="font-semibold text-sm">Team Invitations</h3>
                    </div>

                    {invites.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">No pending invitations</div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {invites.map((invite) => (
                          <div key={invite.teamId} className="px-3 py-3 border-b last:border-b-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{invite.teamName}</p>
                                <p className="text-xs text-muted-foreground">Team invitation</p>
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleAcceptInvite(invite.teamId)}
                                  disabled={loading}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRejectInvite(invite.teamId)}
                                  disabled={loading}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/auth">
                  <Button>Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
