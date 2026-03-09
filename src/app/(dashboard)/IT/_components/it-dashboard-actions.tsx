import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ITDashboardActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/IT/assigned"><Button className="bg-slate-800 hover:bg-slate-700">View Assigned</Button></Link>
      <Link href="/IT/accepted"><Button variant="outline">View Accepted</Button></Link>
      <Link href="/IT/resolved"><Button variant="outline">View Resolved</Button></Link>
      <Link href="/IT/assets"><Button variant="outline">View Assets</Button></Link>
    </div>
  )
}
