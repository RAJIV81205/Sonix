import { verify } from 'jsonwebtoken';

export async function verifyToken(token : any) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { 
      userId: number;
      email: string;
    };
    
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
} 