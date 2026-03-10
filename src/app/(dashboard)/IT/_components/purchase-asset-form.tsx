import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Boxes, CircleCheckBig, ShieldAlert, Sparkles } from "lucide-react"

type Props = {
  assetName: string
  assetType: string
  quantity: number
  loading: boolean
  message: string
  onAssetName: (value: string) => void
  onAssetType: (value: string) => void
  onQuantity: (value: number) => void
  onSubmit: () => void
}

export function PurchaseAssetForm(props: Props) {
  const estimatedItems = Math.min(Math.max(props.quantity, 1), 50)

  return (
    <Card className="it-hover-card border-slate-200 shadow-md">
      <CardHeader className="it-card-pad pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-slate-800">New Asset Purchase</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Raise inventory stock for IT operations in one action.</p>
          </div>
          <Badge className="it-pill bg-slate-100 text-slate-700">
            <Boxes className="mr-1 h-3.5 w-3.5" />
            Inventory Intake
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="it-card-pad space-y-5 pt-0">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Asset Type</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{props.assetType}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Quantity</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{estimatedItems} units</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Approval Track</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
              <CircleCheckBig className="h-4 w-4" />
              IT Admin Direct
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="asset-name">Asset Name</Label>
          <Input
            id="asset-name"
            placeholder="Dell Latitude 5440"
            value={props.assetName}
            onChange={(e) => props.onAssetName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Asset Type</Label>
            <Select value={props.assetType} onValueChange={props.onAssetType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HARDWARE">Hardware</SelectItem>
                <SelectItem value="SOFTWARE">Software</SelectItem>
                <SelectItem value="NETWORK">Network</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="qty">Quantity</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              max={50}
              value={props.quantity}
              onChange={(e) => props.onQuantity(Number(e.target.value || 1))}
            />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Bulk purchases above 25 units should be validated with procurement policy before confirmation.</p>
          </div>
        </div>

        <Button
          className="h-11 w-full bg-slate-800 hover:bg-slate-700"
          disabled={props.loading || !props.assetName.trim() || props.quantity < 1}
          onClick={props.onSubmit}
        >
          {props.loading ? "Processing purchase..." : "Confirm Purchase"}
        </Button>

        {props.message && (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <Sparkles className="mr-1 inline h-4 w-4 text-sky-600" />
            {props.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
