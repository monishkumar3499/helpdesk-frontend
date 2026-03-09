"use client"

import { ITDashboardActions } from "./_components/it-dashboard-actions"
import { ITDashboardAdminAlerts } from "./_components/it-dashboard-admin-alerts"
import { ITDashboardAlerts } from "./_components/it-dashboard-alerts"
import { ITDashboardCategories } from "./_components/it-dashboard-categories"
import { ITDashboardKpis } from "./_components/it-dashboard-kpis"
import { ITDashboardMemberLoad } from "./_components/it-dashboard-member-load"
import { useITDashboard } from "./_lib/use-it-dashboard"

export default function ITDashboardPage() {
  const state = useITDashboard()

  if (state.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => <div key={index} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">IT Operations Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time view of tickets, load-balancing flow, SLA, and asset health{state.usingMock && <span className="ml-2 text-orange-500">(Backend unavailable)</span>}</p>
      </div>

      <ITDashboardKpis
        ticketCount={state.tickets.length}
        openCount={state.tickets.filter((t) => t.status === "OPEN").length}
        inProgressCount={state.tickets.filter((t) => t.status === "IN_PROGRESS").length}
        resolvedCount={state.tickets.filter((t) => t.status === "RESOLVED").length}
        overdueCount={state.overdueTickets.length}
        assetAlertCount={state.lowStockAlerts.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ITDashboardCategories categoryStats={state.categoryStats} totalTickets={state.tickets.length} />
        <ITDashboardMemberLoad memberLoads={state.memberLoads} />
      </div>

      <ITDashboardAlerts overdueTickets={state.overdueTickets} lowStockAlerts={state.lowStockAlerts} />
      <ITDashboardAdminAlerts role={state.role} alerts={state.adminAlerts} />
      <ITDashboardActions />
    </div>
  )
}
