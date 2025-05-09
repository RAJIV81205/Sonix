import { NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db/auth';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';

const googleUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  photoURL: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = googleUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await findUserByEmail(validatedData.email);

    if (existingUser) {
      // User exists, create JWT token
      const token = sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = existingUser;

      return NextResponse.json({
        user: userWithoutPassword,
        token,
      });
    }

    // Generate a random password for the user
    const randomPassword = Math.random().toString(36).slice(-8);
    
    // Create new user
    const newUser = await createUser(
      validatedData.email,
      randomPassword,
      validatedData.email.split('@')[0], // Generate username from email
      validatedData.name
    );

    // Create JWT token
    const token = sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Google login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
