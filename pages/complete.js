import Head from 'next/head'

export default function CompleteDashboard() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Adam's Command Centre</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: #0a0a0a; 
            color: #e0e0e0; 
            padding: 16px; 
            font-size: 16px;
            line-height: 1.5;
          }
          
          .top { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
          }
          .top h1 { font-size: 24px; color: #fff; }
          .meta { font-size: 12px; color: #444; }
          
          .section {
            background: #111;
            border: 1px solid #222;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .health-section {
            background: linear-gradient(135deg, #111, #1a1a1a);
            border: 1px solid #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 30px;
          }
          .health-pct { 
            font-size: 56px; 
            font-weight: 700; 
            color: #f59e0b; 
            margin-bottom: 10px;
          }
          .health-lbl { 
            font-size: 16px; 
            color: #555; 
            margin-bottom: 15px; 
          }
          .pills { 
            display: flex; 
            gap: 8px; 
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 20px;
          }
          .pill { 
            font-size: 12px; 
            padding: 6px 12px; 
            border-radius: 8px; 
            font-weight: 600; 
          }
          .pill.r { background: #3b1010; color: #ef4444; }
          .pill.y { background: #2a2000; color: #f59e0b; }
          .pill.g { background: #0a2a1a; color: #10b981; }
          
          .cron-info {
            border-top: 1px solid #222;
            padding-top: 15px;
            text-align: center;
          }
          .cron-info div {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          .cron-active {
            font-size: 14px;
            color: #10b981;
            font-weight: 600;
          }
          
          .reports-section {
            max-height: 400px;
            overflow-y: auto;
          }
          .section-title {
            font-size: 14px;
            color: #444;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .rpt-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #1a1a1a;
            font-size: 14px;
          }
          .rpt-row:last-child { border-bottom: none; }
          .rpt-open {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            background: #1a1a1a;
            border: 1px solid #333;
            color: #666;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .dates-section .dates-inner {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .dates-left, .dates-right {
            flex: 1;
          }
          .dates-right {
            border-left: none;
            border-top: 1px solid #1a1a1a;
            padding-left: 0;
            padding-top: 15px;
          }
          .d-row {
            display: flex;
            gap: 12px;
            padding: 6px 0;
            border-bottom: 1px solid #1a1a1a;
            font-size: 14px;
          }
          .d-row:last-child { border-bottom: none; }
          .d-label {
            color: #f59e0b;
            font-weight: 600;
            min-width: 80px;
            flex-shrink: 0;
          }
          .d-text { color: #888; }
          
          .c-row {
            display: flex;
            gap: 8px;
            padding: 4px 0;
            align-items: center;
            font-size: 14px;
          }
          .c-time {
            color: #3b82f6;
            font-weight: 600;
            min-width: 60px;
            flex-shrink: 0;
          }
          .c-name { color: #3b82f6; }
          .c-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #3b82f6;
            flex-shrink: 0;
          }
          
          .card-section {
            margin-bottom: 20px;
          }
          .card-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          .card-name {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
          }
          .tag {
            font-size: 10px;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
          }
          .tag.live { background: #0a2a1a; color: #10b981; border: 1px solid #10b981; }
          .tag.build { background: #0e1a2e; color: #3b82f6; border: 1px solid #3b82f6; }
          .tag.paying { background: #1a2a0a; color: #84cc16; border: 1px solid #84cc16; }
          .tag.parked { background: #1a1a1a; color: #555; border: 1px solid #333; }
          .tag.pipeline { background: #2a1a0a; color: #f59e0b; border: 1px solid #f59e0b; }
          
          .card-sub {
            font-size: 12px;
            color: #444;
            margin-bottom: 15px;
          }
          
          .sec-t {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-bottom: 8px;
            margin-top: 15px;
            font-weight: 600;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 4px;
          }
          .sec-t:first-of-type { margin-top: 0; }
          
          .r {
            font-size: 14px;
            color: #aaa;
            padding: 4px 0;
            display: flex;
            align-items: baseline;
            gap: 8px;
            line-height: 1.5;
          }
          .d {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 6px;
          }
          .d.g { background: #10b981; }
          .d.y { background: #f59e0b; }
          .d.re { background: #ef4444; }
          .d.b { background: #3b82f6; }
          .d.x { background: #333; }
          
          .cron-row {
            font-size: 13px;
            color: #3b82f6;
            padding: 4px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .cron-row .cron-time {
            font-weight: 600;
            min-width: 80px;
            flex-shrink: 0;
          }
          .cron-row .cron-name { color: #5b9cf6; }
          
          .bar {
            height: 4px;
            background: #1a1a1a;
            border-radius: 2px;
            margin-top: 15px;
          }
          .bar-inner {
            height: 4px;
            border-radius: 2px;
          }
          .bar-inner.g { background: #10b981; }
          .bar-inner.b { background: #3b82f6; }
          .bar-inner.y { background: #f59e0b; }
          
          .personal-section {
            background: #0d0d0d;
            border: 1px solid #1a1a1a;
          }
          .personal-section h2 {
            font-size: 16px;
            color: #555;
            margin-bottom: 15px;
          }
          .p-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .personal-section .r { color: #555; font-size: 13px; }
          .personal-section .sec-t { color: #333; }
          
          .footer {
            font-size: 12px;
            color: #222;
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #222;
          }
          
          @media (max-width: 640px) {
            .p-grid { grid-template-columns: 1fr; }
            .top { text-align: center; }
            .top h1 { font-size: 20px; }
            .dates-inner { gap: 15px; }
          }
        `}</style>
      </Head>

      <div>
        <div className="top">
          <h1>🎯 Adam's Command Centre</h1>
          <span className="meta">27 Feb 2026 · Ricky-Jnr 🤙</span>
        </div>

        {/* HEALTH SECTION */}
        <div className="section health-section">
          <span className="health-pct">85%</span>
          <div className="health-lbl">System Health</div>
          <div className="pills">
            <span className="pill r">4 Critical</span>
            <span className="pill y">6 Medium</span>
            <span className="pill g">14 Pass</span>
          </div>
          <div className="cron-info">
            <div>Cron Jobs</div>
            <div className="cron-active">● 28 Active</div>
            <div>Last heartbeat: OK</div>
            <div>WhatsApp: Connected</div>
          </div>
        </div>

        {/* REPORTS SECTION */}
        <div className="section reports-section">
          <div className="section-title">Recent Reports</div>
          <div className="rpt-row">
            <span className="rpt-open">↗</span>
            <span>27 Feb — SSOB Morning Report (All 8 states complete) ✅</span>
          </div>
          <div className="rpt-row">
            <span className="rpt-open">↗</span>
            <span>27 Feb — Alpha Governance Audit ⚠️ (Research deliverables stale)</span>
          </div>
          <div className="rpt-row">
            <span className="rpt-open">↗</span>
            <span>26 Feb — SSOB Morning Report (Phase 2 Complete) ✅</span>
          </div>
          <div className="rpt-row">
            <span className="rpt-open">↗</span>
            <span>27 Feb — V3DN + Portfolio + Alpha Audit ⚠️</span>
          </div>
          <div className="rpt-row">
            <span className="rpt-open">↗</span>
            <span>25 Feb — SSOB Morning Report ✅</span>
          </div>
          <div className="rpt-row">
            <span className="rpt-open">↗</span>
            <span>25 Feb — Executive Governance Audit ⚠️</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>24 Feb — BTS Competitor Baseline ✅</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>24 Feb — BTS Leadzilla Report ✅</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>24 Feb — SSOB Morning ✅</span>
          </div>
          <div className="rpt-row">
            <span className="d b"></span>
            <span>24 Feb — MYOB Acumatica (in progress)</span>
          </div>
          <div className="rpt-row">
            <span className="d b"></span>
            <span>24 Feb — AI-CAD Research (in progress)</span>
          </div>
          <div className="rpt-row">
            <span className="d y"></span>
            <span>24 Feb — GridPilot Governance Audit ⚠️</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>23 Feb — SSOB Morning ✅</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>23 Feb — CAIRR Governance Audit ✅</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>22 Feb — SSOB Morning ✅</span>
          </div>
          <div className="rpt-row">
            <span className="d g"></span>
            <span>21 Feb — V3DN Security Audit ✅</span>
          </div>
        </div>

        {/* APPROVALS SECTION */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">🚨 Pending Approvals</div>
            <div className="section-badge urgent">23 Items</div>
          </div>
          <div className="sec-t">CRITICAL OVERDUE</div>
          <div className="r"><span className="d re"></span>Parriwi Road quote (4hr reminders active)</div>
          <div className="r"><span className="d re"></span>Reddit/Whirlpool signups (overdue since 23 Feb)</div>
          <div className="r"><span className="d re"></span>Domain review (overdue since 23 Feb)</div>
          <div className="r"><span className="d re"></span>V3DN legal disclaimers ($67k risk exposure)</div>
          <div className="sec-t">TONIGHT - CAIRR SEO LAUNCH</div>
          <div className="r"><span className="d y"></span>Deploy cairr.ai live (approve dev site)</div>
          <div className="r"><span className="d y"></span>Google Business Profile setup</div>
          <div className="r"><span className="d y"></span>Analytics & Search Console</div>
          <div className="r"><span className="d y"></span>Domain/email finalization</div>
          <div className="r"><span className="d y"></span>First blog post approval</div>
          <div className="sec-t">THIS WEEK</div>
          <div className="r"><span className="d b"></span>BTS scope clarification (5 website pages)</div>
          <div className="r"><span className="d b"></span>GridPilot: Amber signup approval</div>
          <div className="r"><span className="d b"></span>GridPilot: Domain purchase (gridpilot.com.au)</div>
          <div className="r"><span className="d b"></span>Property Scan Phase 3 approval</div>
        </div>

        {/* DATES SECTION */}
        <div className="section dates-section">
          <div className="dates-inner">
            <div className="dates-left">
              <div className="section-title">Key Dates & Overdue</div>
              <div className="d-row">
                <span className="d-label">OVERDUE</span>
                <span className="d-text">Parriwi Rd quote · Reddit/Whirlpool · Domain review</span>
              </div>
              <div className="d-row">
                <span className="d-label">TONIGHT</span>
                <span className="d-text">CAIRR SEO launch (5 approvals needed)</span>
              </div>
              <div className="d-row">
                <span className="d-label">3 MAR</span>
                <span className="d-text">First BTS weekly report due</span>
              </div>
              <div className="d-row">
                <span className="d-label">16 MAR</span>
                <span className="d-text">Battery install — GoodWe hybrid + battery</span>
              </div>
              <div className="d-row">
                <span className="d-label">APR W1</span>
                <span className="d-text">BTS courses start</span>
              </div>
            </div>
            <div className="dates-right">
              <div className="section-title">Global Crons (Active)</div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">12AM</span>
                <span className="c-name">Governance Audit (rotating)</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">3AM</span>
                <span className="c-name">Community & Reddit Research</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">4AM</span>
                <span className="c-name">Email Cleanup</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">5AM</span>
                <span className="c-name">Self-Improvement Research</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">6AM</span>
                <span className="c-name">CAIRR & Business Research</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">7AM</span>
                <span className="c-name">Morning Brief (WhatsApp)</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">8,12,16,20</span>
                <span className="c-name">Parriwi Rd Reminder</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">12PM</span>
                <span className="c-name">Midday Check-in</span>
              </div>
              <div className="c-row">
                <span className="c-dot"></span>
                <span className="c-time">6PM</span>
                <span className="c-name">End of Day Wrap</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROPERTY SCAN */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🏠 Property Scan</span>
            <span className="tag build">Phase 2 Complete</span>
          </div>
          <div className="card-sub">Australia-wide · Commercial/Industrial · Max $800k · 8%+ yield</div>
          <div className="sec-t">Phase 2 Complete ✅</div>
          <div className="r"><span className="d g"></span>17 properties found (NSW: Moree, Armidale, Tenterfield)</div>
          <div className="r"><span className="d g"></span>Yields: 7.90%-18.29% (all above 8% target)</div>
          <div className="r"><span className="d g"></span>Methodology: One website at a time (working)</div>
          <div className="r"><span className="d g"></span>Rate limiting: 3-5 second delays (respected)</div>
          <div className="sec-t">APPROVAL NEEDED</div>
          <div className="r"><span className="d y"></span>Phase 3 approval: Continue NSW or start QLD?</div>
          <div className="r"><span className="d b"></span>Review Phase 2 results (17 properties CSV)</div>
          <div className="sec-t">Next Phases (Pending Approval)</div>
          <div className="r"><span className="d x"></span>QLD regional agents</div>
          <div className="r"><span className="d x"></span>VIC, WA, SA, TAS, NT, ACT</div>
          <div className="bar"><div className="bar-inner y" style={{width:'35%'}}></div></div>
        </div>

        {/* NBHW */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🔧 NBHW</span>
            <span className="tag live">Live</span>
          </div>
          <div className="card-sub">Plumbing · northernbeacheshotwater.com.au</div>
          <div className="sec-t">Tasks</div>
          <div className="r"><span className="d re"></span>Security — no admin auth</div>
          <div className="r"><span className="d re"></span>Supabase RLS too permissive</div>
          <div className="r"><span className="d re"></span>SPA rendering kills SEO</div>
          <div className="r"><span className="d b"></span>14 old blogs to rewrite</div>
          <div className="r"><span className="d b"></span>New keyword-targeted blogs</div>
          <div className="r"><span className="d b"></span>Services grid (committed, not pushed)</div>
          <div className="r"><span className="d b"></span>Competitor analysis</div>
          <div className="r"><span className="d y"></span>LeadChat cancel</div>
          <div className="r"><span className="d y"></span>Lead source tracking (UTM)</div>
          <div className="sec-t">Google Access ✅</div>
          <div className="r"><span className="d g"></span>GA4 — crnbhw@gmail.com added</div>
          <div className="r"><span className="d g"></span>GSC — crnbhw@gmail.com added</div>
          <div className="r"><span className="d g"></span>GBP — crnbhw@gmail.com added</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Daily 6AM</span>
            <span className="cron-name">Supabase Keepalive</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Mon 5AM</span>
            <span className="cron-name">Blog Drafts (2x: 1 old + 1 new)</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Tue 8AM</span>
            <span className="cron-name">Google Monitoring (GA+GSC+GBP)</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Wed 6AM</span>
            <span className="cron-name">Site Health Check</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Thu 5AM</span>
            <span className="cron-name">Blog Drafts (2x: 1 old + 1 new)</span>
          </div>
          <div className="bar"><div className="bar-inner y" style={{width:'60%'}}></div></div>
        </div>

        {/* BTS */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">📚 BTS</span>
            <span className="tag paying">£300/mo</span>
          </div>
          <div className="card-sub">CAIRR — Sunny · bettertrainingsolutions.co.uk</div>
          <div className="sec-t">Tasks</div>
          <div className="r"><span className="d g"></span>Competitor baseline ✅</div>
          <div className="r"><span className="d g"></span>Leadzilla report ✅</div>
          <div className="r"><span className="d g"></span>Scope of Works ✅</div>
          <div className="r"><span className="d g"></span>Weekly Ops Playbook ✅</div>
          <div className="r"><span className="d b"></span>Site audit (after live 25 Feb)</div>
          <div className="r"><span className="d b"></span>SEO keyword research</div>
          <div className="r"><span className="d b"></span>Google Ads campaign draft</div>
          <div className="r"><span className="d b"></span>Directory listings</div>
          <div className="r"><span className="d y"></span>Gas Safe postcodes — Sunny</div>
          <div className="r"><span className="d y"></span>Confirm "Advanced for Training"</div>
          <div className="sec-t">🚨 SCOPE CLARIFICATION NEEDED</div>
          <div className="r"><span className="d re"></span>5 service pages NOT in £300/mo scope</div>
          <div className="r"><span className="d re"></span>Heat pump, Water regs, Legionella, LPG, Multi-trade</div>
          <div className="r"><span className="d re"></span>Discuss with Sunny: In scope or additional fee?</div>
          <div className="sec-t">Scope (11 services)</div>
          <div className="r"><span className="d g"></span>SEO · Competitor · Keywords · On-page</div>
          <div className="r"><span className="d g"></span>Content · GBP · Ads · Traffic · Social</div>
          <div className="r"><span className="d g"></span>Directories · Maintenance</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Mon 6AM</span>
            <span className="cron-name">Blog Drafts (2x targeted)</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Mon 7AM</span>
            <span className="cron-name">Weekly Competitor Report</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Thu 6AM</span>
            <span className="cron-name">Blog Drafts (2x targeted)</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Every 30m</span>
            <span className="cron-name">Site Live Check</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">1st/month</span>
            <span className="cron-name">Invoice → Adam approval → Sunny</span>
          </div>
          <div className="bar"><div className="bar-inner g" style={{width:'70%'}}></div></div>
        </div>

        {/* GRIDPILOT */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">⚡ GridPilot</span>
            <span className="tag build">0→1</span>
          </div>
          <div className="card-sub">Battery SaaS</div>
          <div className="sec-t">Tasks</div>
          <div className="r"><span className="d re"></span>Fix Turbopack build error</div>
          <div className="r"><span className="d b"></span>Phase 1 engine</div>
          <div className="r"><span className="d g"></span>SEO done ✅</div>
          <div className="sec-t">🚨 LAUNCH DECISIONS NEEDED</div>
          <div className="r"><span className="d re"></span>GitHub repo creation (approve private setup)</div>
          <div className="r"><span className="d re"></span>Amber Electric signup (review partnership terms)</div>
          <div className="r"><span className="d re"></span>Domain purchase (gridpilot.com.au available?)</div>
          <div className="r"><span className="d re"></span>Legal budget approval (~$2K for T&Cs, insurance)</div>
          <div className="sec-t">Gov Funding</div>
          <div className="r"><span className="d g"></span>R&D Tax Incentive research ✅</div>
          <div className="r"><span className="d g"></span>$50k-$200k opportunity identified ✅</div>
          <div className="r"><span className="d b"></span>Registration package ready</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Daily 2AM</span>
            <span className="cron-name">GridPilot Dev (autonomous)</span>
          </div>
          <div className="bar"><div className="bar-inner y" style={{width:'76%'}}></div></div>
        </div>

        {/* CAIRR */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🏗️ CAIRR</span>
            <span className="tag build">Active</span>
          </div>
          <div className="card-sub">AI consultancy · cairr.ai · £300 MRR</div>
          <div className="sec-t">🚨 SEO Launch TONIGHT (5 Approvals Needed)</div>
          <div className="r"><span className="d re"></span>Deploy cairr.ai live (approve dev site)</div>
          <div className="r"><span className="d re"></span>Google Business Profile setup</div>
          <div className="r"><span className="d re"></span>Google Analytics & Search Console</div>
          <div className="r"><span className="d re"></span>Domain/email finalization</div>
          <div className="r"><span className="d re"></span>First blog post approval</div>
          <div className="sec-t">Tasks</div>
          <div className="r"><span className="d g"></span>Domain registered (cairr.ai) ✅</div>
          <div className="r"><span className="d g"></span>Google Workspace ✅</div>
          <div className="r"><span className="d g"></span>Website dev site ready ✅</div>
          <div className="r"><span className="d g"></span>SEO framework complete ✅</div>
          <div className="r"><span className="d y"></span>Stripe setup (needs ABN)</div>
          <div className="sec-t">Pipeline</div>
          <div className="r"><span className="d g"></span>Sunny (BTS) — £300/mo ✅</div>
          <div className="r"><span className="d b"></span>Sohrab (TWPG) — office visit next</div>
          <div className="r"><span className="d x"></span>Stone Plus — early convo</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Mon 6AM</span>
            <span className="cron-name">SEO Week 1: Analysis & Strategy</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Tue 6AM</span>
            <span className="cron-name">SEO Week 2: Content & Technical</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Wed 6AM</span>
            <span className="cron-name">SEO Week 3: Authority & Local</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">Thu 6AM</span>
            <span className="cron-name">SEO Week 4: Monitoring & Reports</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">7AM Daily</span>
            <span className="cron-name">SEO Health & Rankings Monitor</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">8PM M/W/F</span>
            <span className="cron-name">Google Business Profile Posts</span>
          </div>
          <div className="cron-row">
            <span className="cron-time">1st/month</span>
            <span className="cron-name">Monthly SEO Report (PDF)</span>
          </div>
          <div className="bar"><div className="bar-inner g" style={{width:'85%'}}></div></div>
        </div>

        {/* FINCHLEY */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🇬🇧 Finchley</span>
            <span className="tag parked">Waiting</span>
          </div>
          <div className="card-sub">CAIRR — boilers UK (Hilton)</div>
          <div className="sec-t">Tasks</div>
          <div className="r"><span className="d y"></span>Deploy token — Hilton</div>
          <div className="r"><span className="d y"></span>Phone — Hilton</div>
          <div className="r"><span className="d x"></span>Competitor analysis</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">—</span>
            <span className="cron-name">None (waiting on Hilton)</span>
          </div>
          <div className="bar"><div className="bar-inner g" style={{width:'90%'}}></div></div>
        </div>

        {/* V3DN */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">💰 V3DN</span>
            <span className="tag live">Live</span>
          </div>
          <div className="card-sub">Crypto · Dashboard live</div>
          <div className="sec-t">Tasks</div>
          <div className="r"><span className="d g"></span>Dashboard built ✅</div>
          <div className="r"><span className="d g"></span>Security audit — 0 leaks ✅</div>
          <div className="r"><span className="d re"></span>🚨 Legal disclaimers URGENT ($67k risk exposure)</div>
          <div className="r"><span className="d b"></span>Launch script</div>
          <div className="r"><span className="d b"></span>Alerts bot</div>
          <div className="r"><span className="d y"></span>DeBank key — revoke needed</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Thu 12AM</span>
            <span className="cron-name">V3DN + Portfolio Audit</span>
          </div>
          <div className="bar"><div className="bar-inner y" style={{width:'85%'}}></div></div>
        </div>

        {/* SSOB */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🏘️ SSOB</span>
            <span className="tag live">Live</span>
          </div>
          <div className="card-sub">Property · Dashboard live</div>
          <div className="sec-t">Scan Status</div>
          <div className="r"><span className="d g"></span>NSW: 14 · QLD: 33 · VIC: scanning</div>
          <div className="r"><span className="d g"></span>WA: 16 · SA: 7 · TAS: 4</div>
          <div className="r"><span className="d g"></span>NT: 1 · ACT: 2</div>
          <div className="r"><span className="d re"></span>Dashboard data stale (20 Feb)</div>
          <div className="r"><span className="d b"></span>Automation pipeline building</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Daily 5AM</span>
            <span className="cron-name">SSOB Morning Report</span>
          </div>
          <div className="bar"><div className="bar-inner y" style={{width:'70%'}}></div></div>
        </div>

        {/* TWPG */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🚢 TWPG</span>
            <span className="tag pipeline">Pipeline</span>
          </div>
          <div className="card-sub">Sohrab Fataar · Boat building · Govt contracts</div>
          <div className="sec-t">Meeting — 24 Feb ✅</div>
          <div className="r"><span className="d g"></span>First meeting done</div>
          <div className="r"><span className="d g"></span>Already using LLMs</div>
          <div className="r"><span className="d g"></span>Excited about CAIRR</div>
          <div className="sec-t">Research</div>
          <div className="r"><span className="d b"></span>MYOB Acumatica deep dive</div>
          <div className="r"><span className="d b"></span>AI-CAD for boat building</div>
          <div className="r"><span className="d b"></span>NIST/CMMC compliance</div>
          <div className="r"><span className="d b"></span>Local/self-hosted AI options</div>
          <div className="sec-t">Next Steps</div>
          <div className="r"><span className="d y"></span>Office visit — date TBC</div>
          <div className="r"><span className="d x"></span>Don't pitch until office visit</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Tonight 1AM</span>
            <span className="cron-name">NIST/CMMC Research (one-shot)</span>
          </div>
          <div className="bar"><div className="bar-inner b" style={{width:'20%'}}></div></div>
        </div>

        {/* ALPHA */}
        <div className="section card-section">
          <div className="card-head">
            <span className="card-name">🏠 Alpha</span>
            <span className="tag parked">Concept</span>
          </div>
          <div className="card-sub">Property analytics · No codebase yet</div>
          <div className="sec-t">Research Gaps (All Stale)</div>
          <div className="r"><span className="d re"></span>Market Research (⬜ Not done)</div>
          <div className="r"><span className="d re"></span>Competitor Analysis (⬜ Not done)</div>
          <div className="r"><span className="d re"></span>Technical Architecture (⬜ Not done)</div>
          <div className="r"><span className="d re"></span>Legal/Compliance (⬜ Not done)</div>
          <div className="sec-t">Recommendations</div>
          <div className="r"><span className="d y"></span>Commission market research to define MVP</div>
          <div className="r"><span className="d y"></span>Technical architecture design</div>
          <div className="r"><span className="d y"></span>Legal review for compliance</div>
          <div className="sec-t">Crons</div>
          <div className="cron-row">
            <span className="cron-time">Fri 12AM</span>
            <span className="cron-name">Alpha Audit</span>
          </div>
          <div className="bar"><div className="bar-inner y" style={{width:'75%'}}></div></div>
        </div>

        {/* PERSONAL */}
        <div className="section personal-section">
          <h2>🏠 Personal</h2>
          <div className="p-grid">
            <div>
              <div className="sec-t">Money</div>
              <div className="r"><span className="d g"></span>Michelle ✅</div>
              <div className="r"><span className="d g"></span>Michael ✅</div>
              <div className="r"><span className="d g"></span>Hope St ✅</div>
              <div className="r"><span className="d re"></span>🚨 Parriwi Rd quote OVERDUE</div>
              <div className="r"><span className="d y"></span>Debra tax</div>
              <div className="r"><span className="d y"></span>Subs review</div>
              <div className="sec-t">Admin</div>
              <div className="r"><span className="d re"></span>🚨 Reddit + Whirlpool signups OVERDUE</div>
              <div className="r"><span className="d re"></span>🚨 Domain review OVERDUE</div>
              <div className="r"><span className="d y"></span>Security (2FA, 1Pass)</div>
              <div className="r"><span className="d re"></span>ABN for CAIRR</div>
              <div className="r"><span className="d re"></span>Stripe setup (needs ABN + cairr.ai email)</div>
              <div className="r"><span className="d b"></span>CAIRR invoice template (tonight)</div>
              <div className="r"><span className="d g"></span>Accounting system built ✅</div>
              <div className="r"><span className="d b"></span>Upload bank CSV monthly</div>
              <div className="r"><span className="d y"></span>LeadChat cancel</div>
            </div>
            <div>
              <div className="sec-t">House</div>
              <div className="r"><span className="d x"></span>Kitchen · Ollie's room</div>
              <div className="r"><span className="d x"></span>Econogrid front</div>
              <div className="r"><span className="d x"></span>Fence · Deck</div>
              <div className="r"><span className="d x"></span>External shower</div>
              <div className="sec-t">Boat & Fishing</div>
              <div className="r"><span className="d x"></span>Clean & polish</div>
              <div className="r"><span className="d x"></span>Gelcoat repair</div>
              <div className="r"><span className="d x"></span>Gear · Gun racks</div>
              <div className="r"><span className="d x"></span>Reef trip w/ Piet</div>
            </div>
          </div>
        </div>

        <div className="footer">
          Ricky-Jnr 🤙 · 28 cron jobs · All projects · Complete mobile dashboard
        </div>
      </div>
    </>
  )
}