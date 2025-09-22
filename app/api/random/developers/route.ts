import { NextResponse } from "next/server"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    // Get random developers from Firestore
    const developersRef = collection(db, "users")
    const q = query(developersRef, limit(10))
    const snapshot = await getDocs(q)

    const developers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Shuffle the array and return random selection
    const shuffled = developers.sort(() => 0.5 - Math.random())
    const randomDevelopers = shuffled.slice(0, 3)

    return NextResponse.json({
      success: true,
      developers: randomDevelopers,
      message: "Random developers fetched successfully",
    })
  } catch (error) {
    console.error("Error fetching random developers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch random developers" }, { status: 500 })
  }
}
