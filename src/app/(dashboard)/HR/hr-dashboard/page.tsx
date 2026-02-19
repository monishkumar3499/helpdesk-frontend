import Link from "next/link";

export default function HRDashboard() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>

      {/* SIDEBAR */}
      <div
        style={{
          width: "230px",
          background: "linear-gradient(to left, #2e1b72ff, #150435)",

          color: "white",
          padding: "20px"
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>HR Panel</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/hr-dashboard" style={linkStyle}>Dashboard</Link>
          <Link href="/hr-dashboard/tickets" style={linkStyle}>Manage Tickets</Link>
          <Link href="/hr-dashboard/employees" style={linkStyle}>Employees</Link>
          <Link href="/hr-dashboard/reports" style={linkStyle}>Reports</Link>
          <Link href="/hr-dashboard/settings" style={linkStyle}>Calendar</Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f5f3ff" // LIGHT PURPLE BACKGROUND
        }}
      >
        <h1 style={{ color: "#4c1d95" }}>Dashboard</h1>
        <p>Welcome to HR Dashboard</p>
      </div>

    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "6px",
  background: "transparent"
};
