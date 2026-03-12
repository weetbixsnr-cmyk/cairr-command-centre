# HEARTBEAT.md — Command Centre Agent

## On Every Heartbeat (every 30 min)
1. Read all agent output/ and dev/ directories for new deliverables
2. Check for pending approvals from Adam
3. Update the dashboard

## Dashboard Maintenance
1. Read each agent's latest status (check their dev/reports/ for today's files)
2. Update output/dashboard.md with current state:
   - 🔴 NEEDS ADAM NOW (decisions, approvals)
   - 🟡 IN PROGRESS (what each agent is doing)
   - 🟢 COMPLETED (last 48hrs deliverables)
   - 📊 METRICS (task completion rates)
   - 📅 UPCOMING (next 7 days)
   - ⚠️ ALERTS (failures, blockers, overdue)
3. Flag overdue items (24hrs+)
4. Track approval chain: PENDING → APPROVED → DEPLOYED or REJECTED

## Token Spend Monitoring
- Track approximate token usage per agent
- Alert at 80% of budget thresholds
- BTS: <$52/mo | NBHW: <$30/mo | Property: <$20/mo | CC: <$15/mo

## Send updated dashboard to Ricky-Jnr via sessions_send
