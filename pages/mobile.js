import Head from 'next/head'

export default function MobileDashboard() {
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
            background: #000; 
            color: #fff; 
            padding: 20px; 
            line-height: 1.4;
            font-size: 16px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 1px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            font-size: 28px; 
            margin-bottom: 8px; 
            font-weight: 700;
          }
          .header .time { 
            font-size: 14px; 
            color: #888; 
          }
          
          .health-box {
            background: #111;
            border: 1px solid #333;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
          }
          .health-big {
            font-size: 64px;
            font-weight: 800;
            color: #f59e0b;
            margin-bottom: 10px;
            line-height: 1;
          }
          .health-status {
            font-size: 18px;
            color: #ccc;
            margin-bottom: 20px;
          }
          .health-pills {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .pill {
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
          }
          .pill.red { background: #dc2626; color: #fff; }
          .pill.yellow { background: #f59e0b; color: #000; }
          .pill.green { background: #10b981; color: #000; }
          
          .section {
            background: #111;
            border: 1px solid #333;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #fff;
          }
          .section-title .badge {
            float: right;
            background: #10b981;
            color: #000;
            padding: 4px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
          }
          .section-title .badge.active { background: #3b82f6; color: #fff; }
          .section-title .badge.warning { background: #f59e0b; color: #000; }
          
          .item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #222;
            font-size: 16px;
          }
          .item:last-child { border-bottom: none; }
          .item-icon {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 15px;
            flex-shrink: 0;
          }
          .item-icon.green { background: #10b981; }
          .item-icon.blue { background: #3b82f6; }
          .item-icon.yellow { background: #f59e0b; }
          .item-icon.red { background: #dc2626; }
          .item-icon.gray { background: #666; }
          .item-text { flex: 1; color: #ccc; }
          
          .priority-high { color: #dc2626; font-weight: 600; }
          .priority-medium { color: #f59e0b; }
          .priority-low { color: #10b981; }
          
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          .stat-box {
            background: #111;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }
          .stat-number {
            font-size: 32px;
            font-weight: 800;
            color: #3b82f6;
            margin-bottom: 8px;
          }
          .stat-label {
            font-size: 14px;
            color: #888;
          }
          
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #333;
            margin-top: 30px;
          }
        `}</style>
      </Head>

      <div>
        <div className="header">
          <h1>🎯 Command Centre</h1>
          <div className="time">Friday, 27 Feb 2026 • 5:30 PM</div>
        </div>

        <div className="health-box">
          <div className="health-big">85%</div>
          <div className="health-status">System Health</div>
          <div className="health-pills">
            <span className="pill red">4 Critical</span>
            <span className="pill yellow">6 Medium</span>
            <span className="pill green">14 Pass</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">28</div>
            <div className="stat-label">Active Crons</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">10</div>
            <div className="stat-label">Properties Found</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            🚨 Priority Items
            <span className="badge warning">3 Urgent</span>
          </div>
          <div className="item">
            <div className="item-icon red"></div>
            <div className="item-text priority-high">Parriwi Rd quote - OVERDUE</div>
          </div>
          <div className="item">
            <div className="item-icon yellow"></div>
            <div className="item-text priority-medium">CAIRR SEO launch - Tonight</div>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">BTS weekly report - 3 Mar</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            🏠 Property Scan
            <span className="badge active">Running</span>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">Phase 2: NSW regional agents</div>
          </div>
          <div className="item">
            <div className="item-icon green"></div>
            <div className="item-text">10 properties found (8%+ yield)</div>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">Auto-reporting every 2 hours</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            💰 Active Projects
            <span className="badge">5 Live</span>
          </div>
          <div className="item">
            <div className="item-icon green"></div>
            <div className="item-text">CAIRR - Website ready, SEO launching</div>
          </div>
          <div className="item">
            <div className="item-icon green"></div>
            <div className="item-text">BTS - £300/mo, monitoring active</div>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">TWPG - Pipeline, office visit pending</div>
          </div>
          <div className="item">
            <div className="item-icon yellow"></div>
            <div className="item-text">GridPilot - Phase 1 building</div>
          </div>
          <div className="item">
            <div className="item-icon green"></div>
            <div className="item-text">V3DN - Dashboard live, trading active</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">
            🤖 Automation
            <span className="badge">All Running</span>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">CAIRR SEO - Daily monitoring active</div>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">Property scan - Phase monitoring</div>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">SSOB reports - Daily 5AM</div>
          </div>
          <div className="item">
            <div className="item-icon blue"></div>
            <div className="item-text">Governance audits - Nightly rotation</div>
          </div>
        </div>

        <div className="footer">
          🤙 Ricky-Jnr • Secure Mobile Access • All Systems Operational
        </div>
      </div>
    </>
  )
}