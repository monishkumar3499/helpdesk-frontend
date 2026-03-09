import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { role: string; alerts: string[] }

export function ITDashboardAdminAlerts({ role, alerts }: Props) {
  if (role !== "ADMIN" || alerts.length === 0) return null

  return (
    <Card className="border border-amber-200 bg-amber-50">
      <CardHeader><CardTitle className="text-base text-amber-800">Admin Action Required</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 8).map((alert) => <p key={alert} className="text-sm text-amber-900">{alert}</p>)}
      </CardContent>
    </Card>
  )
}
