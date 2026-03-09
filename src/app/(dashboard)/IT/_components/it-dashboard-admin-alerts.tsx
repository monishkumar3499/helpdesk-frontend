import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { role: string; alerts: string[] }

export function ITDashboardAdminAlerts({ role, alerts }: Props) {
  if (role !== "IT_ADMIN" || alerts.length === 0) return null

  return (
    <Card className="border border-amber-200 bg-amber-50 it-hover-card">
      <CardHeader><CardTitle className="text-base text-amber-800">Admin Action Required</CardTitle></CardHeader>
      <CardContent className="it-card-pad space-y-2 pt-0">
        {alerts.slice(0, 8).map((alert) => <p key={alert} className="text-sm text-amber-900">{alert}</p>)}
      </CardContent>
    </Card>
  )
}
