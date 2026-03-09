import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSET_THRESHOLDS } from "../_lib/it-shared"

type Props = { lowStock: [string, number][] }

export function ITLowStockAlerts({ lowStock }: Props) {
  if (lowStock.length === 0) return null

  return (
    <Card className="border border-orange-200 bg-orange-50">
      <CardHeader><CardTitle className="text-base text-orange-800">Low Stock Alerts</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {lowStock.map(([type, count]) => (
          <p key={type} className="text-sm text-orange-900">{type}: available {count}, threshold {ASSET_THRESHOLDS[type as keyof typeof ASSET_THRESHOLDS]}</p>
        ))}
      </CardContent>
    </Card>
  )
}
