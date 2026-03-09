import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Boxes, CircleCheckBig, PackageCheck } from "lucide-react"

type Props = { total: number; available: number; assigned: number; thresholdAlerts: number }

export function ITAssetsKpis({ total, available, assigned, thresholdAlerts }: Props) {
  const cards = [
    { label: "Total Assets", value: total, border: "border-l-blue-500", valueColor: "text-slate-800", icon: Boxes, iconColor: "text-blue-500" },
    { label: "Available", value: available, border: "border-l-green-500", valueColor: "text-green-700", icon: CircleCheckBig, iconColor: "text-green-500" },
    { label: "Assigned", value: assigned, border: "border-l-sky-500", valueColor: "text-sky-700", icon: PackageCheck, iconColor: "text-sky-500" },
    { label: "Threshold Alerts", value: thresholdAlerts, border: "border-l-orange-500", valueColor: "text-orange-700", icon: AlertTriangle, iconColor: "text-orange-500" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border-l-4 ${card.border} it-hover-card`}>
          <CardContent className="it-card-pad-sm">
            <div className="flex items-center justify-between">
              <p className="it-kpi-label">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <p className={`it-kpi-value ${card.valueColor}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
