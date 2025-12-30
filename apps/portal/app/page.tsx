import Link from 'next/link';

/**
 * AIBOS NexusCanon — Forensic Accounting Landing
 *
 * Design: Evidence-first forensic accounting. Chain-of-custody, lineage, and defensible verdicts.
 * Built with AIBOS Design System (SSOT) + Forensic theme overlay
 *
 * Visual DNA from audit.html prototype:
 * - Forensic lime accent (#d7ff3f)
 * - Grain texture + ledger lines
 * - Glass panels with radial gradients
 * - Monospace instrumentation
 */

// Forensic Background Effects
function ForensicBackdrop() {
  return (
    <div className="na-fixed na-inset-0 na-pointer-events-none" style={{ zIndex: 0 }}>
      {/* Radial accent gradients */}
      <div
        className="na-absolute na-inset-0"
        style={{
          background: `
            radial-gradient(1200px 700px at 70% 15%, rgba(215,255,63,.10), transparent 55%),
            radial-gradient(900px 520px at 12% 75%, rgba(121,177,255,.08), transparent 60%),
            linear-gradient(180deg, #05070a, #070b10)
          `,
        }}
      />

      {/* Grain texture */}
      <div
        className="na-absolute na-inset-0"
        style={{
          opacity: 0.06,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ledger lines */}
      <div
        className="na-absolute na-inset-0"
        style={{
          opacity: 0.10,
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,.05) 0, rgba(255,255,255,.05) 1px, transparent 1px, transparent 44px)',
          maskImage: 'radial-gradient(1000px 650px at 50% 40%, rgba(0,0,0,1), transparent 65%)',
          WebkitMaskImage: 'radial-gradient(1000px 650px at 50% 40%, rgba(0,0,0,1), transparent 65%)',
        }}
      />

      {/* Redaction strips */}
      <div
        className="na-absolute"
        style={{
          inset: '-40px',
          opacity: 0.08,
          background: `
            linear-gradient(90deg, transparent 0 12%, rgba(255,255,255,.08) 12% 13%, transparent 13% 100%),
            linear-gradient(90deg, transparent 0 55%, rgba(255,255,255,.07) 55% 58%, transparent 58% 100%),
            linear-gradient(90deg, transparent 0 76%, rgba(255,255,255,.06) 76% 78%, transparent 78% 100%)
          `,
          transform: 'skewY(-6deg)',
          filter: 'blur(.2px)',
          maskImage: 'radial-gradient(1000px 650px at 50% 50%, rgba(0,0,0,1), transparent 70%)',
          WebkitMaskImage: 'radial-gradient(1000px 650px at 50% 50%, rgba(0,0,0,1), transparent 70%)',
        }}
      />
    </div>
  );
}

