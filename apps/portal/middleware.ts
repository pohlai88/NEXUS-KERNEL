import { type NextRequest, NextResponse } from "next/server";

/**
 * NEXUS Landing Page Rotation Middleware
 *
 * Randomly serves one of the static HTML landing pages from /public/landing/
 * when users visit the root path (/).
 *
 * Configuration:
 * - LANDING_PAGES: Array of available landing page filenames
 * - ROTATION_ENABLED: Set to false to disable rotation and use default Next.js page
 * - ROTATION_COOKIE_NAME: Cookie name to optionally persist landing page selection
 *
 * @see apps/portal/public/landing/README.md for full documentation
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const ROTATION_ENABLED = true;

// Default fallback landing page (always used when rotation is disabled, or as error fallback)
const DEFAULT_LANDING = "audit.html";

// Available landing pages for rotation (files in /public/landing/)
// Set to empty array [] to use only the DEFAULT_LANDING (no rotation)
const LANDING_PAGES: string[] = [
  "alpha.html",
  "audit.html",
  "god-view.html",
  "gpt.html",
  "king-class.html",
  "physics.html",
  "pressure.html",
  "saas.html",
  "solaris.html",
  "story.html",
];

// Cookie settings for persistent landing (optional feature)
const ROTATION_COOKIE_NAME = "nexus_landing";
const ROTATION_COOKIE_MAX_AGE = 60 * 60; // 1 hour - how long to show same landing

// Set to true to persist the same landing for a user session
const PERSIST_LANDING = false;

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept the root path
  if (pathname !== "/") {
    return NextResponse.next();
  }

  // Skip rotation - serve default landing or fall through to page.tsx
  if (!ROTATION_ENABLED) {
    // Serve the default static landing (not page.tsx)
    const url = request.nextUrl.clone();
    url.pathname = `/landing/${DEFAULT_LANDING}`;
    return NextResponse.rewrite(url);
  }

  let selectedLanding: string;

  // If no rotation pages configured, use default
  if (LANDING_PAGES.length === 0) {
    selectedLanding = DEFAULT_LANDING;
  } else if (PERSIST_LANDING) {
    // Check for existing cookie
    const existingLanding = request.cookies.get(ROTATION_COOKIE_NAME)?.value;

    if (existingLanding && LANDING_PAGES.includes(existingLanding)) {
      selectedLanding = existingLanding;
    } else {
      // Select random landing and set cookie
      selectedLanding =
        LANDING_PAGES[Math.floor(Math.random() * LANDING_PAGES.length)];
    }
  } else {
    // Pure random on every request
    selectedLanding =
      LANDING_PAGES[Math.floor(Math.random() * LANDING_PAGES.length)];
  }

  // Fallback safety check
  if (!selectedLanding) {
    selectedLanding = DEFAULT_LANDING;
  }

  // Rewrite to the static HTML file
  const url = request.nextUrl.clone();
  url.pathname = `/landing/${selectedLanding}`;

  const response = NextResponse.rewrite(url);

  // Set cookie if persistence is enabled
  if (PERSIST_LANDING) {
    response.cookies.set(ROTATION_COOKIE_NAME, selectedLanding, {
      maxAge: ROTATION_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const config = {
  // Only run middleware on root path
  // Excludes API routes, static files, and other paths
  matcher: [
    "/",
    // Add more paths here if you want rotation on other routes
    // '/welcome',
    // '/home',
  ],
};
