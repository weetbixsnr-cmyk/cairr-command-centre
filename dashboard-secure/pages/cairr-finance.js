import Head from 'next/head'
import { useState, useEffect } from 'react'

function useSnapshot(interval = 30000) {
  const [data, setData] = useState(null)
  useEffect(() => {
    const load = () => fetch('/api/data').then(r => r.json()).then(setData).catch(() => {})
    load()
    const id = setInterval(load, interval)
    return () => clearInterval(id)
  }, [interval])
  return data
}

function timeAgo(d) {
  if (!d) return '—'
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function MrrGauge({ current, target }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  const color = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (pct / 100) * circumference
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1a1a22" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color }}>{pct}%</div>
        <div style={{ fontSize: 9, color: '#888', letterSpacing: 1 }}>OF TARGET</div>
      </div>
    </div>
  )
}

export default function CairrFinance() {
  const snap = useSnapshot()
  const fin = snap?.cairrFinance
  const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CAIRR Financials</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#08080a;color:#e0e0e0;padding:16px 20px}
          a{color:#3b82f6;text-decoration:none}a:hover{text-decoration:underline}
          .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px}
          h1{font-size:18px;color:#fff}
          .meta{font-size:9px;color:#888}
          .nav{display:flex;gap:8px;margin-bottom:14px}
          .nav a{font-size:10px;padding:4px 10px;background:#111;border:1px solid #222;border-radius:6px}
          .nav a:hover{border-color:#3b82f6}
          .nav a.active{border-color:#10b981;color:#10b981}

          .strip{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
          .strip-item{background:#0d0d10;border:1px solid #1a1a22;border-radius:8px;padding:10px 16px;flex:1;min-width:130px}
          .strip-val{font-size:22px;font-weight:800}
          .strip-lbl{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:0.8px;margin-top:2px}
          .strip-sub{font-size:9px;color:#666;margin-top:2px}

          .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
          @media(max-width:700px){.grid{grid-template-columns:1fr}}

          .panel{background:#0d0d10;border:1px solid #1a1a22;border-radius:10px;padding:16px}
          .panel-full{grid-column:1/-1}
          .sec-t{font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;font-weight:600;border-bottom:1px solid #1a1a1a;padding-bottom:4px}

          .client-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #111}
          .client-row:last-child{border-bottom:none}
          .client-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0}
          .client-info{flex:1}
          .client-name{font-size:13px;font-weight:700;color:#fff}
          .client-company{font-size:10px;color:#888}
          .client-amount{font-size:16px;font-weight:800;text-align:right}
          .client-status{font-size:8px;padding:2px 8px;border-radius:4px;font-weight:600;text-align:right}
          .status-active{background:#0a2a1a;color:#10b981}
          .status-overdue{background:#3b1010;color:#ef4444}
          .status-cancelled{background:#1a1a22;color:#666}

          .expense-row{display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #111;font-size:11px}
          .expense-row:last-child{border-bottom:none}
          .expense-cat{font-size:7px;color:#a855f7;background:#1a0a2a;padding:2px 6px;border-radius:4px;font-weight:600;min-width:36px;text-align:center;text-transform:uppercase;margin-right:8px}
          .expense-name{flex:1;color:#ccc}
          .expense-amount{font-weight:700;color:#ef4444;min-width:70px;text-align:right}
          .expense-note{font-size:9px;color:#666;margin-left:8px;min-width:80px}

          .pl-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #111;font-size:12px}
          .pl-row:last-child{border-bottom:none;font-weight:800;font-size:14px;padding-top:8px;border-top:1px solid #333}

          .stripe-badge{font-size:8px;padding:3px 8px;border-radius:4px;font-weight:600;display:inline-flex;align-items:center;gap:4px}
          .stripe-connected{background:#0a2a1a;color:#10b981}
          .stripe-pending{background:#2a2000;color:#f59e0b}

          .footer{font-size:8px;color:#1a1a1a;text-align:right;margin-top:16px}
        `}</style>
      </Head>

      <div>
        <div className="top">
          <h1>💰 CAIRR Financials</h1>
          <span className="meta">
            {now} · Data {fin?.lastUpdated ? timeAgo(fin.lastUpdated) : '—'}
            {' · '}
            <span className={`stripe-badge ${fin?.stripe?.connected ? 'stripe-connected' : 'stripe-pending'}`}>
              {fin?.stripe?.connected ? '⚡ Stripe Live' : '⏳ Stripe Pending'}
            </span>
          </span>
        </div>

        <div className="nav">
          <a href="/">🎯 Dashboard</a>
          <a href="/fleet">🏢 Fleet</a>
          <a href="/system">🔌 System</a>
          <a href="/ricky">🧠 Ricky</a>
          <a href="/cairr-finance" className="active">💰 CAIRR Finance</a>
        </div>

        {!fin ? (
          <div className="panel" style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading financial data…</div>
        ) : (
          <>
            {/* ── KPI Strip ── */}
            <div className="strip">
              <div className="strip-item">
                <div className="strip-val" style={{ color: '#10b981' }}>${fin.mrr?.current?.toLocaleString() || '0'}</div>
                <div className="strip-lbl">Monthly Recurring Revenue</div>
                <div className="strip-sub">{fin.clients?.filter(c => c.status === 'active').length || 0} active client{(fin.clients?.filter(c => c.status === 'active').length || 0) !== 1 ? 's' : ''}</div>
              </div>
              <div className="strip-item">
                <div className="strip-val" style={{ color: '#ef4444' }}>−${fin.expenses?.totalMonthly?.toLocaleString() || '0'}</div>
                <div className="strip-lbl">Monthly Expenses</div>
                <div className="strip-sub">{fin.expenses?.recurring?.length || 0} recurring costs</div>
              </div>
              <div className="strip-item">
                <div className="strip-val" style={{ color: (fin.pl?.monthlyProfit || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                  {(fin.pl?.monthlyProfit || 0) >= 0 ? '+' : ''}${fin.pl?.monthlyProfit?.toLocaleString() || '0'}
                </div>
                <div className="strip-lbl">Monthly Profit</div>
                <div className="strip-sub">{fin.pl?.margin?.toFixed(1) || '0'}% margin</div>
              </div>
              <div className="strip-item">
                <div className="strip-val" style={{ color: '#3b82f6' }}>${fin.mrr?.target?.toLocaleString() || '2,000'}</div>
                <div className="strip-lbl">MRR Target</div>
                <div className="strip-sub">12-month goal (Feb 2027)</div>
              </div>
            </div>

            <div className="grid">
              {/* ── MRR Progress ── */}
              <div className="panel">
                <div className="sec-t">MRR Progress → ${fin.mrr?.target?.toLocaleString()}/mo</div>
                <MrrGauge current={fin.mrr?.current || 0} target={fin.mrr?.target || 2000} />
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                    ${fin.mrr?.current?.toLocaleString()}<span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}> / ${fin.mrr?.target?.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                    ${((fin.mrr?.target || 2000) - (fin.mrr?.current || 0)).toLocaleString()} to go · Need {Math.ceil(((fin.mrr?.target || 2000) - (fin.mrr?.current || 0)) / (fin.mrr?.current || 580))} more clients at current avg
                  </div>
                </div>
              </div>

              {/* ── P&L Summary ── */}
              <div className="panel">
                <div className="sec-t">Monthly P&L</div>
                <div className="pl-row">
                  <span style={{ color: '#10b981' }}>💰 Income</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>${fin.pl?.monthlyIncome?.toLocaleString() || '0'}</span>
                </div>
                <div className="pl-row">
                  <span style={{ color: '#ef4444' }}>📉 Expenses</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>−${fin.pl?.monthlyExpenses?.toLocaleString() || '0'}</span>
                </div>
                <div className="pl-row">
                  <span style={{ color: (fin.pl?.monthlyProfit || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(fin.pl?.monthlyProfit || 0) >= 0 ? '📈' : '📉'} Net Profit
                  </span>
                  <span style={{ color: (fin.pl?.monthlyProfit || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(fin.pl?.monthlyProfit || 0) >= 0 ? '+' : ''}${fin.pl?.monthlyProfit?.toLocaleString() || '0'}
                  </span>
                </div>
                <div style={{ marginTop: 16, padding: 10, background: '#0a0a0d', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Profit Margin</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: (fin.pl?.margin || 0) >= 50 ? '#10b981' : (fin.pl?.margin || 0) >= 20 ? '#f59e0b' : '#ef4444' }}>
                    {fin.pl?.margin?.toFixed(1) || '0'}%
                  </div>
                </div>
              </div>

              {/* ── Client List ── */}
              <div className="panel">
                <div className="sec-t">Clients — {fin.clients?.length || 0} total</div>
                {(!fin.clients || fin.clients.length === 0) ? (
                  <div style={{ color: '#333', fontSize: 11, fontStyle: 'italic' }}>No clients yet</div>
                ) : fin.clients.map((c, i) => {
                  const initials = c.name.split(/[\s(]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                  const bgColor = c.status === 'active' ? '#0a2a1a' : c.status === 'overdue' ? '#3b1010' : '#1a1a22'
                  const textColor = c.status === 'active' ? '#10b981' : c.status === 'overdue' ? '#ef4444' : '#666'
                  return (
                    <div className="client-row" key={i}>
                      <div className="client-avatar" style={{ background: bgColor, color: textColor }}>{initials}</div>
                      <div className="client-info">
                        <div className="client-name">{c.name}</div>
                        <div className="client-company">{c.company} · Since {c.startDate}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="client-amount" style={{ color: textColor }}>{c.plan}</div>
                        <span className={`client-status status-${c.status}`}>{c.status.toUpperCase()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Expenses ── */}
              <div className="panel">
                <div className="sec-t">Monthly Expenses — ${fin.expenses?.totalMonthly?.toLocaleString() || '0'}/mo</div>
                {(fin.expenses?.recurring || []).map((e, i) => (
                  <div className="expense-row" key={i}>
                    <span className="expense-cat">{e.category}</span>
                    <span className="expense-name">{e.name}</span>
                    <span className="expense-amount">−${e.amount.toFixed(2)}</span>
                    <span className="expense-note">{e.note || e.frequency}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: 8, background: '#0a0a0d', borderRadius: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#888' }}>Total Monthly</span>
                  <span style={{ color: '#ef4444', fontWeight: 800 }}>−${fin.expenses?.totalMonthly?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* ── Stripe Integration Note ── */}
            {!fin.stripe?.connected && (
              <div className="panel" style={{ borderColor: '#f59e0b33', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>Stripe API — Pending Connection</div>
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{fin.stripe?.note || 'API keys needed from Bitwarden to enable live data pull'}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="footer">💰 CAIRR Finance · Auto-refresh 30s · {fin?.source === 'stripe' ? 'Live Stripe' : 'Manual data'}</div>
      </div>
    </>
  )
}
