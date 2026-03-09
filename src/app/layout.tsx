import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <TooltipProvider>

          {children}

          {/* Global Toast Notifications */}
          <Toaster position="top-right" richColors />

        </TooltipProvider>

      </body>
    </html>
  )
}