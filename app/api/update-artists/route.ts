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
    const currentContent = readFileSync(constantsPath, 'utf8');
    
    // Find the topArtists export and replace it
    const exportString = `export const topArtists = ${JSON.stringify(updatedArtists, null, 2)};`;
    
    // Replace the topArtists export in the file
    const updatedContent = currentContent.replace(
      /export const topArtists = \[[\s\S]*?\];/,
      exportString
    );
    
    // Write the updated content back to the file
    writeFileSync(constantsPath, updatedContent, 'utf8');
    
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