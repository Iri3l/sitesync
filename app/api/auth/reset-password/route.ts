import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// GET - Verify if token is valid
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", valid: false },
        { status: 400 }
      )
    }

    // Find token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token", valid: false },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "Token has expired. Please request a new password reset.", valid: false },
        { status: 400 }
      )
    }

    // Verify the user is still a director
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      select: { role: true },
    })

    if (!user || user.role !== "director") {
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "This reset link is no longer valid", valid: false },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true, email: resetToken.email })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      { error: "An error occurred", valid: false },
      { status: 500 }
    )
  }
}

// POST - Reset the password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "Token has expired. Please request a new password reset." },
        { status: 400 }
      )
    }

    // Verify the user exists and is still a director
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true, role: true },
    })

    if (!user || user.role !== "director") {
      await prisma.passwordResetToken.delete({
        where: { token },
      })

      return NextResponse.json(
        { error: "This reset link is no longer valid" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and delete the token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ])

    return NextResponse.json({
      message: "Password reset successfully. You can now sign in with your new password.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    )
  }
}

