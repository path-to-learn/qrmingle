import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const jsonResponse = await res.json();
      console.error("API error response:", jsonResponse);
      const errorMessage = jsonResponse.message || res.statusText;
      throw new Error(`${res.status}: ${errorMessage}`);
    } catch (e) {
      // If we can't parse as JSON, try as text
      try {
        const text = await res.text();
        console.error("API error text:", text);
        throw new Error(`${res.status}: ${text || res.statusText}`);
      } catch (textError) {
        // If all else fails, use status text
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`API Request: ${method} ${url}`, data ? { data } : '');
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    console.log(`API Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      await throwIfResNotOk(res);
    }
    
    // Clone the response so we can log it and still return it
    const clone = res.clone();
    if (url !== '/api/auth/validate') { // Avoid logging validation checks
      clone.json().then(data => {
        console.log(`API Response data:`, data);
      }).catch(() => {
        console.log('Response is not JSON');
      });
    }
    
    return res;
  } catch (error) {
    console.error(`API Request failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
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
