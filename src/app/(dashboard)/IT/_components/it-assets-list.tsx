import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type ITAsset } from "../_lib/it-shared"

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  RETIRED: "bg-slate-100 text-slate-700",
}

type Props = { assets: ITAsset[] }

export function ITAssetsList({ assets }: Props) {
  if (assets.length === 0) {
    return <Card><CardContent className="py-8 text-center text-slate-500">No assets found.</CardContent></Card>
  }

  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <Card key={asset.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{asset.assetName}</p>
                <p className="text-xs text-slate-500">Serial: {asset.serialNumber}</p>
                <p className="text-xs text-slate-500">Assigned to: {asset.assignedTo?.name || "Not assigned"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{asset.assetType}</Badge>
                <Badge className={STATUS_COLORS[asset.assetStatus] || "bg-slate-100 text-slate-700"}>{asset.assetStatus}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
