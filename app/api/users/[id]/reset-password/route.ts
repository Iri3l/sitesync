import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPermissions } from "@/lib/permissions"
import { z } from "zod"
import bcrypt from "bcryptjs"

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
})

// POST - Reset user password (director only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permissions = getPermissions(session.user.role || "user")

    if (!permissions.canResetPasswords) {
      return NextResponse.json(
        { error: "You don't have permission to reset passwords" },
        { status: 403 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Can't reset password for other directors
    if (targetUser.role === "director" && targetUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "You cannot reset another director's password" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = resetPasswordSchema.parse(body)

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ 
      message: "Password reset successfully",
      userId: params.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

