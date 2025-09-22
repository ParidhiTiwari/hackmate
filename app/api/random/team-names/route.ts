import { NextResponse } from "next/server"

const adjectives = [
  "Agile",
  "Binary",
  "Cyber",
  "Digital",
  "Epic",
  "Fast",
  "Global",
  "Hyper",
  "Infinite",
  "Quantum",
  "Rapid",
  "Smart",
  "Tech",
  "Ultra",
  "Virtual",
  "Wise",
  "Alpha",
  "Beta",
  "Core",
  "Dynamic",
  "Elite",
  "Fusion",
  "Genius",
  "Hybrid",
  "Innovative",
  "Lightning",
  "Mega",
  "Neural",
  "Optimal",
  "Prime",
]

const nouns = [
  "Coders",
  "Developers",
  "Engineers",
  "Hackers",
  "Innovators",
  "Makers",
  "Builders",
  "Creators",
  "Architects",
  "Wizards",
  "Ninjas",
  "Pirates",
  "Warriors",
  "Knights",
  "Guardians",
  "Masters",
  "Legends",
  "Heroes",
  "Pioneers",
  "Explorers",
  "Rebels",
  "Mavericks",
  "Titans",
  "Phoenix",
  "Dragons",
  "Eagles",
  "Lions",
  "Wolves",
  "Panthers",
  "Sharks",
]

const techWords = [
  "Code",
  "Byte",
  "Pixel",
  "Logic",
  "Stack",
  "Node",
  "Core",
  "Link",
  "Sync",
  "Flow",
  "Loop",
  "Hash",
  "Key",
  "Net",
  "Web",
  "Cloud",
  "Data",
  "Bit",
  "Tech",
  "Dev",
  "App",
  "API",
  "Bot",
  "AI",
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count") || "5")
    const maxCount = Math.min(count, 20) // Limit to 20 names max

    const teamNames = []

    for (let i = 0; i < maxCount; i++) {
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
      const randomTech = techWords[Math.floor(Math.random() * techWords.length)]

      // Generate different name patterns
      const patterns = [
        `${randomAdjective} ${randomNoun}`,
        `${randomTech} ${randomNoun}`,
        `${randomAdjective} ${randomTech}`,
        `${randomTech} ${randomAdjective}`,
        `The ${randomAdjective} ${randomNoun}`,
      ]

      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
      teamNames.push(randomPattern)
    }

    // Remove duplicates
    const uniqueNames = [...new Set(teamNames)]

    return NextResponse.json({
      success: true,
      teamNames: uniqueNames,
      count: uniqueNames.length,
      message: "Random team names generated successfully",
    })
  } catch (error) {
    console.error("Error generating team names:", error)
    return NextResponse.json({ success: false, error: "Failed to generate team names" }, { status: 500 })
  }
}
