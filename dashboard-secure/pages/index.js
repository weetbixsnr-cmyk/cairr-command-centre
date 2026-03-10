import Head from 'next/head'

export default function Dashboard() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Adam's Command Centre</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; padding: 16px; }
          
          h1 { font-size: 18px; color: #fff; display: inline; }
          .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .meta { font-size: 9px; color: #444; }
          
          .grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: auto; gap: 10px; }
          
          /* MOBILE RESPONSIVE */
          @media (max-width: 768px) {
            body { padding: 12px; font-size: 16px; }
            .grid { grid-template-columns: 1fr; gap: 16px; }
            .health-card { grid-column: 1; flex-direction: column; padding: 20px; }
            .health-pct { font-size: 36px !important; }
            .health-lbl { font-size: 14px !important; }
            .pill { font-size: 12px !important; padding: 6px 12px !important; }
            .health-card > div:last-child { border-left: none; border-top: 1px solid #222; padding-left: 0; padding-top: 16px; margin-left: 0; margin-top: 16px; }
            .reports-card { grid-column: 1; max-height: 300px; padding: 20px; }
            .dates-card { grid-column: 1; padding: 20px; }
            .dates-inner { flex-direction: column; gap: 20px; }
            .dates-right { border-left: none; border-top: 1px solid #1a1a1a; padding-left: 0; padding-top: 20px; }
            .personal { grid-column: 1; padding: 20px; }
            .p-grid { grid-template-columns: 1fr; gap: 16px; }
            h1 { font-size: 20px !important; }
            .meta { font-size: 12px !important; }
            .card { padding: 20px !important; }
            .card-name { font-size: 16px !important; }
            .sec-t { font-size: 12px !important; }
            .r { font-size: 14px !important; }
            .d-text { font-size: 14px !important; }
            .d-label { font-size: 12px !important; }
            .c-name { font-size: 14px !important; }
            .c-time { font-size: 12px !important; }
          }
          
          @media (max-width: 480px) {
            body { padding: 16px; font-size: 18px; }
            .grid { gap: 20px; }
            .card { padding: 24px 20px !important; min-height: auto; }
            .health-card { padding: 24px 20px !important; }
            .reports-card { padding: 24px 20px !important; max-height: 400px; }
            .dates-card { padding: 24px 20px !important; }
            .personal { padding: 24px 20px !important; }
            h1 { font-size: 24px !important; }
            .health-pct { font-size: 48px !important; }
            .health-lbl { font-size: 16px !important; }
            .pills { flex-wrap: wrap; gap: 8px; }
            .pill { font-size: 14px !important; padding: 8px 16px !important; }
            .card-name { font-size: 18px !important; }
            .tag { font-size: 10px !important; padding: 4px 8px !important; }
            .r { font-size: 16px !important; }
            .sec-t { font-size: 14px !important; }
            .cron-row { font-size: 14px !important; }
            .rpt-row { font-size: 14px !important; }
            .d-text { font-size: 16px !important; }
            .d-label { font-size: 14px !important; }
            .c-name { font-size: 16px !important; }
            .c-time { font-size: 14px !important; }
            .cron-name { font-size: 16px !important; }
          }
          
          .health-card { grid-column: 1 / 3; background: #111; border: 1px solid #222; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; }
          .health-pct { font-size: 28px; font-weight: 700; color: #f59e0b; }
          .health-lbl { font-size: 10px; color: #555; margin-bottom: 4px; }
          .pills { display: flex; gap: 5px; }
          .pill { font-size: 9px; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
          .pill.r { background: #3b1010; color: #ef4444; }
          .pill.y { background: #2a2000; color: #f59e0b; }
          .pill.g { background: #0a2a1a; color: #10b981; }
          
          .reports-card { grid-column: 3 / 5; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; overflow-y: auto; align-self: start; max-height: 200px; }
          .rpt-row { display: flex; align-items: center; gap: 6px; padding: 3px 0; border-bottom: 1px solid #1a1a1a; }
          .rpt-row:last-child { border-bottom: none; }
          .rpt-open { width: 14px; height: 14px; border-radius: 3px; background: #1a1a1a; border: 1px solid #333; color: #666; font-size: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-decoration: none; }
          .rpt-open:hover { background: #2a2a2a; color: #f59e0b; border-color: #f59e0b; }

          .dates-card { grid-column: 5 / 8; background: #111; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; align-self: start; }
          .dates-title { font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .dates-inner { display: flex; gap: 20px; }
          .dates-left { flex: 1; }
          .dates-right { flex: 1; border-left: 1px solid #1a1a1a; padding-left: 16px; }
          .d-row { display: flex; gap: 10px; padding: 4px 0; border-bottom: 1px solid #1a1a1a; }
          .d-row:last-child { border-bottom: none; }
          .d-label { color: #f59e0b; font-weight: 600; font-size: 10px; min-width: 70px; }
          .d-text { color: #888; font-size: 11px; }
          .c-row { display: flex; gap: 6px; padding: 3px 0; align-items: center; }
          .c-time { color: #3b82f6; font-weight: 600; font-size: 9px; min-width: 38px; }
          .c-name { color: #3b82f6; font-size: 10px; }
          .c-dot { width: 4px; height: 4px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; }
          
          .card { background: #111; border: 1px solid #222; border-radius: 10px; padding: 16px 14px 20px; display: flex; flex-direction: column; min-height: 420px; }
          .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
          .card-name { font-size: 12px; font-weight: 600; color: #fff; }
          .tag { font-size: 7px; padding: 2px 5px; border-radius: 5px; font-weight: 600; }
          .tag.live { background: #0a2a1a; color: #10b981; border: 1px solid #10b981; }
          .tag.build { background: #0e1a2e; color: #3b82f6; border: 1px solid #3b82f6; }
          .tag.new { background: #1a0a2e; color: #a855f7; border: 1px solid #a855f7; }
          .tag.paying { background: #1a2a0a; color: #84cc16; border: 1px solid #84cc16; }
          .tag.parked { background: #1a1a1a; color: #555; border: 1px solid #333; }
          .tag.pipeline { background: #2a1a0a; color: #f59e0b; border: 1px solid #f59e0b; }
          .card-sub { font-size: 8px; color: #444; margin-bottom: 6px; }
          
          .sec-t { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; margin-top: 12px; font-weight: 600; border-bottom: 1px solid #1a1a1a; padding-bottom: 3px; }
          .sec-t:first-of-type { margin-top: 0; }
          .r { font-size: 10px; color: #aaa; padding: 2.5px 0; display: flex; align-items: baseline; gap: 4px; line-height: 1.5; }
          .d { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
          .d.g { background: #10b981; }
          .d.y { background: #f59e0b; }
          .d.re { background: #ef4444; }
          .d.b { background: #3b82f6; }
          .d.x { background: #333; }
          
          .cron-row { font-size: 9px; color: #3b82f6; padding: 2px 0; display: flex; align-items: center; gap: 4px; }
          .cron-row .cron-time { font-weight: 600; min-width: 50px; }
          .cron-row .cron-name { color: #5b9cf6; }
          
          .bar { height: 2px; background: #1a1a1a; border-radius: 1px; margin-top: auto; padding-top: 6px; }
          .bar-inner { height: 2px; border-radius: 1px; }
          .bar-inner.g { background: #10b981; }
          .bar-inner.b { background: #3b82f6; }
          .bar-inner.y { background: #f59e0b; }
          
          .personal { grid-column: 1 / -1; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 12px 14px; }
          .personal h2 { font-size: 12px; color: #555; margin-bottom: 8px; }
          .p-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
          .personal .r { color: #555; font-size: 9px; }
          .personal .sec-t { color: #333; }
          
          .footer { font-size: 8px; color: #222; text-align: right; margin-top: 12px; }
        `}</style>
      </Head>

      <div>
        <div className="top">
          <h1>🎯 Adam's Command Centre</h1>
          <span className="meta">27 Feb 2026 · Ricky-Jnr 🤙</span>
        </div>

        <div className="grid">
          {/* Health Card */}
          <div className="health-card">
            <div>
              <span className="health-pct">85%</span>
              <div className="health-lbl">System Health</div>
              <div className="pills">
                <span className="pill r">4 Critical</span>
                <span className="pill y">6 Medium</span>
                <span className="pill g">14 Pass</span>
              </div>
            </div>
            <div style={{borderLeft:'1px solid #222', paddingLeft:'12px', marginLeft:'auto'}}>
              <div style={{fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>Cron Jobs</div>
              <div style={{fontSize:'10px', color:'#10b981'}}>● 28 Active</div>
              <div style={{fontSize:'9px', color:'#666', marginTop:'2px'}}>Last heartbeat: OK</div>
              <div style={{fontSize:'9px', color:'#666'}}>WhatsApp: Connected</div>
            </div>
          </div>

          {/* Reports Card */}
          <div className="reports-card">
            <div style={{fontSize:'9px', color:'#444', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px'}}>Recent Reports</div>
            <div className="rpt-row">
              <span className="rpt-open">↗</span>
              <span style={{fontSize:'10px',flex:'1'}}>27 Feb — Australia Property Scan (Phase 1 NSW) 🔄</span>
            </div>
            <div className="rpt-row">
              <span className="rpt-open">↗</span>
              <span style={{fontSize:'10px',flex:'1'}}>27 Feb — CAIRR SEO Analysis Report ✅</span>
            </div>
            <div className="rpt-row">
              <span className="rpt-open">↗</span>
              <span style={{fontSize:'10px',flex:'1'}}>27 Feb — CAIRR Competitor Analysis ✅</span>
            </div>
            <div className="rpt-row">
              <span className="rpt-open">↗</span>
              <span style={{fontSize:'10px',flex:'1'}}>27 Feb — SSOB Morning Report (All 8 states complete) ✅</span>
            </div>
            <div className="rpt-row">
              <span className="rpt-open">↗</span>
              <span style={{fontSize:'10px',flex:'1'}}>27 Feb — Alpha Governance Audit ⚠️ (Research deliverables stale)</span>
            </div>
          </div>

          {/* Dates Card */}
          <div className="dates-card">
            <div className="dates-inner">
              <div className="dates-left">
                <div className="dates-title">Key Dates & Overdue</div>
                <div className="d-row"><span className="d-label">OVERDUE</span><span className="d-text">Parriwi Rd quote</span></div>
                <div className="d-row"><span className="d-label">27 FEB</span><span className="d-text">CAIRR SEO launch night</span></div>
                <div className="d-row"><span className="d-label">3 MAR</span><span className="d-text">First BTS weekly report due</span></div>
                <div className="d-row"><span className="d-label">16 MAR</span><span className="d-text">Battery install</span></div>
                <div className="d-row"><span className="d-label">APR W1</span><span className="d-text">BTS courses start</span></div>
              </div>
              <div className="dates-right">
                <div className="dates-title">Global Crons (Active)</div>
                <div className="c-row"><span className="c-dot"></span><span className="c-time">7AM</span><span className="c-name">CAIRR SEO Daily Monitor</span></div>
                <div className="c-row"><span className="c-dot"></span><span className="c-time">Mon 6AM</span><span className="c-name">CAIRR SEO Week 1</span></div>
                <div className="c-row"><span className="c-dot"></span><span className="c-time">5AM</span><span className="c-name">SSOB Morning Report</span></div>
                <div className="c-row"><span className="c-dot"></span><span className="c-time">6AM</span><span className="c-name">Property Scan Monitor</span></div>
                <div className="c-row"><span className="c-dot"></span><span className="c-time">12AM</span><span className="c-name">Governance Audits</span></div>
              </div>
            </div>
          </div>

          {/* Property Scan Card */}
          <div className="card">
            <div className="card-head"><span className="card-name">🏠 Property Scan</span><span className="tag build">Active</span></div>
            <div className="card-sub">Australia-wide · Commercial/Industrial · Max $800k · 8%+ yield</div>
            <div className="sec-t">Current Status</div>
            <div className="r"><span className="d b"></span>Phase 1: NSW regional agents (running)</div>
            <div className="r"><span className="d y"></span>Target: Commercial/industrial under $800k</div>
            <div className="r"><span className="d y"></span>Yield requirement: 8%+ net</div>
            <div className="r"><span className="d g"></span>Methodology: One website at a time</div>
            <div className="r"><span className="d g"></span>Rate limiting: 3-5 second delays</div>
            <div className="sec-t">Deliverables</div>
            <div className="r"><span className="d b"></span>CSV file: property-scan-results.csv</div>
            <div className="r"><span className="d b"></span>Progress updates every 2 hours</div>
            <div className="r"><span className="d b"></span>Cross-check on Domain, REA</div>
            <div className="sec-t">Next Phases</div>
            <div className="r"><span className="d x"></span>QLD regional agents</div>
            <div className="r"><span className="d x"></span>VIC, WA, SA, TAS, NT, ACT</div>
            <div className="bar"><div className="bar-inner b" style={{width:'15%'}}></div></div>
          </div>

          {/* Add simplified versions of other cards... */}
          <div className="personal">
            <h2>🚀 Quick Status</h2>
            <div className="p-grid">
              <div>
                <div className="sec-t">CAIRR</div>
                <div className="r"><span className="d g"></span>Website ready ✅</div>
                <div className="r"><span className="d g"></span>SEO automation live ✅</div>
                <div className="r"><span className="d y"></span>5 setup tasks pending</div>
              </div>
              <div>
                <div className="sec-t">Active Scans</div>
                <div className="r"><span className="d b"></span>Property scan Phase 1</div>
                <div className="r"><span className="d g"></span>SSOB scan complete</div>
                <div className="r"><span className="d g"></span>Auto-monitoring active</div>
              </div>
              <div>
                <div className="sec-t">Clients</div>
                <div className="r"><span className="d g"></span>BTS: £300/mo ✅</div>
                <div className="r"><span className="d b"></span>TWPG: Pipeline</div>
                <div className="r"><span className="d x"></span>Stone Plus: Early</div>
              </div>
              <div>
                <div className="sec-t">Priority</div>
                <div className="r"><span className="d re"></span>Parriwi quote OVERDUE</div>
                <div className="r"><span className="d g"></span>All systems healthy</div>
                <div className="r"><span className="d b"></span>Property scan running</div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">Ricky-Jnr 🤙 · Secure Mobile Access · Australia Property Scan Active</div>
      </div>
    </>
  )
}