export default function Navbar() {
  return (
    <div
      style={{
        height: "70px",
        background: "linear-gradient(90deg, #150435, #150435)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {/* LEFT — APP TITLE */}
      <div style={{ fontSize: "18px", fontWeight: "600" }}>
        Logo1
      </div>

      {/* CENTER — OPTIONAL TEXT */}
      <div style={{ opacity: 0.8,
      }}>
        Employee Support & Ticket Monitoring - Human Resource
      </div>

      {/* RIGHT — USER PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        
        {/* SESSION TIME */}
        <div style={{ fontSize: "13px", opacity: 0.9,fontStyle:"italic" }}>
          Session: 10:30 AM Login
        </div>

        {/* USER INFO */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: "600",fontSize:"10px" }}>UserName</div>
          <div style={{ fontSize: "8px", opacity: 0.8 }}>HR Manager</div>
        </div>

        {/* PROFILE CIRCLE */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#150435"
          }}
        >
          A
        </div>

        {/* LOGOUT BUTTON */}
        <button
          style={{
            marginLeft: "10px",
            padding: "2px 10px",
            borderRadius: "6px",
            border: "none",
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "500",
            opacity:0.5,
          }}
        >
          Logout
        </button>

      </div>
    </div>
  );
}
