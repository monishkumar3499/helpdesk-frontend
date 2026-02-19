import Link from "next/link"

export default function HomePage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Helpdesk Frontend
      </h1>

      <Link
        href="/employee"
        className="text-blue-600 underline"
      >
        Go to Employee Dashboard
      </Link>
      <Link href = "/HR/hr-dashboard"> Go to Hr Dashboard</Link>
    </div>
  )
}