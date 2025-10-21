import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail } from '@/lib/db/auth';
import { otpStore } from '@/lib/otp-store';
import { generateOTP, sendOTPEmail } from '@/lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await findUserByEmail(validatedData.email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If the email exists, an OTP has been sent' },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    otpStore.set(validatedData.email, otp, 10); // 10 minutes expiry

    // Send OTP via email
    await sendOTPEmail(validatedData.email, otp);

    return NextResponse.json({
      message: 'OTP sent successfully',
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
