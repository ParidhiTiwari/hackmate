import { NextResponse } from "next/server"

const challenges = [
  {
    id: 1,
    title: "Build a Todo App",
    description: "Create a simple todo application with add, edit, delete, and mark complete functionality.",
    difficulty: "Beginner",
    technologies: ["HTML", "CSS", "JavaScript"],
    estimatedTime: "2-4 hours",
  },
  {
    id: 2,
    title: "Weather Dashboard",
    description: "Build a weather app that shows current conditions and 5-day forecast using a weather API.",
    difficulty: "Intermediate",
    technologies: ["React", "API Integration", "CSS"],
    estimatedTime: "4-6 hours",
  },
  {
    id: 3,
    title: "Chat Application",
    description: "Create a real-time chat app with multiple rooms and user authentication.",
    difficulty: "Advanced",
    technologies: ["React", "Socket.io", "Node.js", "MongoDB"],
    estimatedTime: "8-12 hours",
  },
  {
    id: 4,
    title: "Portfolio Website",
    description: "Design and build a personal portfolio website showcasing your projects and skills.",
    difficulty: "Beginner",
    technologies: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    estimatedTime: "3-5 hours",
  },
  {
    id: 5,
    title: "E-commerce Store",
    description: "Build a full-stack e-commerce application with product catalog, cart, and checkout.",
    difficulty: "Advanced",
    technologies: ["React", "Node.js", "Database", "Payment Integration"],
    estimatedTime: "15-20 hours",
  },
  {
    id: 6,
    title: "URL Shortener",
    description: "Create a service that shortens long URLs and tracks click analytics.",
    difficulty: "Intermediate",
    technologies: ["Node.js", "Database", "Express", "Analytics"],
    estimatedTime: "5-7 hours",
  },
  {
    id: 7,
    title: "Recipe Finder",
    description: "Build an app that searches for recipes based on available ingredients.",
    difficulty: "Intermediate",
    technologies: ["React", "API Integration", "Search Functionality"],
    estimatedTime: "4-6 hours",
  },
  {
    id: 8,
    title: "Task Management System",
    description: "Create a Kanban-style project management tool with drag-and-drop functionality.",
    difficulty: "Advanced",
    technologies: ["React", "Drag & Drop", "State Management", "Backend"],
    estimatedTime: "10-15 hours",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")

    let filteredChallenges = challenges

    if (difficulty) {
      filteredChallenges = challenges.filter(
        (challenge) => challenge.difficulty.toLowerCase() === difficulty.toLowerCase(),
      )
    }

    if (filteredChallenges.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No challenges found for the specified difficulty",
        },
        { status: 404 },
      )
    }

    // Get random challenge
    const randomIndex = Math.floor(Math.random() * filteredChallenges.length)
    const randomChallenge = filteredChallenges[randomIndex]

    return NextResponse.json({
      success: true,
      challenge: randomChallenge,
      availableDifficulties: ["Beginner", "Intermediate", "Advanced"],
      totalChallenges: challenges.length,
      message: "Random coding challenge fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching random challenge:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch random challenge" }, { status: 500 })
  }
}
