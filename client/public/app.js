// Custom bootstrapping for React without using Vite's React plugin
import React from 'https://esm.sh/react@18.3.1';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';
import { QueryClient, QueryClientProvider } from 'https://esm.sh/@tanstack/react-query@5.25.0';
import { Router, Switch, Route } from 'https://esm.sh/wouter@3.3.5';

// Create a simple app component
const queryClient = new QueryClient();

function HomePage() {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1000px', 
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: '#3b82f6' 
      }}>QrMingle</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Welcome to QrMingle</h2>
        <p style={{ marginBottom: '16px' }}>
          Create and share digital contact cards with custom QR codes.
        </p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <a 
            href="/direct" 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            View Simple Version
          </a>
          
          <a 
            href="https://qrmingle.app" 
            style={{
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              padding: '10px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Go to Production Site
          </a>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        backgroundColor: '#f0f9ff', 
        padding: '20px', 
        borderRadius: '8px',
        borderLeft: '4px solid #3b82f6'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Development Status</h3>
        <p>
          We're currently working on fixing React rendering issues with Vite. 
          This page uses ESM imports directly from a CDN as a temporary solution.
        </p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '600px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Page Not Found</h1>
      <p style={{ marginBottom: '20px' }}>The page you're looking for doesn't exist.</p>
      <a 
        href="/" 
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        Go Home
      </a>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);