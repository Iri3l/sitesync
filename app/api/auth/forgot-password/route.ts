import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { randomBytes } from "crypto"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Only directors can use forgot password
    if (!user || user.role !== "director") {
      // Return success anyway to prevent email enumeration
      // But don't actually send an email
      return NextResponse.json({
        message: "If a director account exists with this email, you will receive a password reset link.",
      })
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    })

    // Generate a secure token
    const token = randomBytes(32).toString("hex")

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    })

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // In development, log the reset URL to console
    if (process.env.NODE_ENV === "development") {
      console.log("\n" + "=".repeat(60))
      console.log("🔑 PASSWORD RESET LINK (Development Mode)")
      console.log("=".repeat(60))
      console.log(`User: ${user.email}`)
      console.log(`Link: ${resetUrl}`)
      console.log("=".repeat(60) + "\n")
    }

    // Try to send email, but don't fail if it doesn't work
    try {
      await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
        userName: user.name,
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      // In development, we already logged the URL, so continue
      if (process.env.NODE_ENV !== "development") {
        throw emailError
      }
    }

    return NextResponse.json({
      message: "If a director account exists with this email, you will receive a password reset link.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    console.error("Forgot password error:", error)
    
    // Don't expose internal errors
    return NextResponse.json({
      message: "If a director account exists with this email, you will receive a password reset link.",
    })
  }
}

