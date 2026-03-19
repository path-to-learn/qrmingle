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

// Define backend URLs
const PYTHON_API_URL = 'http://localhost:5001';
const NODEJS_API_URL = '';  // Empty string means use the same origin

// Initialize to true, but will be set to false if Python server ping fails
let pythonServerAvailable = true;

// Try to ping the Python server to see if it's available
async function checkPythonServerAvailability() {
  try {
    console.log("Checking Python server availability...");
    const res = await fetch(`${PYTHON_API_URL}/api/ping`, { 
      method: 'GET',
      credentials: 'include',
      // Short timeout to avoid long wait
      signal: AbortSignal.timeout(2000)
    });
    pythonServerAvailable = res.ok;
    console.log(`Python server available: ${pythonServerAvailable}`);
  } catch (error) {
    console.log("Python server check failed:", error);
    pythonServerAvailable = false;
  }
  return pythonServerAvailable;
}

// Check Python server immediately
checkPythonServerAvailability();

// Periodically check Python server availability (every 30 seconds)
setInterval(() => {
  checkPythonServerAvailability();
}, 30000);

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  if (!url.startsWith('/api')) {
    // Not an API request, use as-is
    return fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  }
  
  // Choose the API URL based on Python server availability
  const apiUrl = pythonServerAvailable 
    ? `${PYTHON_API_URL}${url}` 
    : `${NODEJS_API_URL}${url}`;
  
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
      // If we used the Python server and got an error, try the Node.js server as fallback
      if (pythonServerAvailable && apiUrl.startsWith(PYTHON_API_URL)) {
        console.log("Python server request failed, falling back to Node.js server");
        pythonServerAvailable = false;
        
        // Retry with Node.js server
        return apiRequest(method, url, data);
      }
      
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
    
    // If Python server request failed with a network error, try Node.js server
    if (pythonServerAvailable && apiUrl.startsWith(PYTHON_API_URL)) {
      console.log("Python server request failed with network error, falling back to Node.js server");
      pythonServerAvailable = false;
      
      // Retry with Node.js server
      return apiRequest(method, url, data);
    }
    
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
    const originalUrl = queryKey[0] as string;
    
    if (!originalUrl.startsWith('/api')) {
      // Not an API request, use as-is
      const res = await fetch(originalUrl, {
        credentials: "include",
      });
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }
      
      await throwIfResNotOk(res);
      return await res.json();
    }
    
    // Try the Python server first if it's available
    if (pythonServerAvailable) {
      try {
        const pythonUrl = `${PYTHON_API_URL}${originalUrl}`;
        console.log(`Query trying Python server: ${pythonUrl}`);
        
        const res = await fetch(pythonUrl, {
          credentials: "include",
          // Short timeout to avoid long wait
          signal: AbortSignal.timeout(3000)
        });
        
        if (res.ok) {
          return await res.json();
        }
        
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }
        
        // If Python server failed, mark it as unavailable and try Node.js server
        console.log("Python server query failed, falling back to Node.js server");
        pythonServerAvailable = false;
      } catch (error) {
        console.log("Python server query error:", error);
        pythonServerAvailable = false;
      }
    }
    
    // Fall back to Node.js server
    const nodejsUrl = `${NODEJS_API_URL}${originalUrl}`;
    console.log(`Query using Node.js server: ${nodejsUrl}`);
    
    const res = await fetch(nodejsUrl, {
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
