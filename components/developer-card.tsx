"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Linkedin, MapPin, User } from "lucide-react"

interface DeveloperCardProps {
  id: string
  name: string
  university: string
  skills: string[]
  bio: string
  github?: string
  linkedin?: string
  photoURL?: string
  onViewProfile?: (id: string) => void
  onInviteToTeam?: (id: string) => void
}

export default function DeveloperCard({
  id,
  name,
  university,
  skills,
  bio,
  github,
  linkedin,
  photoURL,
  onViewProfile,
  onInviteToTeam,
}: DeveloperCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={photoURL || "/placeholder.svg"} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{name}</h3>
            {university && (
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {university}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {bio && <p className="text-sm text-muted-foreground line-clamp-3">{bio}</p>}

        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 4} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            {github && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3" />
                </a>
              </Button>
            )}
            {linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://linkedin.com/in/${linkedin}`} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {onViewProfile && (
              <Button variant="outline" size="sm" onClick={() => onViewProfile(id)}>
                <User className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            {onInviteToTeam && (
              <Button size="sm" onClick={() => onInviteToTeam(id)}>
                Invite
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
