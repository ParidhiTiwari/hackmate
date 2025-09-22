"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { X, Plus, Github, Linkedin, Save } from "lucide-react"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/protected-route"

interface UserProfile {
  name: string
  email: string
  university: string
  skills: string[]
  bio: string
  github: string
  linkedin: string
  photoURL: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    university: "",
    skills: [],
    bio: "",
    github: "",
    linkedin: "",
    photoURL: "",
  })
  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        setProfile({
          name: userData.name || user.displayName || "",
          email: userData.email || user.email || "",
          university: userData.university || "",
          skills: userData.skills || [],
          bio: userData.bio || "",
          github: userData.github || "",
          linkedin: userData.linkedin || "",
          photoURL: userData.photoURL || user.photoURL || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage("")

    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        name: profile.name,
        university: profile.university,
        skills: profile.skills,
        bio: profile.bio,
        github: profile.github,
        linkedin: profile.linkedin,
        updatedAt: new Date(),
      })
      setMessage("Profile updated successfully!")
    } catch (error) {
      setMessage("Error updating profile. Please try again.")
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your developer profile and showcase your skills</p>
          </div>

          {message && (
            <Alert className="mb-6">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Preview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Preview</CardTitle>
                  <CardDescription>How others will see your profile</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.photoURL || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback className="text-lg">{profile.name.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl font-semibold text-foreground mb-2">{profile.name || "Your Name"}</h3>

                  {profile.university && <p className="text-muted-foreground mb-3">{profile.university}</p>}

                  {profile.bio && <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>}

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-center space-x-2">
                    {profile.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {profile.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://linkedin.com/in/${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your information and skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile.email} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      value={profile.university}
                      onChange={(e) => setProfile((prev) => ({ ...prev, university: e.target.value }))}
                      placeholder="Enter your university"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself, your interests, and what you're looking for..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a skill (e.g., React, Python, Node.js)"
                      />
                      <Button onClick={addSkill} variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub Username</Label>
                      <Input
                        id="github"
                        value={profile.github}
                        onChange={(e) => setProfile((prev) => ({ ...prev, github: e.target.value }))}
                        placeholder="your-github-username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Username</Label>
                      <Input
                        id="linkedin"
                        value={profile.linkedin}
                        onChange={(e) => setProfile((prev) => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="your-linkedin-username"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
