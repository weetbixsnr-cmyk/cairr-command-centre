import Head from 'next/head'
import { useState } from 'react'

export default function CommandCentre() {
  const now = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  
  const [openItems, setOpenItems] = useState({})
  const toggle = (id) => setOpenItems(prev => ({...prev, [id]: !prev[id]}))

  // LIVE DATA - CC agent updates this section
  const needsAdam = []
  
  const alerts = [
    { id: 'bts-baseline', text: 'BTS competitor baseline not established', agent: 'BTS', note: 'First run Mon 3 Mar' },
    { id: 'nbhw-friday', text: 'NBHW Friday summary overdue since 21 Feb', agent: 'NBHW', note: 'Next cycle Mon 3 Mar' },
  ]

  const inProgress = []

  const fleet = [
    { agent: 'BTS', model: 'Sonnet', heartbeat: ':00', crons: 4, status: 'Briefed, awaiting Mon' },
    { agent: 'NBHW', model: 'Sonnet', heartbeat: ':05', crons: 2, status: 'Briefed, awaiting Mon' },
    { agent: 'V3DN', model: 'Opus', heartbeat: ':10', crons: 0, status: 'Wallet addresses loaded' },
    { agent: 'Property', model: 'Sonnet', heartbeat: ':15', crons: 0, status: 'Scan data synced' },
    { agent: 'CC', model: 'Sonnet', heartbeat: ':00/:30', crons: 0, status: 'Dashboard live' },
    { agent: 'GridPilot', model: 'Sonnet', heartbeat: ':25', crons: 1, status: 'Research active' },
    { agent: 'Alpha', model: 'Sonnet', heartbeat: ':30', crons: 0, status: 'Awaiting Stripe' },
  ]

  const upcoming = [
    { date: 'Mon 3 Mar', task: 'Competitor report + Blog 1-2', agent: 'BTS' },
    { date: 'Mon 3 Mar', task: 'SEO ranking monitor', agent: 'NBHW' },
    { date: 'Wed 5 Mar', task: 'Site health check', agent: 'NBHW' },
    { date: 'Thu 6 Mar', task: 'Blog 3-4', agent: 'BTS' },
    { date: 'Sun 9 Mar', task: 'Governance file sync', agent: 'Brain' },
  ]

  const sectionStyle = {
    marginBottom: '16px',
    borderRadius: '12px',
    overflow: 'hidden',
  }

  const headerStyle = (color) => ({
    padding: '12px 16px',
    background: color,
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  })

  const bodyStyle = {
    padding: '12px 16px',
    background: '#1a1a2e',
  }

  const itemStyle = {
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: '14px',
    color: '#e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const tagStyle = (color) => ({
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    background: color,
    color: '#fff',
    fontWeight: '600',
  })

  const emptyStyle = {
    padding: '16px',
    color: '#666',
    fontSize: '13px',
    textAlign: 'center',
    fontStyle: 'italic',
  }

  return (
    <>
      <Head>
        <title>Command Centre</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{
        minHeight: '100vh',
        background: '#0d0d1a',
        color: '#e0e0e0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        padding: '16px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Command Centre</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{now}</div>
        </div>

        {/* NEEDS ADAM */}
        <div style={sectionStyle}>
          <div style={headerStyle('#dc2626')}>🔴 Needs Adam</div>
          {needsAdam.length === 0 ? (
            <div style={{...bodyStyle, ...emptyStyle}}>Nothing pending</div>
          ) : (
            <div style={bodyStyle}>
              {needsAdam.map(item => (
                <div key={item.id} style={itemStyle}>
                  <span>{item.text}</span>
                  <span style={tagStyle('#dc2626')}>{item.agent}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ALERTS */}
        <div style={sectionStyle}>
          <div style={headerStyle('#d97706')}>⚠️ Alerts</div>
          {alerts.length === 0 ? (
            <div style={{...bodyStyle, ...emptyStyle}}>All clear</div>
          ) : (
            <div style={bodyStyle}>
              {alerts.map(item => (
                <div key={item.id} style={itemStyle}>
                  <div>
                    <div>{item.text}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{item.note}</div>
                  </div>
                  <span style={tagStyle('#d97706')}>{item.agent}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* IN PROGRESS */}
        <div style={sectionStyle}>
          <div style={headerStyle('#2563eb')}>🔵 In Progress</div>
          {inProgress.length === 0 ? (
            <div style={{...bodyStyle, ...emptyStyle}}>Nothing active</div>
          ) : (
            <div style={bodyStyle}>
              {inProgress.map(item => (
                <div key={item.id} style={itemStyle}>
                  <span>{item.text}</span>
                  <span style={tagStyle('#2563eb')}>{item.agent}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FLEET STATUS */}
        <div style={sectionStyle}>
          <div style={headerStyle('#059669')}>🟢 Fleet</div>
          <div style={bodyStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0', fontSize: '13px' }}>
              <div style={{ color: '#666', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Agent</div>
              <div style={{ color: '#666', padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Crons</div>
              <div style={{ color: '#666', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Status</div>
              {fleet.map(a => (
                <>
                  <div key={a.agent+'n'} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff', fontWeight: '500' }}>{a.agent}</div>
                  <div key={a.agent+'c'} style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', color: '#888' }}>{a.crons}</div>
                  <div key={a.agent+'s'} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', color: '#888', fontSize: '12px' }}>{a.status}</div>
                </>
              ))}
            </div>
          </div>
        </div>

        {/* UPCOMING */}
        <div style={sectionStyle}>
          <div style={headerStyle('#6b7280')}>📅 Upcoming</div>
          <div style={bodyStyle}>
            {upcoming.map((item, i) => (
              <div key={i} style={itemStyle}>
                <div>
                  <span style={{ color: '#888', fontSize: '12px', marginRight: '8px' }}>{item.date}</span>
                  <span>{item.task}</span>
                </div>
                <span style={tagStyle('#374151')}>{item.agent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '11px', color: '#444' }}>
          CAIRR Command Centre · Ricky-Jnr
        </div>
      </div>
    </>
  )
}
