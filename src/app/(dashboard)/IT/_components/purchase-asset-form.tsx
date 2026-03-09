import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">New Asset Purchase</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1"><Label htmlFor="asset-name">Asset Name</Label><Input id="asset-name" placeholder="Dell Latitude 5440" value={props.assetName} onChange={(e) => props.onAssetName(e.target.value)} /></div>
        <div className="space-y-1"><Label>Asset Type</Label><Select value={props.assetType} onValueChange={props.onAssetType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="HARDWARE">Hardware</SelectItem><SelectItem value="SOFTWARE">Software</SelectItem><SelectItem value="NETWORK">Network</SelectItem></SelectContent></Select></div>
        <div className="space-y-1"><Label htmlFor="qty">Quantity</Label><Input id="qty" type="number" min={1} max={50} value={props.quantity} onChange={(e) => props.onQuantity(Number(e.target.value || 1))} /></div>
        <Button className="w-full bg-slate-800 hover:bg-slate-700" disabled={props.loading || !props.assetName.trim() || props.quantity < 1} onClick={props.onSubmit}>{props.loading ? "Processing purchase..." : "Confirm Purchase"}</Button>
        {props.message && <p className="text-sm rounded-md bg-slate-100 px-3 py-2 text-slate-700">{props.message}</p>}
      </CardContent>
    </Card>
  )
}
