import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CircleCheckBig, Layers, PackagePlus, ShieldAlert, Ticket, Timer, Wrench } from "lucide-react"

type Props = {
  ticketCount: number
  openCount: number
  inProgressCount: number
  resolvedCount: number
  overdueCount: number
}

export function ITDashboardKpis({
  ticketCount,
  openCount,
  inProgressCount,
  resolvedCount,
  overdueCount,
}: Props) {
  const items = [
    { label: "Total Tickets", value: ticketCount, color: "border-l-blue-500", icon: Ticket, iconColor: "text-blue-500" },
    { label: "Open", value: openCount, color: "border-l-sky-500", icon: Layers, iconColor: "text-sky-500" },
    { label: "In Progress", value: inProgressCount, color: "border-l-amber-500", icon: Timer, iconColor: "text-amber-500" },
    { label: "Resolved", value: resolvedCount, color: "border-l-green-500", icon: CircleCheckBig, iconColor: "text-green-500" },
    { label: "Overdue (SLA)", value: overdueCount, color: "border-l-red-500", icon: ShieldAlert, iconColor: "text-red-500" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((item) => (
        <Card key={item.label} className={`border-l-4 ${item.color} it-hover-card overflow-hidden`}>
          <CardHeader className="pb-0.5 pt-2.5 px-3">
            <CardTitle className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between gap-1">
              <span className="truncate">{item.label}</span>
              <item.icon className={`h-3 w-3 shrink-0 ${item.iconColor}`} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2.5 pt-0">
            <p className="text-xl font-bold text-slate-800 leading-none">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
