import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface ParsedItem {
  id: string | null;
  name: string | null;
  description: string | null;
  image: string | null;
}

interface ParsedSection {
  section: string | null;
  items: ParsedItem[];
}

// Parser function from your provided code
function parseSpotifyBrowseResponse(raw: any): ParsedSection[] {
  const sections = raw?.data?.browse?.sections?.items || [];
  
  return sections.map((section: any) => {
    const sectionName = section?.data?.title?.transformedLabel || null;
    const items = section?.sectionItems?.items || [];
    
    return {
      section: sectionName,
      items: items.map((item: any) => {
        const data = item?.content?.data || {};
        return {
          id: data?.uri ? data.uri.split(":").pop() : null,
          name: data?.name || null,
          description: data?.description || null,
          image: data?.images?.items?.[0]?.sources?.[0]?.url || null,
        } as ParsedItem;
      }),
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const { rawApiResponse } = await request.json();
    
    if (!rawApiResponse) {
      return NextResponse.json(
        { error: 'No API response provided' },
        { status: 400 }
      );
    }

    // Parse the raw API response
    let parsedData;
    try {
      const jsonData = typeof rawApiResponse === 'string' 
        ? JSON.parse(rawApiResponse) 
        : rawApiResponse;
      
      parsedData = parseSpotifyBrowseResponse(jsonData);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse API response. Please check the JSON format.' },
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
    
    // Create the new topHitsHindi export string
    const exportString = `export const topHitsHindi = ${JSON.stringify(parsedData, null, 2)};`;
    
    // Check if topHitsHindi export exists in the file
    if (!currentContent.includes('export const topHitsHindi')) {
      return NextResponse.json(
        { error: 'topHitsHindi export not found in constant file. Please ensure it exists.' },
        { status: 400 }
      );
    }
    
    // Replace the topHitsHindi export in the file
    const updatedContent = currentContent.replace(
      /export const topHitsHindi = \[[\s\S]*?\];/,
      exportString
    );
    
    // Verify the replacement worked
    if (updatedContent === currentContent) {
      return NextResponse.json(
        { error: 'Failed to replace topHitsHindi data. The format might have changed.' },
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
      message: 'Top Hits Hindi data updated successfully in constant file',
      sectionsCount: parsedData.length,
      totalItems: parsedData.reduce((acc: number, section: ParsedSection) => acc + section.items.length, 0),
      parsedData
    });
    
  } catch (error) {
    console.error('Error updating top hits hindi:', error);
    return NextResponse.json(
      { error: 'Failed to update top hits hindi data' },
      { status: 500 }
    );
  }
}