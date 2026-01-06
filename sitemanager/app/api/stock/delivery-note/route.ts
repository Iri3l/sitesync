import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only managers can process delivery notes
    const userRole = session.user.role || "user"
    if (userRole !== "manager") {
      return NextResponse.json(
        { error: "Only managers can process delivery notes" },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64Image}`

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4o" for better accuracy
      messages: [
        {
          role: "system",
          content: `You are an expert at reading delivery notes and invoices. Extract all items from the delivery note with their quantities and units. Return ONLY a valid JSON array in this exact format:
[
  {
    "name": "Item name as written on delivery note",
    "quantity": number,
    "unit": "pcs" or "boxes" or "bags" or "kg" or "m2" or "m3" or other unit found
  }
]
If you cannot find any items, return an empty array [].`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
            {
              type: "text",
              text: "Extract all items from this delivery note. Return only the JSON array, no other text.",
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content || "[]"
    
    // Parse JSON response
    let items
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      items = JSON.parse(cleanedContent)
    } catch (error) {
      console.error("Failed to parse AI response:", content)
      return NextResponse.json(
        { error: "Failed to parse delivery note. Please try again." },
        { status: 500 }
      )
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      )
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Delivery note processing error:", error)
    return NextResponse.json(
      { error: "Failed to process delivery note" },
      { status: 500 }
    )
  }
}

