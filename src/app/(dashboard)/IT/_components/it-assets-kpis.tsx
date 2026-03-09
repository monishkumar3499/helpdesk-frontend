import { Card, CardContent } from "@/components/ui/card"

type Props = { total: number; available: number; assigned: number; thresholdAlerts: number }

export function ITAssetsKpis({ total, available, assigned, thresholdAlerts }: Props) {
  const cards = [
    { label: "Total Assets", value: total, border: "border-l-blue-500", valueColor: "text-slate-800" },
    { label: "Available", value: available, border: "border-l-green-500", valueColor: "text-green-700" },
    { label: "Assigned", value: assigned, border: "border-l-sky-500", valueColor: "text-sky-700" },
    { label: "Threshold Alerts", value: thresholdAlerts, border: "border-l-orange-500", valueColor: "text-orange-700" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border-l-4 ${card.border}`}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
