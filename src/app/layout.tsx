import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TooltipProvider>
            {children}

            {/* Global Toast Notifications */}
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}