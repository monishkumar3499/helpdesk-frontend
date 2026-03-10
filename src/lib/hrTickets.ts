import { apiFetch, toArrayResponse } from "./api";
import { getStoredUser } from "./auth";

type HrTicketAssignee = {
  assignedToId?: string | null;
  assignedToEmail?: string | null;
  assignedTo?: {
    id?: string;
    _id?: string;
    email?: string;
  } | null;
};

function normalize(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function isAssignedToCurrentHr(ticket: HrTicketAssignee, userId?: string, userEmail?: string): boolean {
  const ticketAssignedId = ticket.assignedToId || ticket.assignedTo?.id || ticket.assignedTo?._id || "";
  const ticketAssignedEmail = ticket.assignedToEmail || ticket.assignedTo?.email || "";

  const byId = !!userId && ticketAssignedId === userId;
  const byEmail = !!userEmail && normalize(ticketAssignedEmail) === normalize(userEmail);
  return byId || byEmail;
}

export async function getHrTickets() {
  return apiFetch("/tickets?department=HR");
}

export async function getHrTicketsForCurrentUser<T = unknown>(): Promise<T[]> {
  const payload = await apiFetch("/tickets?department=HR");
  const tickets = toArrayResponse<T & HrTicketAssignee>(payload);

  const user = getStoredUser();
  const userId = user?.id;
  const userEmail = user?.email;

  if (!userId && !userEmail) return [];
  return tickets.filter((ticket) => isAssignedToCurrentHr(ticket, userId, userEmail)) as T[];
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
