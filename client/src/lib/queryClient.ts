import { QueryClient, QueryFunction } from "@tanstack/react-query";

// When the app is bundled into Capacitor (no live-reload server.url),
// the page origin is capacitor://localhost — relative fetch calls won't reach
// the backend, so we prefix them with the production API base.
const isCapacitorBundled =
  typeof window !== "undefined" &&
  window.location.protocol === "capacitor:";

const API_BASE = isCapacitorBundled ? "https://www.qrmingle.com" : "";

const CAPACITOR_SESSION_KEY = "capacitor-session-id";

export function saveCapacitorSessionId(id: string) {
  localStorage.setItem(CAPACITOR_SESSION_KEY, id);
}

export function clearCapacitorSessionId() {
  localStorage.removeItem(CAPACITOR_SESSION_KEY);
}

export function capacitorHeaders(base?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...base };
  if (isCapacitorBundled) {
    const sid = localStorage.getItem(CAPACITOR_SESSION_KEY);
    if (sid) headers["X-Session-Id"] = sid;
  }
  return headers;
}

export { API_BASE };

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        message = json.message || text || res.statusText;
      } catch {
        message = text || res.statusText;
      }
    } catch {}
    throw new Error(`${res.status}: ${message}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(API_BASE + url, {
    method,
    headers: capacitorHeaders(data ? { "Content-Type": "application/json" } : {}),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;

    const res = await fetch(API_BASE + url, {
      headers: capacitorHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
