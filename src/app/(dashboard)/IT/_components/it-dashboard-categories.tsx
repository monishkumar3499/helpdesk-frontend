import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { categoryStats: Record<string, number>; totalTickets: number }

export function ITDashboardCategories({ categoryStats, totalTickets }: Props) {
  const barColors: Record<string, string> = {
    SOFTWARE: "from-indigo-500 to-blue-500",
    HARDWARE: "from-cyan-500 to-sky-500",
    NETWORK: "from-violet-500 to-fuchsia-500",
    GENERAL: "from-slate-500 to-slate-700",
  }

  return (
    <Card className="it-hover-card">
      <CardHeader><CardTitle className="text-base">Issue Categories</CardTitle></CardHeader>
      <CardContent className="it-card-pad space-y-3 pt-0">
        {Object.entries(categoryStats).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-28 text-xs font-medium text-slate-600">{key.replace("_", " ")}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full bg-linear-to-r ${barColors[key] || "from-slate-500 to-slate-700"} rounded-full transition-all duration-700`} style={{ width: `${totalTickets > 0 ? (value / totalTickets) * 100 : 0}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
