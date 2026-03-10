// lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  // Get the authentication token from local storage (or whatever storage you are using)
  const token = localStorage.getItem('token'); // Adjust based on how you are storing the token

  // Setup fetch options including the token if it's available
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}), // Only add the Authorization header if token exists
    },
    ...options, // Spread any additional options passed in
  });

  // Check if the response is not okay
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  
  // Return the parsed JSON response
  return res.json();
}
