import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CircleCheckBig, Layers, PackagePlus, ShieldAlert, Ticket, Timer, Wrench } from "lucide-react"

type Props = {
  ticketCount: number
  openCount: number
  inProgressCount: number
  resolvedCount: number
  overdueCount: number
  assetAlertCount: number
  generalCount: number
  assetRequestCount: number
  assetProblemCount: number
}

export function ITDashboardKpis({
  ticketCount,
  openCount,
  inProgressCount,
  resolvedCount,
  overdueCount,
  assetAlertCount,
  generalCount,
  assetRequestCount,
  assetProblemCount,
}: Props) {
  const items = [
    { label: "IT Tickets", value: ticketCount, color: "border-l-blue-500", icon: Ticket, iconColor: "text-blue-500" },
    { label: "Assigned (OPEN)", value: openCount, color: "border-l-sky-500", icon: Layers, iconColor: "text-sky-500" },
    { label: "Accepted (IN_PROGRESS)", value: inProgressCount, color: "border-l-amber-500", icon: Timer, iconColor: "text-amber-500" },
    { label: "Resolved", value: resolvedCount, color: "border-l-green-500", icon: CircleCheckBig, iconColor: "text-green-500" },
    { label: "General", value: generalCount, color: "border-l-slate-500", icon: Ticket, iconColor: "text-slate-500" },
    { label: "Asset Request", value: assetRequestCount, color: "border-l-emerald-500", icon: PackagePlus, iconColor: "text-emerald-500" },
    { label: "Asset Problem", value: assetProblemCount, color: "border-l-amber-600", icon: Wrench, iconColor: "text-amber-600" },
    { label: "SLA Alerts", value: overdueCount, color: "border-l-red-500", icon: ShieldAlert, iconColor: "text-red-500" },
    { label: "Asset Alerts", value: assetAlertCount, color: "border-l-orange-500", icon: AlertTriangle, iconColor: "text-orange-500" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label} className={`border-l-4 ${item.color} it-hover-card`}>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="it-kpi-label flex items-center justify-between gap-2">
              {item.label}
              <item.icon className={`h-4 w-4 ${item.iconColor}`} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3"><p className="it-kpi-value text-slate-800">{item.value}</p></CardContent>
        </Card>
      ))}
    </div>
  )
}
