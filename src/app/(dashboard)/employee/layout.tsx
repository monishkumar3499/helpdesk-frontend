"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main */}
        <main className="flex flex-1 flex-col">
          {/* Header */}
          <header className="h-14 border-b flex items-center px-4">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold">
              Employee helpdesk 
            </h1>
          </header>

          {/* Content */}
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}