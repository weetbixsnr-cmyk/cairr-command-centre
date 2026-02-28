import Head from 'next/head'

export default function SimpleDashboard() {
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
            padding: 24px; 
            font-size: 18px;
            line-height: 1.5;
          }
          
          .title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 40px;
            color: #fff;
          }
          
          .big-status {
            text-align: center;
            margin-bottom: 40px;
          }
          .big-number {
            font-size: 80px;
            font-weight: 900;
            color: #00ff00;
            line-height: 1;
          }
          .big-label {
            font-size: 20px;
            color: #ccc;
            margin-top: 10px;
          }
          
          .section {
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #00ff00;
            margin-bottom: 20px;
            text-transform: uppercase;
          }
          
          .item {
            background: #111;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 10px;
            border-left: 4px solid #333;
          }
          .item.urgent { border-left-color: #ff0000; }
          .item.active { border-left-color: #00ff00; }
          .item.warning { border-left-color: #ffaa00; }
          
          .item-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .item-title.urgent { color: #ff0000; }
          .item-title.active { color: #00ff00; }
          .item-title.warning { color: #ffaa00; }
          
          .item-desc {
            font-size: 16px;
            color: #ccc;
          }
          
          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
          }
          .stat {
            background: #111;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
          }
          .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: #00ff00;
          }
          .stat-label {
            font-size: 14px;
            color: #ccc;
            margin-top: 5px;
          }
          
          .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #333;
          }
        `}</style>
      </Head>

      <div>
        <div className="title">🎯 COMMAND CENTRE</div>

        <div className="big-status">
          <div className="big-number">85%</div>
          <div className="big-label">SYSTEM HEALTHY</div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-number">28</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat">
            <div className="stat-number">10</div>
            <div className="stat-label">Properties Found</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">🚨 URGENT</div>
          
          <div className="item urgent">
            <div className="item-title urgent">PARRIWI QUOTE</div>
            <div className="item-desc">OVERDUE - Needs completion</div>
          </div>

          <div className="item warning">
            <div className="item-title warning">CAIRR SEO LAUNCH</div>
            <div className="item-desc">Tonight - All automation ready</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">🏠 PROPERTY SCAN</div>
          
          <div className="item active">
            <div className="item-title active">PHASE 2 RUNNING</div>
            <div className="item-desc">NSW regions • 10 properties found • 8%+ yields</div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">💰 PROJECTS</div>
          
          <div className="item active">
            <div className="item-title active">CAIRR</div>
            <div className="item-desc">Website ready • SEO launching tonight</div>
          </div>

          <div className="item active">
            <div className="item-title active">BTS</div>
            <div className="item-desc">£300/mo client • Site live • Monitoring active</div>
          </div>

          <div className="item warning">
            <div className="item-title warning">TWPG</div>
            <div className="item-desc">Pipeline client • Office visit pending</div>
          </div>
        </div>

        <div className="footer">
          🤙 Ricky-Jnr • Friday 5:30 PM • All Systems Go
        </div>
      </div>
    </>
  )
}