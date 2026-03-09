import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <Card key={asset.id} className="it-hover-card border border-slate-200">
          <CardContent className="it-card-pad space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700 truncate">{asset.assetName}</p>
              <Badge className={`it-pill ${STATUS_COLORS[asset.assetStatus] || "bg-slate-100 text-slate-700"}`}>{asset.assetStatus}</Badge>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
                  {asset.assetType.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-800">{asset.assignedTo?.name || "Not assigned"}</p>
                <p className="text-xs text-slate-500">{asset.serialNumber}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="it-pill">{asset.assetType}</Badge>
              <span className="text-xs text-slate-400">{new Date(asset.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
