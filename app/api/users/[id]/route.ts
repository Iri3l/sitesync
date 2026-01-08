import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPermissions } from "@/lib/permissions"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Schema for updating user
const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["user", "supervisor", "manager"]).optional(),
})

// Schema for resetting password
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
})

// GET - Get single user details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permissions = getPermissions(session.user.role || "user")

    if (!permissions.canManageUsers) {
      return NextResponse.json(
        { error: "You don't have permission to view user details" },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            sites: true,
            snags: true,
            siteDiaries: true,
            stockTransactions: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update user (role, name)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permissions = getPermissions(session.user.role || "user")

    if (!permissions.canChangeUserRoles) {
      return NextResponse.json(
        { error: "You don't have permission to update users" },
        { status: 403 }
      )
    }

    // Can't modify own account through this endpoint
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot modify your own account through this endpoint" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Can't modify other directors
    if (targetUser.role === "director") {
      return NextResponse.json(
        { error: "You cannot modify another director's account" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = updateUserSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.role !== undefined && { role: validated.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const permissions = getPermissions(session.user.role || "user")

    if (!permissions.canManageUsers) {
      return NextResponse.json(
        { error: "You don't have permission to delete users" },
        { status: 403 }
      )
    }

    // Can't delete own account
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Can't delete other directors
    if (targetUser.role === "director") {
      return NextResponse.json(
        { error: "You cannot delete another director's account" },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

