"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Mail, Code2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { hasRealCredentials, auth, db } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, isDevMode } = useAuth()

  // Redirect if already authenticated
  if (user) {
    router.push("/profile")
    return null
  }

  const handleDemoSignIn = () => {
    setLoading(true)
    // Simulate loading for demo
    setTimeout(() => {
      setLoading(false)
      router.push("/profile")
    }, 1000)
  }

  const createUserProfile = async (user: any, additionalData = {}) => {
    if (!hasRealCredentials || !db) return

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user
      const createdAt = new Date()

      try {
        await setDoc(userRef, {
          name: displayName || additionalData.name || "",
          email,
          photoURL: photoURL || "",
          university: "",
          skills: [],
          bio: "",
          github: "",
          linkedin: "",
          createdAt,
          ...additionalData,
        })
      } catch (error) {
        console.error("Error creating user profile:", error)
      }
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (isDevMode) {
      handleDemoSignIn()
      return
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await createUserProfile(result.user)
      router.push("/profile")
    } catch (error: any) {
      let errorMessage = error.message
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please sign up first."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password authentication is not enabled. Please contact support."
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (isDevMode) {
      handleDemoSignIn()
      return
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })
      await createUserProfile(result.user, { name })
      router.push("/profile")
    } catch (error: any) {
      let errorMessage = error.message
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists. Please sign in instead."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters long."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password authentication is not enabled. Please contact support."
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    if (isDevMode) {
      handleDemoSignIn()
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await createUserProfile(result.user)
      router.push("/profile")
    } catch (error: any) {
      let errorMessage = error.message
      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Google authentication is not enabled. Please contact support."
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign in was cancelled. Please try again."
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setLoading(true)
    setError("")

    if (isDevMode) {
      handleDemoSignIn()
      return
    }

    try {
      const provider = new GithubAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await createUserProfile(result.user)
      router.push("/profile")
    } catch (error: any) {
      let errorMessage = error.message
      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "GitHub authentication is not enabled. Please contact support."
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign in was cancelled. Please try again."
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">HackMate</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome to HackMate</h1>
          <p className="text-muted-foreground mt-2">Connect with developers worldwide</p>
        </div>

        {isDevMode && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Demo Mode:</strong> Firebase not configured. Authentication will work in demo mode only.
              <br />
              <span className="text-sm">Set up Firebase environment variables for full functionality.</span>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              {isDevMode ? "Demo mode - any credentials will work" : "Sign in to your account or create a new one"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={isDevMode ? "demo@example.com (any email works)" : "Enter your email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder={isDevMode ? "password (any password works)" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing In..." : isDevMode ? "Demo Sign In" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={isDevMode ? "demo@example.com (any email works)" : "Enter your email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={isDevMode ? "password (any password works)" : "Create a password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : isDevMode ? "Demo Sign Up" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-transparent"
              >
                <Mail className="mr-2 h-4 w-4" />
                {isDevMode ? "Demo Google" : "Google"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGithubSignIn}
                disabled={loading}
                className="w-full bg-transparent"
              >
                <Github className="mr-2 h-4 w-4" />
                {isDevMode ? "Demo GitHub" : "GitHub"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
