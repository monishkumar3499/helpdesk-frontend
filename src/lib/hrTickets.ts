import { apiFetch } from "./api";

export async function getHrTickets() {
  return apiFetch("/tickets?department=HR");

}
export async function updateTicketStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) {
  return apiFetch(`/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
