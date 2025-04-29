import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { findUserByEmail } from '@/lib/db/auth';

export async function POST(request:Request){
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const decoded = verify(token, process.env.JWT_SECRET!);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        const user = await findUserByEmail(decoded.email)


        return NextResponse.json({ user: decoded }, { status: 200 });
        
    } catch (error) {
        
    }
}