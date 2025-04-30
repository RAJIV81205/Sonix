import { verify } from 'jsonwebtoken';
import { findUserByEmail } from '@/lib/db/auth';

export async function verifyToken(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) return null;

    const decoded = verify(token, process.env.JWT_SECRET!) as { email: string };

    if (!decoded?.email) return null;

    const user = await findUserByEmail(decoded.email);

    if (!user) return null;

    return user; // Return user data instead of NextResponse

  } catch (error) {
    return null;
  }
}
