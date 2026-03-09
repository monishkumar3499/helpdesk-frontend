import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { ticketCount: number; openCount: number; inProgressCount: number; resolvedCount: number; overdueCount: number; assetAlertCount: number }

export function ITDashboardKpis({ ticketCount, openCount, inProgressCount, resolvedCount, overdueCount, assetAlertCount }: Props) {
  const items = [
    { label: "IT Tickets", value: ticketCount, color: "border-l-blue-500" },
    { label: "Assigned (OPEN)", value: openCount, color: "border-l-sky-500" },
    { label: "Accepted (IN_PROGRESS)", value: inProgressCount, color: "border-l-amber-500" },
    { label: "Resolved", value: resolvedCount, color: "border-l-green-500" },
    { label: "SLA Alerts", value: overdueCount, color: "border-l-red-500" },
    { label: "Asset Alerts", value: assetAlertCount, color: "border-l-orange-500" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label} className={`border-l-4 ${item.color}`}>
          <CardHeader className="pb-1 pt-3 px-4"><CardTitle className="text-xs text-slate-500">{item.label}</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3"><p className="text-3xl font-bold text-slate-800">{item.value}</p></CardContent>
        </Card>
      ))}
    </div>
  )
}
