import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  search: string
  priority: string
  category: string
  status: string
  categories: string[]
  isAdmin: boolean
  onSearch: (text: string) => void
  onPriority: (value: string) => void
  onCategory: (value: string) => void
  onStatus: (value: string) => void
}

export function ITTicketFilters({ search, priority, category, status, categories, isAdmin, onSearch, onPriority, onCategory, onStatus }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="space-y-1">
          <Label htmlFor="it-search">Search</Label>
          <Input id="it-search" value={search} placeholder="title, employee, summary" onChange={(e) => onSearch(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={onPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="CRITICAL">Critical</SelectItem><SelectItem value="HIGH">High</SelectItem><SelectItem value="LOW">Low</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={category} onValueChange={onCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Scope</Label><div className="h-10 px-3 rounded-md border text-sm text-slate-600 flex items-center">{isAdmin ? "Admin view: all IT tickets" : "Member view: my tickets only"}</div></div>
      </CardContent>
    </Card>
  )
}
