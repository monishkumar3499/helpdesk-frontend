"use client"

import { ITDashboardAdminAlerts } from "./_components/it-dashboard-admin-alerts"
import { ITDashboardAlerts } from "./_components/it-dashboard-alerts"
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
        {[...Array(6)].map((_, index) => <div key={index} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  const generalCount = state.tickets.filter((ticket) => !ticket.assetIssue).length
  const assetProblemCount = state.tickets.filter((ticket) => !!ticket.assetIssue?.assetId?.trim()).length
  const assetRequestCount = state.tickets.filter((ticket) => !!ticket.assetIssue && !ticket.assetIssue?.assetId?.trim()).length

  return (
    <div className="it-page-stack">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-sky-900 p-6 text-white shadow-lg">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="it-hero-title">IT Operations Dashboard</h2>
            <p className="it-hero-subtitle text-slate-200">
              Real-time view of tickets
              {state.usingMock && <span className="ml-2 text-amber-300">(Backend unavailable)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span className="text-xs">System Health: Stable</span>
            <Sparkles className="h-4 w-4 text-sky-200" />
          </div>
        </div>
      </div>

      <ITDashboardKpis
        ticketCount={state.tickets.length}
        openCount={state.tickets.filter((t) => t.status === "OPEN").length}
        inProgressCount={state.tickets.filter((t) => t.status === "IN_PROGRESS").length}
        resolvedCount={state.tickets.filter((t) => t.status === "RESOLVED").length}
        generalCount={generalCount}
        assetRequestCount={assetRequestCount}
        assetProblemCount={assetProblemCount}
        overdueCount={state.overdueTickets.length}
        assetAlertCount={state.lowStockAlerts.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ITDashboardCategories categoryStats={state.categoryStats} totalTickets={state.tickets.length} />
        <ITDashboardMemberLoad memberLoads={state.memberLoads} />
      </div>

      <ITDashboardAlerts overdueTickets={state.overdueTickets} lowStockAlerts={state.lowStockAlerts} />
      <ITDashboardAdminAlerts role={state.role} alerts={state.adminAlerts} />
    </div>
  )
}
