import { NextResponse } from "next/server"

const codingTips = [
  {
    id: 1,
    title: "Write Clean Code",
    tip: "Use meaningful variable names and keep functions small and focused. Your future self will thank you!",
    category: "Best Practices",
  },
  {
    id: 2,
    title: "Test Early, Test Often",
    tip: "Write tests as you code, not after. It helps catch bugs early and makes refactoring safer.",
    category: "Testing",
  },
  {
    id: 3,
    title: "Version Control Everything",
    tip: "Commit often with descriptive messages. Use branches for features and never commit directly to main.",
    category: "Git",
  },
  {
    id: 4,
    title: "Learn the Debugger",
    tip: "Stop using console.log for everything. Learn to use your IDE's debugger - it's much more powerful.",
    category: "Debugging",
  },
  {
    id: 5,
    title: "Read Documentation",
    tip: "Before asking for help, read the official documentation. It's usually more accurate than Stack Overflow.",
    category: "Learning",
  },
  {
    id: 6,
    title: "Optimize Later",
    tip: "Premature optimization is the root of all evil. Make it work first, then make it fast.",
    category: "Performance",
  },
  {
    id: 7,
    title: "Code Reviews Matter",
    tip: "Always review code carefully. Look for logic errors, not just syntax. Ask questions if something isn't clear.",
    category: "Collaboration",
  },
  {
    id: 8,
    title: "Keep Learning",
    tip: "Technology changes fast. Dedicate time each week to learning new tools, languages, or frameworks.",
    category: "Growth",
  },
  {
    id: 9,
    title: "Backup Your Work",
    tip: "Use cloud storage, multiple repositories, or external drives. Never lose weeks of work to hardware failure.",
    category: "Safety",
  },
  {
    id: 10,
    title: "Take Breaks",
    tip: "Step away from the screen regularly. Some of the best solutions come when you're not actively coding.",
    category: "Wellness",
  },
]

export async function GET() {
  try {
    // Get random tip
    const randomIndex = Math.floor(Math.random() * codingTips.length)
    const randomTip = codingTips[randomIndex]

    return NextResponse.json({
      success: true,
      tip: randomTip,
      totalTips: codingTips.length,
      message: "Random coding tip fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching random tip:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch random tip" }, { status: 500 })
  }
}
