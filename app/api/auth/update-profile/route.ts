import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/middleware/verifyToken';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
});

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // If username is being updated, check if it's already taken
    if (validatedData.username) {
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, validatedData.username));

      if (existingUser.length > 0 && existingUser[0].id !== decoded.userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // If email is being updated, check if it's already taken
    if (validatedData.email) {
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, validatedData.email));

      if (existingUser.length > 0 && existingUser[0].id !== decoded.userId) {
        return NextResponse.json(
          { error: 'Email already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await db
      .update(usersTable)
      .set(validatedData)
      .where(eq(usersTable.id, decoded.userId))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 