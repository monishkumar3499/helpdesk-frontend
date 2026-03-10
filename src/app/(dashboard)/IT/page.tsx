"use client"

import { ITDashboardAdminAlerts } from "./_components/it-dashboard-admin-alerts"
import { ITDashboardCategories } from "./_components/it-dashboard-categories"
import { ITDashboardKpis } from "./_components/it-dashboard-kpis"
import { ITDashboardMemberLoad } from "./_components/it-dashboard-member-load"
import { useITDashboard } from "./_lib/use-it-dashboard"
import { ShieldCheck, Sparkles } from "lucide-react"

export default function ITDashboardPage() {
  const state = useITDashboard()

  if (state.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(9)].map((_, index) => <div key={index} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="it-page-stack">
      <ITDashboardKpis
        ticketCount={state.tickets.length}
        openCount={state.tickets.filter((t) => t.status === "OPEN").length}
        inProgressCount={state.tickets.filter((t) => t.status === "IN_PROGRESS").length}
        resolvedCount={state.tickets.filter((t) => t.status === "RESOLVED").length}
        overdueCount={state.overdueTickets.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ITDashboardCategories categoryStats={state.categoryStats} totalTickets={state.tickets.length} />
        <ITDashboardMemberLoad memberLoads={state.memberLoads} />
      </div>

      <ITDashboardAdminAlerts role={state.role} alerts={state.adminAlerts} />
    </div>
  )
}
