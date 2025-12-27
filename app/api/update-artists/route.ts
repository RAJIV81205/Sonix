import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { updatedArtists } = await request.json();
    
    if (!updatedArtists || !Array.isArray(updatedArtists)) {
      return NextResponse.json(
        { error: 'Invalid artists data' },
        { status: 400 }
      );
    }

    // Read the current constant file
    const constantsPath = join(process.cwd(), 'lib', 'constant.ts');
    
    let currentContent: string;
    try {
      currentContent = readFileSync(constantsPath, 'utf8');
    } catch (readError) {
      return NextResponse.json(
        { error: 'Failed to read constant file. Please ensure lib/constant.ts exists.' },
        { status: 500 }
      );
    }
    
    // Find the topArtists export and replace it
    const exportString = `export const topArtists = ${JSON.stringify(updatedArtists, null, 2)};`;
    
    // Check if topArtists export exists in the file
    if (!currentContent.includes('export const topArtists')) {
      return NextResponse.json(
        { error: 'topArtists export not found in constant file. Please ensure it exists.' },
        { status: 400 }
      );
    }
    
    // Replace the topArtists export in the file
    const updatedContent = currentContent.replace(
      /export const topArtists = \[[\s\S]*?\];/,
      exportString
    );
    
    // Verify the replacement worked
    if (updatedContent === currentContent) {
      return NextResponse.json(
        { error: 'Failed to replace topArtists data. The format might have changed.' },
        { status: 500 }
      );
    }
    
    // Write the updated content back to the file
    try {
      writeFileSync(constantsPath, updatedContent, 'utf8');
    } catch (writeError) {
      return NextResponse.json(
        { error: 'Failed to write to constant file. Check file permissions.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Artists data updated successfully in constant file',
      updatedCount: updatedArtists.length
    });
    
  } catch (error) {
    console.error('Error updating artists:', error);
    return NextResponse.json(
      { error: 'Failed to update artists data' },
      { status: 500 }
    );
  }
}