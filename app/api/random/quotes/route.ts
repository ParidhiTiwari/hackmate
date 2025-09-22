import { NextResponse } from "next/server"

const programmingQuotes = [
  {
    id: 1,
    quote: "The best way to get a project done faster is to start sooner.",
    author: "Jim Highsmith",
    category: "Productivity",
  },
  {
    id: 2,
    quote: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    category: "Clean Code",
  },
  {
    id: 3,
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    category: "Problem Solving",
  },
  {
    id: 4,
    quote: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde",
    category: "Learning",
  },
  {
    id: 5,
    quote: "In order to be irreplaceable, one must always be different.",
    author: "Coco Chanel",
    category: "Innovation",
  },
  {
    id: 6,
    quote: "Java is to JavaScript what car is to Carpet.",
    author: "Chris Heilmann",
    category: "Humor",
  },
  {
    id: 7,
    quote: "The most important property of a program is whether it accomplishes the intention of its user.",
    author: "C.A.R. Hoare",
    category: "Purpose",
  },
  {
    id: 8,
    quote: "Debugging is twice as hard as writing the code in the first place.",
    author: "Brian Kernighan",
    category: "Debugging",
  },
  {
    id: 9,
    quote:
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    category: "Clean Code",
  },
  {
    id: 10,
    quote: "The function of good software is to make the complex appear to be simple.",
    author: "Grady Booch",
    category: "Design",
  },
]

export async function GET() {
  try {
    // Get random quote
    const randomIndex = Math.floor(Math.random() * programmingQuotes.length)
    const randomQuote = programmingQuotes[randomIndex]

    return NextResponse.json({
      success: true,
      quote: randomQuote,
      totalQuotes: programmingQuotes.length,
      message: "Random programming quote fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching random quote:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch random quote" }, { status: 500 })
  }
}
