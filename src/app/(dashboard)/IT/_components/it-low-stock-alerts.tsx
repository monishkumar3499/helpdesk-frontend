import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSET_THRESHOLDS } from "../_lib/it-shared"

type Props = { lowStock: [string, number][] }

export function ITLowStockAlerts({ lowStock }: Props) {
  if (lowStock.length === 0) return null

  return (
    <Card className="border border-orange-200 bg-linear-to-r from-orange-50 to-amber-50 it-hover-card">
      <CardHeader><CardTitle className="text-base text-orange-800">Low Stock Alerts</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {lowStock.map(([type, count]) => (
          <p key={type} className="text-sm text-orange-900 rounded-md border border-orange-200/70 bg-white/50 px-3 py-2 transition-all duration-200 hover:bg-white">
            {type}: available {count}, threshold {ASSET_THRESHOLDS[type as keyof typeof ASSET_THRESHOLDS]}
          </p>
        ))}
      </CardContent>
    </Card>
  )
}
