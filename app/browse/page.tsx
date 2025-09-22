"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Users, Github, Linkedin, MapPin, Mail } from "lucide-react"
import Navbar from "@/components/navbar"
import DeveloperCard from "@/components/developer-card"

interface Developer {
  id: string
  name: string
  email: string
  university: string
  skills: string[]
  bio: string
  github?: string
  linkedin?: string
  photoURL?: string
}

interface Team {
  id: string
  name: string
  members: string[]
}

export default function BrowsePage() {
  const { user } = useAuth()
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([])
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [inviting, setInviting] = useState(false)

  // Get unique skills and universities for filters
  const allSkills = Array.from(new Set(developers.flatMap((dev) => dev.skills))).sort()
  const allUniversities = Array.from(new Set(developers.map((dev) => dev.university).filter(Boolean))).sort()

  // Pagination constants
  const DEVELOPERS_PER_PAGE = 12

  useEffect(() => {
    if (user) {
      loadDevelopers(true) // true = initial load
      loadUserTeams()
    }
  }, [user])

  useEffect(() => {
    filterDevelopers()
  }, [developers, searchTerm, selectedSkill, selectedUniversity])

  const loadDevelopers = async (isInitialLoad = false) => {
    if (!isInitialLoad && !hasMore) return

    try {
      console.log("[v0] Loading developers, initial:", isInitialLoad)

      if (isInitialLoad) {
        setLoading(true)
        setDevelopers([])
        setLastDoc(null)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }

      const usersRef = collection(db, "users")
      let q = query(usersRef, orderBy("name"), limit(DEVELOPERS_PER_PAGE))

      // Add pagination cursor if not initial load
      if (!isInitialLoad && lastDoc) {
        q = query(usersRef, orderBy("name"), startAfter(lastDoc), limit(DEVELOPERS_PER_PAGE))
      }

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setHasMore(false)
        return
      }

      const developersData: Developer[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Exclude current user from the list
        if (doc.id !== user?.uid) {
          developersData.push({
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            university: data.university || "",
            skills: data.skills || [],
            bio: data.bio || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
            photoURL: data.photoURL || "",
          })
        }
      })

      console.log("[v0] Loaded developers:", developersData.length)

      if (isInitialLoad) {
        setDevelopers(developersData)
      } else {
        setDevelopers((prev) => [...prev, ...developersData])
      }

      // Set pagination cursor
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
      setLastDoc(lastVisible)

      // Check if we have more data
      setHasMore(querySnapshot.docs.length === DEVELOPERS_PER_PAGE)
    } catch (error) {
      console.error("Error loading developers:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadUserTeams = async () => {
    if (!user) return

    try {
      const teamsRef = collection(db, "teams")
      const q = query(teamsRef, where("members", "array-contains", user.uid))
      const querySnapshot = await getDocs(q)

      const teamsData: Team[] = []
      querySnapshot.forEach((doc) => {
        teamsData.push({
          id: doc.id,
          name: doc.data().name,
          members: doc.data().members,
        })
      })

      setUserTeams(teamsData)
    } catch (error) {
      console.error("Error loading user teams:", error)
    }
  }

  const filterDevelopers = () => {
    let filtered = developers

    // Filter by search term (name, university, skills, bio)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (dev) =>
          dev.name.toLowerCase().includes(term) ||
          dev.university.toLowerCase().includes(term) ||
          dev.bio.toLowerCase().includes(term) ||
          dev.skills.some((skill) => skill.toLowerCase().includes(term)),
      )
    }

    // Filter by skill
    if (selectedSkill) {
      filtered = filtered.filter((dev) =>
        dev.skills.some((skill) => skill.toLowerCase().includes(selectedSkill.toLowerCase())),
      )
    }

    // Filter by university
    if (selectedUniversity) {
      filtered = filtered.filter((dev) => dev.university.toLowerCase().includes(selectedUniversity.toLowerCase()))
    }

    setFilteredDevelopers(filtered)
  }

  const handleViewProfile = (developerId: string) => {
    const developer = developers.find((dev) => dev.id === developerId)
    if (developer) {
      setSelectedDeveloper(developer)
      setShowProfileModal(true)
    }
  }

  const handleInviteToTeam = (developerId: string) => {
    const developer = developers.find((dev) => dev.id === developerId)
    if (developer) {
      setSelectedDeveloper(developer)
      setShowInviteModal(true)
    }
  }

  const handleSendInvite = async () => {
    if (!selectedDeveloper || !selectedTeamId || !user) return

    setInviting(true)
    setInviteMessage("")

    try {
      const teamRef = doc(db, "teams", selectedTeamId)
      const teamSnap = await getDoc(teamRef)

      if (!teamSnap.exists()) {
        setInviteMessage("Team not found")
        setInviting(false)
        return
      }

      const teamData = teamSnap.data()

      // Check if user is already a member or invited
      if (teamData.members.includes(selectedDeveloper.id)) {
        setInviteMessage("User is already a member of this team")
        setInviting(false)
        return
      }

      if (teamData.invites && teamData.invites.includes(selectedDeveloper.id)) {
        setInviteMessage("User has already been invited to this team")
        setInviting(false)
        return
      }

      // Add to invites
      await updateDoc(teamRef, {
        invites: arrayUnion(selectedDeveloper.id),
      })

      setInviteMessage("Invitation sent successfully!")

      setTimeout(() => {
        setShowInviteModal(false)
        setInviteMessage("")
        setSelectedTeamId("")
      }, 1500)
    } catch (error) {
      console.error("Error sending invite:", error)
      setInviteMessage("Error sending invitation")
    } finally {
      setInviting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSkill("")
    setSelectedUniversity("")
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadDevelopers(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Developers</h1>
          <p className="text-muted-foreground">Discover talented developers and find your next teammate</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allSkills">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by university" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allUniversities">All Universities</SelectItem>
                  {allUniversities.map((university) => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredDevelopers.length} of {developers.length} developers
              </p>

              {(searchTerm || selectedSkill || selectedUniversity) && (
                <div className="flex gap-2">
                  {searchTerm && <Badge variant="secondary">Search: {searchTerm}</Badge>}
                  {selectedSkill && <Badge variant="secondary">Skill: {selectedSkill}</Badge>}
                  {selectedUniversity && <Badge variant="secondary">University: {selectedUniversity}</Badge>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Developers Grid */}
        {filteredDevelopers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No developers found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or clearing the filters</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevelopers.map((developer) => (
                <DeveloperCard
                  key={developer.id}
                  id={developer.id}
                  name={developer.name}
                  university={developer.university}
                  skills={developer.skills}
                  bio={developer.bio}
                  github={developer.github}
                  linkedin={developer.linkedin}
                  photoURL={developer.photoURL}
                  onViewProfile={handleViewProfile}
                  onInviteToTeam={handleInviteToTeam}
                />
              ))}
            </div>

            {hasMore && !searchTerm && !selectedSkill && !selectedUniversity && (
              <div className="text-center mt-8">
                <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" size="lg">
                  {loadingMore ? "Loading..." : "Load More Developers"}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Developer Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Developer Profile</DialogTitle>
            </DialogHeader>

            {selectedDeveloper && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedDeveloper.photoURL || "/placeholder.svg"} alt={selectedDeveloper.name} />
                    <AvatarFallback className="text-lg">{selectedDeveloper.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{selectedDeveloper.name}</h2>

                    {selectedDeveloper.university && (
                      <p className="text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedDeveloper.university}
                      </p>
                    )}

                    <p className="text-muted-foreground flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {selectedDeveloper.email}
                    </p>
                  </div>
                </div>

                {selectedDeveloper.bio && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">About</h3>
                    <p className="text-muted-foreground">{selectedDeveloper.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeveloper.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  {selectedDeveloper.github && (
                    <Button variant="outline" asChild>
                      <a
                        href={`https://github.com/${selectedDeveloper.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}

                  {selectedDeveloper.linkedin && (
                    <Button variant="outline" asChild>
                      <a
                        href={`https://linkedin.com/in/${selectedDeveloper.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}

                  <Button onClick={() => handleInviteToTeam(selectedDeveloper.id)}>Invite to Team</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Team Invite Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite {selectedDeveloper?.name} to Team</DialogTitle>
            </DialogHeader>

            {inviteMessage && (
              <Alert className={inviteMessage.includes("successfully") ? "" : "border-destructive"}>
                <AlertDescription>{inviteMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Team</label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userTeams.length === 0 && (
                <p className="text-sm text-muted-foreground">You need to create a team first to send invitations.</p>
              )}

              <Button
                onClick={handleSendInvite}
                disabled={inviting || !selectedTeamId || userTeams.length === 0}
                className="w-full"
              >
                {inviting ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
