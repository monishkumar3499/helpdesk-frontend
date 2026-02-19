import Navbar from "@/components/Navbar";

export default function HRDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Top Navbar */}
      <Navbar />
      {/* Content */}
      <div style={{ flex: 1 }}>
        {children}
      </div>

    </div>
  );
}
