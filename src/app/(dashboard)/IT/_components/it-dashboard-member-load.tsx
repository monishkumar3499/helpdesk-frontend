import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Member = { id: string; name: string; email: string; load: number; resolved: number }

type Props = { memberLoads: Member[] }

export function ITDashboardMemberLoad({ memberLoads }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">IT Member Load</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {memberLoads.length === 0 && <p className="text-sm text-slate-500">No IT members found from backend.</p>}
        {memberLoads.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
            <div><p className="text-sm font-semibold text-slate-800">{member.name}</p><p className="text-xs text-slate-500">{member.email}</p></div>
            <div className="text-right"><p className="text-sm text-slate-700">Active: {member.load}</p><p className="text-xs text-green-600">Resolved: {member.resolved}</p></div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
