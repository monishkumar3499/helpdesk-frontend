import { apiFetch } from "@/lib/api"
import { getMemberLoad, normalizeTicket, type ITTicket, type ITUser } from "./it-shared"
import { addAdminAlert, getRejectionMap, saveRejectionMap } from "./use-it-ticket-board"

export async function refreshTickets(setTickets: (tickets: ITTicket[]) => void) {
  try {
    const fresh = await apiFetch("/tickets?department=IT")
    setTickets(fresh.map(normalizeTicket))
  } catch {
    setTickets([])
  }
}

export async function acceptTicket(ticket: ITTicket, setTickets: (tickets: ITTicket[]) => void, setBanner: (text: string) => void) {
  try {
    await apiFetch(`/tickets/${ticket.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "IN_PROGRESS" }) })
    await refreshTickets(setTickets)
    setBanner(`Ticket ${ticket.id} moved to IN_PROGRESS.`)
  } catch {
    setBanner("Could not update ticket status right now.")
  }
}

export async function rejectTicket(
  ticket: ITTicket,
  currentUserId: string | null,
  team: ITUser[],
  tickets: ITTicket[],
  setTickets: (tickets: ITTicket[]) => void,
  setBanner: (text: string) => void,
) {
  if (!currentUserId) return
  const map = getRejectionMap()
  const nextRejected = Array.from(new Set([...(map[ticket.id] || []), currentUserId]))
  map[ticket.id] = nextRejected
  saveRejectionMap(map)

  const eligible = team.filter((member) => !nextRejected.includes(member.id))
  if (eligible.length === 0) {
    const msg = `Ticket ${ticket.id} rejected by all IT members and needs manual assignment.`
    addAdminAlert(msg)
    setBanner(msg)
    return
  }

  const nextAssignee = eligible.map((member) => ({ member, load: getMemberLoad(tickets, member.id) })).sort((a, b) => a.load - b.load)[0]?.member
  if (!nextAssignee) return

  try {
    await apiFetch(`/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify({ assignedToId: nextAssignee.id, status: "OPEN" }) })
    await refreshTickets(setTickets)
    setBanner(`Ticket ${ticket.id} reassigned to ${nextAssignee.name}.`)
  } catch {
    setBanner("Could not reassign ticket right now.")
  }
}

export async function manuallyAssign(
  ticket: ITTicket,
  selectedId: string | undefined,
  setTickets: (tickets: ITTicket[]) => void,
  setBanner: (text: string) => void,
) {
  if (!selectedId) return
  try {
    await apiFetch(`/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify({ assignedToId: selectedId, status: "OPEN" }) })
    const map = getRejectionMap()
    delete map[ticket.id]
    saveRejectionMap(map)
    await refreshTickets(setTickets)
    setBanner(`Ticket ${ticket.id} assigned successfully.`)
  } catch {
    setBanner("Manual assignment failed.")
  }
}
