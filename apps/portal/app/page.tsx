'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Nexus Canon Portal - Premium Landing Experience
 *
 * Built with:
 * - 254 AIBOS Design Tokens (colors, spacing, typography, shadows, radius)
 * - Beast Mode Patterns (Radio State Machine, Omni Shell, Frozen Grid)
 * - Premium Creative Design (no typical SaaS patterns)
 * - Cursor IDE Never-Reach Quality
 */
export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Beast Mode: Radio State Machine for View Switching (0ms latency)
  const [activeView, setActiveView] = useState<'hero' | 'features' | 'showcase'>('hero');

  return (
    <div className="vmp-creative vmp-marketing" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--color-void)' }}>
      {/* Beast Mode: Radio State Machine - Pure CSS View Switching */}
      <input
        type="radio"
        name="home-view"
        id="view-hero"
        className="na-state-radio"
        defaultChecked
        suppressHydrationWarning
      />
      <input
        type="radio"
        name="home-view"
        id="view-features"
        className="na-state-radio"
        suppressHydrationWarning
      />
      <input
        type="radio"
        name="home-view"
        id="view-showcase"
        className="na-state-radio"
        suppressHydrationWarning
      />

      {/* Dynamic Gradient Background - Uses AIBOS Color Tokens */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.15,
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            var(--color-info) 0%,
            var(--color-void) 60%)`,
          transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 0,
        }}
      />

      {/* Subtle Grid Pattern - Uses AIBOS Spacing Tokens */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(var(--color-stroke) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-stroke) 1px, transparent 1px)
          `,
          backgroundSize: 'var(--spacing-12) var(--spacing-12)',
          zIndex: 0,
        }}
      />

      {/* Beast Mode: Omni Shell Layout */}
      <div className="na-shell-omni" style={{ minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        {/* Header - Beast Mode Omni Shell Head */}
        <header className="na-shell-head" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-6) var(--spacing-8)',
          borderBottom: '1px solid var(--color-stroke)',
          background: 'var(--color-paper)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div className="na-flex na-items-center" style={{ gap: 'var(--spacing-4)' }}>
            <div className="na-h4" style={{ color: 'var(--color-lux)' }}>Nexus Canon</div>
            <div className="na-metadata" style={{ color: 'var(--color-clay)' }}>Portal</div>
          </div>

          {/* Beast Mode: View Switcher - Radio State Machine */}
          <div className="na-flex na-items-center" style={{ gap: 'var(--spacing-2)' }}>
            <label htmlFor="view-hero" id="lbl-hero" className="na-state-label">
              Hero
            </label>
            <label htmlFor="view-features" id="lbl-features" className="na-state-label">
              Features
            </label>
            <label htmlFor="view-showcase" id="lbl-showcase" className="na-state-label">
              Showcase
            </label>
          </div>

          <div className="na-flex na-items-center" style={{ gap: 'var(--spacing-4)' }}>
            <span className="na-status ok" role="status">Live</span>
            <button
              className="na-btn na-btn-ghost"
              onClick={() => router.push('/omni-dashboard')}
            >
              Enter Portal
            </button>
          </div>
        </header>

        {/* Main Content Area - Beast Mode Omni Shell Main */}
        <main className="na-shell-main" style={{ position: 'relative' }}>
          {/* View 1: Hero Section */}
          <div id="view-hero" className="na-view-pane" style={{
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-8) var(--spacing-4)',
          }}>
            <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
              {/* Version Badge - Uses AIBOS Tokens */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius-full)',
                  marginBottom: 'var(--spacing-8)',
                  background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-success) 100%)',
                  backgroundOpacity: 0.1,
                  border: '1px solid var(--color-stroke-strong)',
                  backdropFilter: 'blur(10px)',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-success)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
                <span className="na-metadata" style={{ color: 'var(--color-lux)' }}>
                  AIBOS Design System v2.0 • 254 Tokens • Beast Mode
                </span>
              </div>

              {/* Main Headline - Uses AIBOS Typography Tokens */}
              <h1
                className="na-h1"
                style={{
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: 'var(--line-height-tight)',
                  letterSpacing: 'var(--letter-spacing-tight)',
                  marginBottom: 'var(--spacing-6)',
                  background: `linear-gradient(135deg,
                    var(--color-lux) 0%,
                    var(--color-clay) 50%,
                    var(--color-lux) 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
                }}
              >
                Business Operating
                <br />
                <span style={{
                  background: `linear-gradient(135deg,
                    var(--color-info) 0%,
                    var(--color-success) 50%,
                    var(--color-warning) 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  System Redefined
                </span>
              </h1>

              {/* Subheading - Uses AIBOS Typography */}
              <p
                className="na-body"
                style={{
                  fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                  color: 'var(--color-clay)',
                  lineHeight: 'var(--line-height-relaxed)',
                  fontWeight: 'var(--font-weight-light)',
                  maxWidth: '700px',
                  margin: '0 auto var(--spacing-12)',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
                }}
              >
                Experience the future with 254 design tokens, Beast Mode patterns,
                and enterprise-grade architecture. Zero latency. Pure elegance.
              </p>

              {/* CTA Buttons - Uses AIBOS Button Classes */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-16)',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
                }}
              >
                <button
                  onClick={() => router.push('/omni-dashboard')}
                  className="na-btn na-btn-primary"
                  style={{
                    padding: 'var(--spacing-4) var(--spacing-8)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: 'var(--radius-lg)',
                    background: `linear-gradient(135deg,
                      var(--color-info) 0%,
                      var(--color-success) 100%)`,
                    color: 'var(--color-void)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--default-transition-duration)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                >
                  Enter Portal
                </button>

                <button
                  onClick={() => router.push('/demo')}
                  className="na-btn na-btn-ghost"
                  style={{
                    padding: 'var(--spacing-4) var(--spacing-8)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--color-stroke-strong)',
                  }}
                >
                  View Components
                </button>
              </div>

              {/* Stats Grid - Uses AIBOS Card Classes */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--spacing-4)',
                  maxWidth: '900px',
                  margin: '0 auto',
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.8s',
                }}
              >
                {[
                  { value: '254', label: 'Design Tokens', trend: 'Complete' },
                  { value: '450+', label: 'shadcn Components', trend: 'Available' },
                  { value: '0ms', label: 'View Latency', trend: 'Beast Mode' },
                  { value: '100%', label: 'AIBOS Coverage', trend: 'Pure CSS' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="na-card"
                    style={{
                      padding: 'var(--spacing-6)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-paper)',
                      border: '1px solid var(--color-stroke)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all var(--default-transition-duration)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                      e.currentTarget.style.borderColor = 'var(--color-stroke-strong)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'var(--color-stroke)';
                    }}
                  >
                    <div className="na-data-large" style={{ color: 'var(--color-lux)', marginBottom: 'var(--spacing-2)' }}>
                      {stat.value}
                    </div>
                    <div className="na-metadata" style={{ color: 'var(--color-clay)', marginBottom: 'var(--spacing-1)' }}>
                      {stat.label}
                    </div>
                    <div className="na-status ok" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {stat.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View 2: Features Section - Beast Mode Pattern Showcase */}
          <div id="view-features" className="na-view-pane" style={{
            minHeight: 'calc(100vh - 80px)',
            padding: 'var(--spacing-16) var(--spacing-4)',
            display: 'none',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="na-h2" style={{
                textAlign: 'center',
                marginBottom: 'var(--spacing-12)',
                color: 'var(--color-lux)',
              }}>
                Beast Mode Patterns
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-6)',
              }}>
                {[
                  {
                    title: 'Radio State Machine',
                    description: '0ms latency view switching with pure CSS',
                    icon: '⚡',
                    pattern: 'na-state-radio',
                  },
                  {
                    title: 'Frozen Grid',
                    description: 'Excel-like bi-directional sticky tables',
                    icon: '🎯',
                    pattern: 'na-grid-frozen',
                  },
                  {
                    title: 'Omni Shell',
                    description: 'Professional grid-based application shell',
                    icon: '🚀',
                    pattern: 'na-shell-omni',
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="na-card"
                    style={{
                      padding: 'var(--spacing-8)',
                      borderRadius: 'var(--radius-xl)',
                      background: 'var(--color-paper)',
                      border: '1px solid var(--color-stroke)',
                      transition: 'all var(--default-transition-duration)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-4)' }}>
                      {feature.icon}
                    </div>
                    <div className="na-h4" style={{ color: 'var(--color-lux)', marginBottom: 'var(--spacing-2)' }}>
                      {feature.title}
                    </div>
                    <div className="na-body" style={{ color: 'var(--color-clay)', marginBottom: 'var(--spacing-4)' }}>
                      {feature.description}
                    </div>
                    <div className="na-metadata" style={{
                      color: 'var(--color-info)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      .{feature.pattern}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View 3: Showcase Section */}
          <div id="view-showcase" className="na-view-pane" style={{
            minHeight: 'calc(100vh - 80px)',
            padding: 'var(--spacing-16) var(--spacing-4)',
            display: 'none',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
              <div className="na-h2" style={{
                marginBottom: 'var(--spacing-12)',
                color: 'var(--color-lux)',
              }}>
                254 Design Tokens • 450+ Components
              </div>
              <p className="na-body" style={{
                color: 'var(--color-clay)',
                maxWidth: '600px',
                margin: '0 auto var(--spacing-12)',
              }}>
                Every color, spacing, typography, shadow, and radius token from AIBOS Design System.
                Combined with 450+ shadcn components for unlimited possibilities.
              </p>
              <button
                onClick={() => router.push('/demo')}
                className="na-btn na-btn-primary"
                style={{
                  padding: 'var(--spacing-4) var(--spacing-8)',
                  fontSize: 'var(--font-size-lg)',
                }}
              >
                Explore Components
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Beast Mode CSS - Radio State Machine Logic (Pure CSS, 0ms latency) */}
      <style jsx global>{`
        /* Radio State Machine - 0ms latency view switching (Pure CSS) */
        #view-hero:checked ~ .na-shell-omni #lbl-hero,
        #view-features:checked ~ .na-shell-omni #lbl-features,
        #view-showcase:checked ~ .na-shell-omni #lbl-showcase {
          background: var(--color-paper-2);
          color: var(--color-lux);
          border: 1px solid var(--color-stroke-strong);
        }

        #view-hero:checked ~ .na-shell-omni #view-hero {
          display: flex !important;
        }
        #view-features:checked ~ .na-shell-omni #view-features {
          display: block !important;
        }
        #view-showcase:checked ~ .na-shell-omni #view-showcase {
          display: block !important;
        }

        .na-view-pane {
          display: none;
        }

        .na-state-label {
          padding: var(--spacing-1_5) var(--spacing-3);
          border-radius: var(--radius-control);
          border: 1px solid var(--color-stroke);
          background: transparent;
          color: var(--color-clay);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          transition: all var(--default-transition-duration);
          cursor: pointer;
        }

        .na-state-label:hover {
          background: var(--color-paper-2);
          color: var(--color-lux);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar using AIBOS tokens */
        ::-webkit-scrollbar {
          width: var(--spacing-2);
        }

        ::-webkit-scrollbar-track {
          background: var(--color-void);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--color-stroke-strong);
          border-radius: var(--radius-sm);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--color-stroke);
        }
      `}</style>
    </div>
  );
}
