import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, hashPassword } from '@/lib/db/auth';
import { otpStore } from '@/lib/otp-store';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Check if OTP was verified
    if (!otpStore.isVerified(validatedData.email)) {
      return NextResponse.json(
        { error: 'Please verify OTP first' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update password
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.email, validatedData.email));

    // Clear OTP from store
    otpStore.delete(validatedData.email);

    return NextResponse.json({
      message: 'Password reset successfully',
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
