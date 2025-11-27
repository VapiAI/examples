import { VAPI_BASE_URL, VAPI_TOKEN } from "./config.ts";
import type { VapiResponse } from "./types.ts";

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Client for Vapi API
// ─────────────────────────────────────────────────────────────────────────────

export async function vapiRequest<T = VapiResponse>(
  method: "POST" | "PATCH",
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${VAPI_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VAPI_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API ${method} ${endpoint} failed (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function vapiDelete(endpoint: string): Promise<void> {
  const url = `${VAPI_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${VAPI_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API DELETE ${endpoint} failed (${response.status}): ${errorText}`
    );
  }
}

