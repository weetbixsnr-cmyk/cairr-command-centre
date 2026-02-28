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
            padding: 16px; 
            line-height: 1.4;
            font-size: 16px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 24px; 
            border-bottom: 1px solid #333;
            padding-bottom: 16px;
          }
          .header h1 { font-size: 24px; margin-bottom: 6px; font-weight: 700; }
          .header .time { font-size: 13px; color: #888; }
          .section {
            background: #111;
            border: 1px solid #333;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .section.needs-adam { border-color: #dc2626; }
          .section.alerts { border-color: #f59e0b; }
          .section.in-progress { border-color: #3b82f6; }
          .section.fleet { border-color: #333; }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .count {
            font-size: 13px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 8px;
          }
          .count.red { background: #dc2626; color: #fff; }
          .count.amber { background: #f59e0b; color: #000; }
          .count.blue { background: #3b82f6; color: #fff; }
          .count.gray { background: #333; color: #999; }
          .item {
            padding: 10px 0;
            border-bottom: 1px solid #1a1a1a;
            min-height: 44px;
          }
          .item:last-child { border-bottom: none; }
          .item-new {
            font-weight: 700;
            color: #fff;
            font-size: 16px;
            line-height: 1.3;
          }
          .item-detail {
            font-size: 13px;
            color: #888;
            margin-top: 2px;
          }
          .fleet-table {
            width: 100%;
            font-size: 14px;
          }
          .fleet-table td {
            padding: 8px 0;
            border-bottom: 1px solid #1a1a1a;
          }
          .fleet-table td:first-child { color: #ccc; font-weight: 600; }
          .fleet-table td:last-child { text-align: right; }
          .status-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 6px;
          }
          .dot-green { background: #10b981; }
          .dot-amber { background: #f59e0b; }
          .dot-red { background: #dc2626; }
          .empty-state {
            text-align: center;
            color: #666;
            padding: 20px;
            font-size: 15px;
          }
          .footer {
            text-align: center;
            padding: 16px;
            color: #444;
            font-size: 13px;
            margin-top: 20px;
          }
        `}</style>
      </Head>

      <div>
        <div className="header">
          <h1>🎯 Command Centre</h1>
          <div className="time">Saturday, 28 Feb 2026</div>
        </div>

        {/* NEEDS ADAM — red border, bold items, NO TICKS */}
        <div className="section needs-adam">
          <div className="section-title">
            🔴 Needs Adam
            <span className="count red">2</span>
          </div>
          <div className="item">
            <div className="item-new">Discord agent channels not resolving</div>
            <div className="item-detail">Bots connect but REST returns 403 — may need re-invites</div>
          </div>
          <div className="item">
            <div className="item-new">Memory search broken — wrong API key</div>
            <div className="item-detail">OpenAI embeddings using OpenRouter key</div>
          </div>
        </div>

        {/* ALERTS — amber border */}
        <div className="section alerts">
          <div className="section-title">
            🟡 Alerts
            <span className="count amber">2</span>
          </div>
          <div className="item">
            <div className="item-new">ABN not registered</div>
            <div className="item-detail">Needed for Stripe + invoicing</div>
          </div>
          <div className="item">
            <div className="item-new">Stripe not set up</div>
            <div className="item-detail">Blocked by ABN</div>
          </div>
        </div>

        {/* IN PROGRESS — blue border */}
        <div className="section in-progress">
          <div className="section-title">
            🔵 In Progress
            <span className="count blue">3</span>
          </div>
          <div className="item">
            <div className="item-new">Agent fleet activation</div>
            <div className="item-detail">7 agents deployed, heartbeats running</div>
          </div>
          <div className="item">
            <div className="item-new">Governance cleanup</div>
            <div className="item-detail">All files under limits, zero dupes, nightly audit pending</div>
          </div>
          <div className="item">
            <div className="item-new">Nightly self-improvement cron</div>
            <div className="item-detail">5am AEST, DeepSeek V3 — first run pending</div>
          </div>
        </div>

        {/* FLEET STATUS — compact table, dots only for heartbeat status */}
        <div className="section fleet">
          <div className="section-title">
            🤖 Fleet
            <span className="count gray">7 agents</span>
          </div>
          <table className="fleet-table">
            <tbody>
              <tr><td>BTS</td><td><span className="status-dot dot-green"></span>Heartbeat OK</td></tr>
              <tr><td>NBHW</td><td><span className="status-dot dot-green"></span>Heartbeat OK</td></tr>
              <tr><td>V3DN</td><td><span className="status-dot dot-green"></span>Heartbeat OK</td></tr>
              <tr><td>Property</td><td><span className="status-dot dot-green"></span>Heartbeat OK</td></tr>
              <tr><td>Command Centre</td><td><span className="status-dot dot-green"></span>Every 30min</td></tr>
              <tr><td>GridPilot</td><td><span className="status-dot dot-green"></span>Heartbeat OK</td></tr>
              <tr><td>Alpha</td><td><span className="status-dot dot-green"></span>Heartbeat OK</td></tr>
            </tbody>
          </table>
        </div>

        <div className="footer">
          🤙 Ricky-Jnr • Updated 28 Feb 2026
        </div>
      </div>
    </>
  )
}
