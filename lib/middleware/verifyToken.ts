import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { findUserByEmail } from '@/lib/db/auth';

export async function verifyToken(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { email: string };

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await findUserByEmail(decoded.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Token verification failed', details: error.message }, { status: 500 });
  }
}
