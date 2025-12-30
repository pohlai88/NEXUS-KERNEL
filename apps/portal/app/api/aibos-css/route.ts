import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

/**
 * API route to serve AIBOS Design System CSS
 * Workaround for Next.js 16 CSS parser incompatibility
 */
export async function GET() {
  try {
    // Try to read from public folder first
    const publicPath = join(process.cwd(), 'public', 'aibos-design-system.css');
    let cssContent: string;
    
    try {
      cssContent = readFileSync(publicPath, 'utf-8');
    } catch {
      // Fallback to node_modules
      const nodeModulesPath = join(
        process.cwd(),
        'node_modules',
        'aibos-design-system',
        'style.css'
      );
      cssContent = readFileSync(nodeModulesPath, 'utf-8');
    }

    return new NextResponse(cssContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving AIBOS CSS:', error);
    return new NextResponse('CSS file not found', { status: 404 });
  }
}

