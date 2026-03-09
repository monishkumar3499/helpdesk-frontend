import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { categoryStats: Record<string, number>; totalTickets: number }

export function ITDashboardCategories({ categoryStats, totalTickets }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Issue Categories</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(categoryStats).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-28 text-xs text-slate-500">{key.replace("_", " ")}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full" style={{ width: `${totalTickets > 0 ? (value / totalTickets) * 100 : 0}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-600 w-6 text-right">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
