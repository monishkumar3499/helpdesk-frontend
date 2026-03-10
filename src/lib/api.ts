
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('token'); 

  
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}), 
    },
    ...options, 
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  
 
  return res.json();
}
