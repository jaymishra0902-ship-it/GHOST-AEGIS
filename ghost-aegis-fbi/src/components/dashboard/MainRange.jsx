import { useEffect, useState } from 'react'
import { CASE_FILES } from '../../data/caseFiles.js'
import TelemetryStream from './TelemetryStream.jsx'
import './MainRange.css'

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function DataField({ label, value, emphasis = false }) {
  return (
    <div className={`data-field${emphasis ? ' data-field--emphasis' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function MainRange() {
  const [secondsLeft, setSecondsLeft] = useState(120)
  const [dropOpen, setDropOpen] = useState(false)
  const [revealState, setRevealState] = useState('locked')
  const [revealSeconds, setRevealSeconds] = useState(5)
  const activeCase = CASE_FILES[0]

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(countdown)
          setDropOpen(true)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(countdown)
  }, [])

  useEffect(() => {
    if (revealState !== 'unmasking') return undefined

    const revealTimer = window.setInterval(() => {
      setRevealSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(revealTimer)
          setRevealState('revealed')
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(revealTimer)
  }, [revealState])

  function beginInvestigation() {
    setRevealSeconds(5)
    setRevealState('unmasking')
  }

  return (
    <main className="range-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#overview" aria-label="Aegis operations home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-name">AEGIS<span> / FIELD INTELLIGENCE</span></span>
        </a>
        <nav className="top-nav" aria-label="Primary navigation">
          <a className="top-nav__active" href="#overview">OVERVIEW</a>
          <a href="#signals">SIGNALS</a>
          <a href="#case-files">CASE FILES</a>
        </nav>
        <div className="nav-status">
          <span className="status-pip" />
          <span className="nav-status__text">SECURE CHANNEL</span>
          <span className="nav-divider" />
          <span className="drop-clock-label">NEXT PRIORITY DROP</span>
          <strong className={secondsLeft === 0 ? 'drop-clock drop-clock--active' : 'drop-clock'}>
            {formatTime(secondsLeft)}
          </strong>
        </div>
      </header>

      <div className="range-body" id="overview">
        <aside className="side-rail" aria-label="Operations sections">
          <span className="rail-index">01</span>
          <a className="rail-item rail-item--active" href="#overview" aria-label="Overview">
            <span className="rail-glyph rail-glyph--grid" />
          </a>
          <a className="rail-item" href="#signals" aria-label="Signals">
            <span className="rail-glyph rail-glyph--wave" />
          </a>
          <a className="rail-item" href="#case-files" aria-label="Case files">
            <span className="rail-glyph rail-glyph--target" />
          </a>
          <span className="rail-bottom">FBI<br />OPS</span>
        </aside>

        <section className="dashboard-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-mark" /> LIVE OPERATIONS / EASTERN GRID</p>
              <h1>Threat Overview</h1>
              <p className="page-subtitle">National infrastructure protection · Operations room 07</p>
            </div>
            <div className="heading-meta">
              <span>SHIFT WINDOW</span>
              <strong>14:00 — 22:00 EST</strong>
              <small>ENCRYPTED SESSION / TIER 4</small>
            </div>
          </div>

          <section className="alert-strip" aria-label="Priority alert">
            <span className="alert-icon" aria-hidden="true">!</span>
            <div className="alert-copy">
              <strong>HIGH-PRIORITY CASE DROP ARMED</strong>
              <span>Automated case package releases when the countdown expires.</span>
            </div>
            <span className="alert-code">QUEUE / 01</span>
          </section>

          <section className="metrics-row" aria-label="Threat metrics">
            <article className="metric-panel metric-panel--threat">
              <span className="metric-label">ACTIVE THREATS</span>
              <strong>04</strong>
              <span className="metric-foot"><i /> 02 REQUIRE IMMEDIATE REVIEW</span>
            </article>
            <article className="metric-panel">
              <span className="metric-label">PROTECTED SYSTEMS</span>
              <strong>128<span className="metric-unit"> / 132</span></strong>
              <span className="metric-foot">COVERAGE AT 96.9%</span>
            </article>
            <article className="metric-panel">
              <span className="metric-label">SIGNALS ANALYZED</span>
              <strong>2,841</strong>
              <span className="metric-foot">LAST 24 HOURS</span>
            </article>
          </section>

          <section className="intel-grid" id="signals">
            <article className="panel map-panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">ATTACK PATH / DEFENSE MESH</p>
                  <h2>Live Network Topology</h2>
                </div>
                <span className="live-tag"><i /> LIVE SIMULATION</span>
              </div>
              <div className="topology-stage" role="img" aria-label="Red Team payloads from adversary 198.51.100.41 travel toward an eBPF-hardened WAF Cluster Gateway and Core Database Shard, where white eBPF defense barriers intercept them">
                <div className="topology-grid" />
                <svg className="topology-vectors" viewBox="0 0 760 250" preserveAspectRatio="none" aria-hidden="true">
                  <path className="topology-link" d="M96 125 H620" />
                  <path className="payload-trace" d="M96 125 H555" />
                  <path className="payload-path" d="M96 125 H555" />
                  <circle className="payload-packet" r="3.5">
                    <animateMotion dur="3.4s" repeatCount="indefinite" path="M 96 125 H 555" />
                  </circle>
                  <circle className="payload-packet payload-packet--delayed" r="3.5">
                    <animateMotion begin="-1.1s" dur="3.4s" repeatCount="indefinite" path="M 96 125 H 555" />
                  </circle>
                  <circle className="payload-packet payload-packet--delayed-more" r="3.5">
                    <animateMotion begin="-2.2s" dur="3.4s" repeatCount="indefinite" path="M 96 125 H 555" />
                  </circle>
                  <path className="defense-barrier" d="M555 79 V171 M548 88 L555 79 L562 88 M548 162 L555 171 L562 162" />
                  <path className="impact-burst" d="M555 115 L548 125 L555 135 L562 125 Z" />
                </svg>
                <div className="topology-node topology-node--adversary"><i /><span>RED TEAM / SOURCE</span><strong>Adversary Red Node</strong><small>198.51.100.41</small></div>
                <div className="topology-node topology-node--gateway"><i /><span>BLUE TEAM / GATEWAY</span><strong>WAF Cluster Gateway</strong><small>eBPF HARDENED</small></div>
                <div className="topology-node topology-node--database"><i /><span>PROTECTED DATA</span><strong>Core Database Shard</strong><small>AIRGAP ISOLATED</small></div>
                <div className="defense-label"><i /> eBPF DEFENSE BARRIER</div>
                <div className="topology-legend"><span><i className="legend-payload" /> RED TEAM PAYLOAD</span><span><i className="legend-defense" /> BLUE TEAM DEFENSE</span></div>
              </div>
              <div className="packet-metrics" aria-label="Live packet metrics">
                <div><span>EDGE LATENCY</span><strong>0.38<small>ms</small></strong></div>
                <div><span>PACKET DROP RATE</span><strong>0.0004<small>%</small></strong></div>
                <div><span>AIRGAP CONTAINMENT</span><strong>12/12<small> NODES ISOLATED</small></strong></div>
              </div>
            </article>

            <TelemetryStream />
          </section>

          {revealState === 'revealed' && (
            <section className="revealed-grid" aria-live="polite">
              <article className="panel reveal-card">
                <div className="panel-heading">
                  <div><p className="panel-kicker">IDENTITY RESOLUTION / COMPLETE</p><h2>Suspect Identity</h2></div>
                  <span className="resolved-stamp">UNMASKED</span>
                </div>
                <div className="reveal-fields">
                  <DataField label="KNOWN ALIAS" value={activeCase.alias} emphasis />
                  <DataField label="TOR EXIT NODE" value={activeCase.torExitNode} />
                  <DataField label="CRYPTO WALLET" value={activeCase.cryptoWallet} />
                </div>
              </article>
              <article className="panel reveal-card">
                <div className="panel-heading">
                  <div><p className="panel-kicker">PHYSICAL TRIANGULATION / VERIFIED</p><h2>Victim Location</h2></div>
                  <span className="resolved-stamp">LOCKED</span>
                </div>
                <div className="location-coordinate">
                  <DataField label="LATITUDE" value={activeCase.latitude} emphasis />
                  <DataField label="LONGITUDE" value={activeCase.longitude} emphasis />
                </div>
                <DataField label="EXACT SUBSTATION" value={activeCase.substation} />
              </article>
            </section>
          )}

          <footer className="dashboard-footer">
            <span>AEGIS CASE MANAGEMENT SYSTEM <b>·</b> AUTHORIZED PERSONNEL ONLY</span>
            <span>SESSION ID / AX-07-441</span>
          </footer>
        </section>
      </div>

      {dropOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="drop-modal" role="dialog" aria-modal="true" aria-labelledby="drop-title">
            <div className="modal-topline"><span><i /> CLASSIFIED CASE DROP</span><button type="button" className="modal-close" onClick={() => setDropOpen(false)} aria-label="Close case drop">×</button></div>
            <div className="modal-body">
              <div className="case-seal" aria-hidden="true"><span>AE</span><i /></div>
              <p className="modal-eyebrow">AUTOMATED PRIORITY RELEASE / {activeCase.caseId}</p>
              <h2 id="drop-title">Threat package<br />intercepted.</h2>
              <p className="modal-description">A high-priority case file has been routed to your secure session. Review the target profile and authorize investigation to resolve protected intelligence.</p>
              <div className="case-summary">
                <DataField label="CASE ID" value={activeCase.caseId} />
                <DataField label="SEVERITY" value={activeCase.severity} emphasis />
                <DataField label="TARGET SYSTEM" value={activeCase.targetSystem} />
                <DataField label="THREAT VECTOR" value={activeCase.threatVector} />
              </div>
              {revealState === 'unmasking' ? (
                <div className="decrypting-state" role="status">
                  <span className="decrypt-ring" />
                  <div><strong>RESOLVING PROTECTED INTELLIGENCE</strong><span>IDENTITY KEY RELEASE IN 00:0{revealSeconds}</span></div>
                  <b>00:0{revealSeconds}</b>
                </div>
              ) : revealState === 'revealed' ? (
                <div className="success-state" role="status"><span>✓</span><div><strong>INVESTIGATION AUTHORIZED</strong><small>IDENTITY AND LOCATION DETAILS ARE NOW AVAILABLE IN THE OPERATIONS VIEW.</small></div></div>
              ) : (
                <button className="engage-button" type="button" onClick={beginInvestigation}>
                  <span>[ ENGAGE INVESTIGATION &amp; UNMASK TARGET ]</span><b>→</b>
                </button>
              )}
              <div className="modal-foot"><span>CHAIN OF CUSTODY: VERIFIED</span><span>ENCRYPTION: AES-256</span></div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default MainRange