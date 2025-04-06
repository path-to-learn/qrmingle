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

// Define the Python API backend URL
// When using the Node.js server instead of Python, comment out the line below
// const PYTHON_API_URL = 'http://localhost:5001';
// Use the current server URL for API requests
const PYTHON_API_URL = '';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Redirect API requests to Python backend
  const apiUrl = url.startsWith('/api') ? `${PYTHON_API_URL}${url}` : url;
  
  console.log(`API Request: ${method} ${apiUrl}`, data ? { data } : '');
  
  try {
    const res = await fetch(apiUrl, {
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
    console.error(`API Request failed: ${method} ${apiUrl}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the URL from the query key
    let url = queryKey[0] as string;
    
    // Redirect API requests to Python backend
    if (url.startsWith('/api')) {
      url = `${PYTHON_API_URL}${url}`;
    }
    
    const res = await fetch(url, {
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
