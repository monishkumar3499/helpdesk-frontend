import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const slaData = [
  { issue: "Employee Onboarding", time: "24 hrs", status: "On Track" },
  { issue: "Payroll Issue", time: "48 hrs", status: "Breached" },
  { issue: "Leave Approval", time: "12 hrs", status: "On Track" },
]

export default function SLA() {
  return (
    <div className="space-y-4">
        {/* <h2 className="text-3xl font-bold
               bg-gradient-to-r from-blue-600 to-purple-600
               bg-clip-text text-transparent">
  HR Service Level Agreements
</h2> */}
      <h2 className="text-3xl font-bold text-black-800 bg-gradient-to-r from-blue-600 to-red-400 bg-clip-text text-transparent">HR Service Level Agreements</h2>

      {slaData.map((sla, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{sla.issue}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <span>Resolution Time: {sla.time}</span>
            <span
              className={
                sla.status === "Breached"
                  ? "text-red-600 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              {sla.status}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
