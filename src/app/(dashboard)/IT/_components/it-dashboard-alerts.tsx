import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSET_THRESHOLDS, type ITTicket } from "../_lib/it-shared"

type Props = { overdueTickets: ITTicket[]; lowStockAlerts: [string, number][] }

export function ITDashboardAlerts({ overdueTickets, lowStockAlerts }: Props) {
  const fallbackBreachAlerts = [
    { title: "Core switch latency spike", priority: "CRITICAL", assigned: "Ravi IT" },
    { title: "ERP login timeout complaints", priority: "HIGH", assigned: "Meena IT" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border border-red-200 it-hover-card">
        <CardHeader><CardTitle className="text-base text-red-700">SLA Breach Alerts</CardTitle></CardHeader>
        <CardContent className="it-card-pad space-y-2 pt-0">
          {overdueTickets.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Showing demo alerts until a real breach occurs.</p>
              {fallbackBreachAlerts.map((ticket) => (
                <div key={ticket.title} className="rounded-lg bg-red-50 border border-dashed border-red-200 px-3 py-2 text-sm transition-all duration-200 hover:shadow-sm">
                  <p className="font-medium text-red-800">{ticket.title}</p>
                  <p className="text-xs text-red-600">{ticket.priority} priority · Assigned to {ticket.assigned}</p>
                </div>
              ))}
            </div>
          )}
          {overdueTickets.slice(0, 6).map((ticket) => (
            <div key={ticket.id} className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm transition-all duration-200 hover:shadow-sm">
              <p className="font-medium text-red-800">{ticket.title}</p>
              <p className="text-xs text-red-600">{ticket.priority} priority · Assigned to {ticket.assignedTo?.name || "Unassigned"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-orange-200 it-hover-card">
        <CardHeader><CardTitle className="text-base text-orange-700">Asset Threshold Alerts</CardTitle></CardHeader>
        <CardContent className="it-card-pad space-y-2 pt-0">
          {lowStockAlerts.length === 0 && <p className="text-sm text-slate-500">All asset types are above threshold.</p>}
          {lowStockAlerts.map(([type, count]) => (
            <div key={type} className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 text-sm transition-all duration-200 hover:shadow-sm">
              <p className="font-medium text-orange-800">{type} low in stock</p>
              <p className="text-xs text-orange-700">Available: {count} · Threshold: {ASSET_THRESHOLDS[type as keyof typeof ASSET_THRESHOLDS]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
