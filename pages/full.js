import Head from 'next/head'

export default function FullDashboard() {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Adam's Command Centre</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            background: #000; 
            color: #fff; 
            padding: 20px; 
            font-size: 16px;
            line-height: 1.4;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #333;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 8px;
          }
          .header .time {
            font-size: 14px;
            color: #888;
          }
          
          .health-box {
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 1px solid #444;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
            text-align: center;
          }
          .health-number {
            font-size: 64px;
            font-weight: 900;
            color: #10b981;
            line-height: 1;
            margin-bottom: 10px;
          }
          .health-status {
            font-size: 18px;
            color: #ccc;
            margin-bottom: 15px;
          }
          .health-details {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .health-pill {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }
          .health-pill.critical { background: #dc2626; color: #fff; }
          .health-pill.medium { background: #f59e0b; color: #000; }
          .health-pill.pass { background: #10b981; color: #000; }
          
          .stats-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
          }
          .stat-box {
            background: #111;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 18px;
            text-align: center;
          }
          .stat-number {
            font-size: 28px;
            font-weight: 800;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          .stat-label {
            font-size: 12px;
            color: #888;
          }
          
          .section {
            background: #111;
            border: 1px solid #333;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
          }
          .section-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
          .section-badge.urgent { background: #dc2626; color: #fff; }
          .section-badge.active { background: #10b981; color: #000; }
          .section-badge.warning { background: #f59e0b; color: #000; }
          .section-badge.info { background: #3b82f6; color: #fff; }
          
          .item {
            display: flex;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #222;
          }
          .item:last-child { border-bottom: none; }
          .item-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-top: 6px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .item-dot.red { background: #dc2626; }
          .item-dot.green { background: #10b981; }
          .item-dot.blue { background: #3b82f6; }
          .item-dot.yellow { background: #f59e0b; }
          .item-dot.gray { background: #666; }
          
          .item-content {
            flex: 1;
          }
          .item-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .item-title.urgent { color: #dc2626; }
          .item-title.success { color: #10b981; }
          .item-title.warning { color: #f59e0b; }
          .item-title.info { color: #3b82f6; }
          
          .item-desc {
            font-size: 13px;
            color: #aaa;
            line-height: 1.3;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
            color: #666;
            font-size: 14px;
          }
        `}</style>
      </Head>

      <div>
        <div className="header">
          <h1>🎯 Command Centre</h1>
          <div className="time">Friday, 27 Feb 2026 • 5:30 PM • Sydney</div>
        </div>

        <div className="health-box">
          <div className="health-number">85%</div>
          <div className="health-status">System Health</div>
          <div className="health-details">
            <span className="health-pill critical">4 Critical</span>
            <span className="health-pill medium">6 Medium</span>
            <span className="health-pill pass">14 Pass</span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-number">28</div>
            <div className="stat-label">Active Crons</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">10</div>
            <div className="stat-label">Properties</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">5</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">🚨 Priority Items</div>
            <div className="section-badge urgent">3 Urgent</div>
          </div>
          <div className="item">
            <div className="item-dot red"></div>
            <div className="item-content">
              <div className="item-title urgent">Parriwi Road Quote</div>
              <div className="item-desc">OVERDUE - Customer waiting, needs completion today</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot yellow"></div>
            <div className="item-content">
              <div className="item-title warning">CAIRR SEO Launch</div>
              <div className="item-desc">Tonight - All automation ready, blog post needs approval</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">BTS Weekly Report</div>
              <div className="item-desc">Due 3 Mar - First weekly competitor report for Sunny</div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">🏠 Australia Property Scan</div>
            <div className="section-badge active">Running</div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">Phase 2: NSW Regional</div>
              <div className="item-desc">Expanding beyond Moree - Armidale, Tamworth, Coffs regions</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot green"></div>
            <div className="item-content">
              <div className="item-title success">10 Properties Found</div>
              <div className="item-desc">Yields 7.90%-18.29%, all under $800k, commercial/industrial</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">Next Phases</div>
              <div className="item-desc">QLD, VIC, WA, SA, TAS, NT, ACT - Auto-launch when complete</div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">💰 Active Projects</div>
            <div className="section-badge info">5 Live</div>
          </div>
          <div className="item">
            <div className="item-dot green"></div>
            <div className="item-content">
              <div className="item-title success">CAIRR AI Consultancy</div>
              <div className="item-desc">Website ready • SEO launching tonight • 1 client (£300/mo)</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot green"></div>
            <div className="item-content">
              <div className="item-title success">BTS (Paying Client)</div>
              <div className="item-desc">£300/mo • Site live 25 Feb • Weekly reports starting</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot yellow"></div>
            <div className="item-content">
              <div className="item-title warning">TWPG Pipeline</div>
              <div className="item-desc">Sohrab • Boat building • Office visit scheduled • Huge potential</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot yellow"></div>
            <div className="item-content">
              <div className="item-title warning">GridPilot Battery</div>
              <div className="item-desc">Phase 1 building • R&D funding identified ($50k-200k)</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot green"></div>
            <div className="item-content">
              <div className="item-title success">V3DN Trading</div>
              <div className="item-desc">Dashboard live • Positions active • Auto-monitoring</div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">🤖 Automation Status</div>
            <div className="section-badge active">All Running</div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">CAIRR SEO Automation</div>
              <div className="item-desc">7AM daily monitor • Weekly cycle starting Monday</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">Property Scan Monitor</div>
              <div className="item-desc">Auto-restart phases • Progress tracking • 2hr updates</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">SSOB Reports</div>
              <div className="item-desc">Daily 5AM • All 8 states complete • 91 properties</div>
            </div>
          </div>
          <div className="item">
            <div className="item-dot blue"></div>
            <div className="item-content">
              <div className="item-title info">Governance Audits</div>
              <div className="item-desc">Nightly rotation • 29 audit frameworks • Auto-reporting</div>
            </div>
          </div>
        </div>

        <div className="footer">
          🤙 Ricky-Jnr • Secure Mobile Access • Last Update: Now • WhatsApp Connected
        </div>
      </div>
    </>
  )
}