// Forensic Tag Component
function Tag({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'ok' | 'warn' | 'danger' }) {
  const variantStyles = {
    default: { borderColor: 'rgba(255,255,255,.10)', color: 'rgba(255,255,255,.66)', background: 'rgba(255,255,255,.03)' },
    ok: { borderColor: 'rgba(57,217,138,.22)', color: 'rgba(57,217,138,.90)', background: 'rgba(57,217,138,.06)' },
    warn: { borderColor: 'rgba(255,204,102,.22)', color: 'rgba(255,204,102,.95)', background: 'rgba(255,204,102,.06)' },
    danger: { borderColor: 'rgba(255,77,77,.22)', color: 'rgba(255,77,77,.95)', background: 'rgba(255,77,77,.06)' },
  };

  return (
    <span
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '11.5px',
        padding: '6px 8px',
        borderRadius: '999px',
        border: '1px solid',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}

// Hero Section - Case Intake
function HeroSection() {
  return (
    <section className="na-relative" style={{ zIndex: 1 }}>
      <div className="na-container na-p-6 na-pt-8">
        {/* Hero Card */}
        <div
          className="na-card na-p-0 na-overflow-hidden na-relative"
          style={{
            borderRadius: '26px',
            border: '1px solid rgba(255,255,255,.08)',
            background: `
              radial-gradient(900px 420px at 30% 0%, rgba(215,255,63,.10), transparent 60%),
              radial-gradient(820px 520px at 80% 80%, rgba(121,177,255,.08), transparent 62%),
              linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))
            `,
            boxShadow: '0 18px 70px rgba(0,0,0,.58)',
          }}
        >
          {/* Restricted Badge */}
          <div
            className="na-absolute"
            style={{
              top: '16px',
              left: '16px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '11px',
              letterSpacing: '.26em',
              color: 'rgba(255,255,255,.22)',
              border: '1px solid rgba(255,255,255,.08)',
              padding: '6px 10px',
              borderRadius: '999px',
              background: 'rgba(0,0,0,.16)',
            }}
          >
            RESTRICTED
          </div>

          <div className="na-grid na-gap-6 na-p-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
            {/* Left: Title + Description */}
            <div className="na-pt-8">
              <h1
                className="na-h1"
                style={{
                  fontSize: '44px',
                  lineHeight: 1.02,
                  letterSpacing: '-0.03em',
                  fontWeight: 780,
                  margin: 0,
                }}
              >
                Forensic Accounting<br />
                <span style={{ color: '#d7ff3f' }}>Audit Mode</span>
              </h1>

              <p className="na-body na-mt-4" style={{ color: 'rgba(255,255,255,.62)', maxWidth: '64ch', lineHeight: 1.6 }}>
                Evidence-first forensic accounting. Chain-of-custody, lineage, and defensible verdicts.
                Every figure carries provenance. Every action leaves an audit trail.
              </p>

              {/* Case Intake Form */}
              <div
                className="na-mt-5"
                style={{
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,.10)',
                  background: 'rgba(0,0,0,.16)',
                  padding: '14px',
                }}
              >
                <div className="na-flex na-justify-between na-items-center na-flex-wrap na-gap-3 na-mb-4">
                  <div className="na-flex na-items-center na-gap-3" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12.5px', color: 'rgba(255,255,255,.78)' }}>
                    <span>Case ID:</span>
                    <code
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '12.5px',
                        color: 'rgba(255,255,255,.86)',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'rgba(255,255,255,.04)',
                      }}
                    >
                      AUD-2025-00142
                    </code>
                  </div>
                  <div className="na-flex na-gap-2 na-flex-wrap">
                    <Tag variant="ok">ACTIVE</Tag>
                    <Tag>FORENSIC</Tag>
                  </div>
                </div>

                <div className="na-grid na-gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  <div className="na-flex na-flex-col na-gap-2">
                    <label style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11.5px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.60)' }}>
                      ENTITY
                    </label>
                    <select
                      className="na-input"
                      style={{
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'rgba(255,255,255,.03)',
                        color: 'rgba(255,255,255,.86)',
                        padding: '10px 12px',
                      }}
                    >
                      <option>Vendor #4492 — Acme Corp</option>
                      <option>Vendor #3381 — GlobalTech</option>
                      <option>Vendor #5567 — FastShip Inc</option>
                    </select>
                  </div>
                  <div className="na-flex na-flex-col na-gap-2">
                    <label style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11.5px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.60)' }}>
                      PERIOD
                    </label>
                    <select
                      className="na-input"
                      style={{
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,.12)',
                        background: 'rgba(255,255,255,.03)',
                        color: 'rgba(255,255,255,.86)',
                        padding: '10px 12px',
                      }}
                    >
                      <option>Q4 2025</option>
                      <option>Q3 2025</option>
                      <option>Q2 2025</option>
                    </select>
                  </div>
                </div>

                <div className="na-flex na-justify-between na-items-center na-mt-4 na-flex-wrap na-gap-3">
                  <span style={{ color: 'rgba(255,255,255,.46)', fontFamily: 'ui-monospace, monospace', fontSize: '11.5px' }}>
                    Chain-of-custody: 12 events logged
                  </span>
                  <Link
                    href="/vendor"
                    className="na-btn na-btn-primary na-flex na-items-center na-gap-3"
                    style={{
                      borderColor: 'rgba(215,255,63,.28)',
                      background: 'linear-gradient(180deg, rgba(215,255,63,.18), rgba(255,255,255,.03))',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Begin Audit
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Console */}
            <div
              style={{
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,.10)',
                background: `
                  radial-gradient(500px 260px at 30% 15%, rgba(255,255,255,.05), transparent 62%),
                  linear-gradient(180deg, rgba(0,0,0,.22), rgba(255,255,255,.02))
                `,
                padding: '14px',
              }}
            >
              <div className="na-flex na-justify-between na-items-center na-mb-4">
                <div className="na-flex na-items-center na-gap-3" style={{ color: 'rgba(255,255,255,.78)', fontSize: '13px' }}>
                  <span>Audit Console</span>
                  <code
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,.62)',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,.10)',
                      background: 'rgba(255,255,255,.03)',
                    }}
                  >
                    v2.1
                  </code>
                </div>
                <Tag variant="ok">LIVE</Tag>
              </div>

              <div className="na-grid na-gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Metric Cards */}
                {[
                  { label: 'EVIDENCE', value: '142', unit: 'artifacts', status: 'ok' },
                  { label: 'LINEAGE', value: '98.7%', unit: 'traced', status: 'ok' },
                  { label: 'EXCEPTIONS', value: '3', unit: 'pending', status: 'warn' },
                  { label: 'VERDICTS', value: '47', unit: 'sealed', status: 'ok' },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,.10)',
                      background: 'rgba(255,255,255,.03)',
                      padding: '12px',
                      minHeight: '90px',
                    }}
                  >
                    <h3
                      style={{
                        margin: '0 0 8px',
                        fontSize: '11.5px',
                        fontWeight: 740,
                        letterSpacing: '.18em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,.70)',
                      }}
                    >
                      {m.label}
                    </h3>
                    <div className="na-flex na-items-baseline na-gap-2">
                      <b style={{ fontSize: '22px', letterSpacing: '-0.02em' }}>{m.value}</b>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11.5px', color: 'rgba(255,255,255,.50)' }}>
                        {m.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div
                className="na-mt-4"
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,.10)',
                  background: 'rgba(0,0,0,.22)',
                  padding: '10px',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 8px',
                    fontSize: '11.5px',
                    fontWeight: 740,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.70)',
                  }}
                >
                  AUDIT TRAIL
                </h3>
                {[
                  { time: '2025-12-30 09:42', desc: 'Evidence artifact E-142 sealed', tag: 'SEALED', variant: 'ok' as const },
                  { time: '2025-12-30 09:38', desc: 'Exception EX-003 escalated', tag: 'ESCALATED', variant: 'warn' as const },
                  { time: '2025-12-30 09:15', desc: 'Lineage verified for PO-4492', tag: 'VERIFIED', variant: 'ok' as const },
                ].map((row) => (
                  <div
                    key={row.time}
                    className="na-grid na-items-center na-py-2"
                    style={{
                      gridTemplateColumns: '120px 1fr 90px',
                      gap: '10px',
                      borderTop: '1px dashed rgba(255,255,255,.08)',
                    }}
                  >
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: 'rgba(255,255,255,.54)' }}>
                      {row.time}
                    </span>
                    <span style={{ fontSize: '12.6px', color: 'rgba(255,255,255,.76)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.desc}
                    </span>
                    <span style={{ justifySelf: 'end' }}>
                      <Tag variant={row.variant}>{row.tag}</Tag>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Evidence Section
function EvidenceSection() {
  return (
    <section className="na-relative na-mt-6" style={{ zIndex: 1 }}>
      <div className="na-container na-px-6">
        <div className="na-grid na-gap-4" style={{ gridTemplateColumns: '0.55fr 1.45fr' }}>
          {/* Sticky Sidebar */}
          <div
            className="na-card na-p-4"
            style={{
              position: 'sticky',
              top: '80px',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.03)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '12px',
                letterSpacing: '.22em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.72)',
              }}
            >
              EVIDENCE CHAIN
            </h2>
            <p style={{ margin: '10px 0 0', fontSize: '13.2px', lineHeight: 1.6, color: 'rgba(255,255,255,.60)' }}>
              Every artifact is hashed, timestamped, and linked to its source. Chain-of-custody is immutable.
            </p>
          </div>

          {/* Evidence Grid */}
          <div
            className="na-card na-p-4"
            style={{
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.02)',
            }}
          >
            <div className="na-grid na-gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {[
                { id: 'E-142', title: 'Invoice Match', desc: 'PO #4492 matched to Invoice #INV-8821. 3-way match complete.', rules: ['POLICY-001', 'MATCH-3WAY'] },
                { id: 'E-141', title: 'Approval Chain', desc: 'Payment approval captured. Delegate authority verified.', rules: ['AUTH-002', 'DELEGATE'] },
                { id: 'E-140', title: 'Rate Variance', desc: 'Unit price variance of 2.3% within tolerance threshold.', rules: ['TOLERANCE-5%', 'AUTO-APPROVE'] },
                { id: 'E-139', title: 'GR/IR Reconciliation', desc: 'Goods receipt matched to invoice receipt. No variance.', rules: ['GR-MATCH', 'IR-MATCH'] },
              ].map((a) => (
                <div
                  key={a.id}
                  className="na-relative"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,.10)',
                    background: 'rgba(255,255,255,.03)',
                    padding: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Glow */}
                  <div
                    className="na-absolute na-inset-0 na-pointer-events-none"
                    style={{
                      background: 'radial-gradient(240px 120px at 30% 10%, rgba(215,255,63,.09), transparent 62%)',
                      opacity: 0.45,
                    }}
                  />

                  <div className="na-flex na-justify-between na-items-center na-gap-3 na-relative" style={{ zIndex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 740, color: 'rgba(255,255,255,.86)' }}>
                      {a.title}
                    </h3>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '11px',
                        color: 'rgba(255,255,255,.52)',
                        border: '1px solid rgba(255,255,255,.10)',
                        background: 'rgba(0,0,0,.16)',
                        padding: '5px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {a.id}
                    </span>
                  </div>
                  <p className="na-relative" style={{ margin: '10px 0 0', color: 'rgba(255,255,255,.62)', fontSize: '13px', lineHeight: 1.55, zIndex: 1 }}>
                    {a.desc}
                  </p>
                  <div className="na-flex na-gap-2 na-flex-wrap na-mt-3 na-relative" style={{ zIndex: 1 }}>
                    {a.rules.map((r) => (
                      <code
                        key={r}
                        style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: '11.5px',
                          color: 'rgba(255,255,255,.74)',
                          border: '1px solid rgba(255,255,255,.10)',
                          background: 'rgba(255,255,255,.03)',
                          padding: '6px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {r}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Verdict Strip (Fixed Footer)
function VerdictStrip() {
  return (
    <div
      className="na-fixed na-left-0 na-right-0 na-bottom-0"
      style={{
        zIndex: 60,
        borderTop: '1px solid rgba(255,255,255,.08)',
        background: 'linear-gradient(180deg, rgba(5,7,10,.35), rgba(5,7,10,.88))',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="na-container na-flex na-items-center na-justify-between na-gap-4 na-py-3 na-px-6">
        <div className="na-flex na-items-center na-gap-4">
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#39d98a',
              boxShadow: '0 0 12px rgba(57,217,138,.4)',
            }}
          />
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'rgba(255,255,255,.72)' }}>
            AUDIT STATUS: <b style={{ color: '#39d98a' }}>CLEAN</b>
          </span>
          <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'rgba(255,255,255,.52)' }}>
            142 artifacts · 47 verdicts · 3 pending
          </span>
        </div>
        <div className="na-flex na-items-center na-gap-3">
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: 'rgba(255,255,255,.45)' }}>
            Last sync: 2 min ago
          </span>
          <button
            className="na-btn"
            style={{
              padding: '8px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(215,255,63,.28)',
              background: 'linear-gradient(180deg, rgba(215,255,63,.18), rgba(255,255,255,.03))',
              color: 'rgba(255,255,255,.92)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Seal Verdict
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="na-min-h-screen na-relative" style={{ paddingBottom: '60px' }}>
      <ForensicBackdrop />
      <HeroSection />
      <EvidenceSection />
      <VerdictStrip />
    </div>
  );
}
