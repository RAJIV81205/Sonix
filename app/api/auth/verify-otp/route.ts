import { NextResponse } from 'next/server';
import { z } from 'zod';
import { otpStore } from '@/lib/otp-store';

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = verifyOTPSchema.parse(body);

    // Verify OTP
    const isValid = otpStore.verify(validatedData.email, validatedData.otp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'OTP verified successfully',
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
