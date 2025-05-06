// Custom bootstrapping for React without using Vite's React plugin
import React from 'https://esm.sh/react@18.3.1';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';
import { QueryClient, QueryClientProvider } from 'https://esm.sh/@tanstack/react-query@5.25.0';
import { Router, Switch, Route, Link, useLocation } from 'https://esm.sh/wouter@3.3.5';
import { AlertCircle, User, QrCode, Settings, BarChart2, UserPlus, LogIn, Lock } from 'https://esm.sh/lucide-react@0.331.0';

// Utility functions for API calls
async function throwIfResNotOk(res) {
  if (!res.ok) {
    let errorMessage;
    try {
      const json = await res.json();
      errorMessage = json.message || res.statusText;
    } catch (e) {
      try {
        errorMessage = await res.text();
      } catch (e) {
        errorMessage = res.statusText;
      }
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

async function apiRequest(method, url, data) {
  console.log(`API Request: ${method} ${url}`, data ? { data } : '');
  
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
  
  return res;
}

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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

// Authentication context
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Fetch user data on mount
  React.useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUser();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    try {
      const res = await apiRequest('POST', '/api/login', credentials);
      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const res = await apiRequest('POST', '/api/register', userData);
      const newUser = await res.json();
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };
  
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// RequireAuth wrapper component
function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(59, 130, 246, 0.2)', 
          borderRadius: '50%', 
          borderTop: '3px solid rgba(59, 130, 246, 1)',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  return children;
}

// UI Components
function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <QrCode size={28} color="#3b82f6" />
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginLeft: '0.5rem',
              color: '#1f2937',
              background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              QrMingle
            </span>
          </div>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              <Link href="/profiles" style={{
                color: '#4b5563',
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.2s',
                display: 'inline-block'
              }}>
                My Profiles
              </Link>
              
              <div style={{ position: 'relative' }}>
                <button
                  onClick={toggleMenu}
                  style={{
                    backgroundColor: '#e5e7eb',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <User size={20} color="#4b5563" />
                </button>
                
                {isMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    borderRadius: '0.375rem',
                    width: '200px',
                    zIndex: 50,
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{user.username}</p>
                    </div>
                    <nav style={{ padding: '0.5rem' }}>
                      <Link href="/profiles" style={{
                        display: 'block',
                        padding: '0.5rem',
                        color: '#4b5563',
                        textDecoration: 'none',
                        borderRadius: '0.25rem',
                      }}>
                        My Profiles
                      </Link>
                      <Link href="/analytics" style={{
                        display: 'block',
                        padding: '0.5rem',
                        color: '#4b5563',
                        textDecoration: 'none',
                        borderRadius: '0.25rem',
                      }}>
                        Analytics
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin" style={{
                          display: 'block',
                          padding: '0.5rem',
                          color: '#4b5563',
                          textDecoration: 'none',
                          borderRadius: '0.25rem',
                        }}>
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem',
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                        }}
                      >
                        Log Out
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                color: '#4b5563',
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.2s',
              }}>
                Log In
              </Link>
              <Link href="/register" style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.2s',
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      padding: '2rem 0',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <QrCode size={24} color="#3b82f6" />
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginLeft: '0.5rem',
            background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            QrMingle
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <Link href="/about" style={{ color: '#4b5563', textDecoration: 'none' }}>About</Link>
          <Link href="/privacy" style={{ color: '#4b5563', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#4b5563', textDecoration: 'none' }}>Terms</Link>
          <Link href="/help" style={{ color: '#4b5563', textDecoration: 'none' }}>Help</Link>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
          © {new Date().getFullYear()} QrMingle. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Page Components
function HomePage() {
  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1200px', 
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Connect Instantly with Smart QR Profiles
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#4b5563',
          maxWidth: '800px',
          marginBottom: '2rem'
        }}>
          Create stunning digital contact cards with customizable QR codes. Share your professional information, social media links, and more with a simple scan.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/register" style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            fontWeight: '500',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}>
            Get Started
          </Link>
          <Link href="/about" style={{
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}>
            Learn More
          </Link>
        </div>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{ 
            backgroundColor: '#dbeafe', 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <QrCode size={24} color="#3b82f6" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Customizable QR Codes
          </h3>
          <p style={{ color: '#6b7280' }}>
            Design QR codes that match your personal brand with customizable colors and styles.
          </p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{ 
            backgroundColor: '#dcfce7', 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <User size={24} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Multiple Profiles
          </h3>
          <p style={{ color: '#6b7280' }}>
            Create different profiles for professional, social, and personal use cases.
          </p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{ 
            backgroundColor: '#fee2e2', 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <BarChart2 size={24} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Scan Analytics
          </h3>
          <p style={{ color: '#6b7280' }}>
            Track how many times your QR code has been scanned and from which locations.
          </p>
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
          This version uses ESM imports directly from CDN as a temporary solution while we fix React rendering issues with Vite.
          The core functionality is available, but some advanced features may be limited.
        </p>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = React.useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login(formData);
      navigate('/profiles');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)', // Adjust for header/footer
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ padding: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Welcome Back
          </h2>
          
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              padding: '0.75rem', 
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              color: '#b91c1c'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Username
              </label>
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ 
                  fontSize: '0.75rem', 
                  color: '#3b82f6',
                  textDecoration: 'none'
                }}>
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ 
                    width: '1rem', 
                    height: '1rem', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderRadius: '50%', 
                    borderTop: '2px solid white',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>
        
        <div style={{ 
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = React.useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }
    
    try {
      // Omit confirmPassword when sending to the API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/profiles');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)', // Adjust for header/footer
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ padding: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Create Your Account
          </h2>
          
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              padding: '0.75rem', 
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              color: '#b91c1c'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Username
              </label>
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Email
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Password
              </label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Confirm Password
              </label>
              <input 
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ 
                    width: '1rem', 
                    height: '1rem', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderRadius: '50%', 
                    borderTop: '2px solid white',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        </div>
        
        <div style={{ 
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilesPage() {
  const [profiles, setProfiles] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    async function fetchProfiles() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/profiles', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch profiles');
        const data = await res.json();
        setProfiles(data);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfiles();
  }, []);
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '4rem 0' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(59, 130, 246, 0.2)', 
          borderRadius: '50%', 
          borderTop: '3px solid rgba(59, 130, 246, 1)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ 
        padding: '2rem 1rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#fee2e2', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          display: 'inline-block',
          color: '#b91c1c'
        }}>
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      padding: '2rem 1rem', 
      maxWidth: '1200px', 
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>My Profiles</h1>
        <Link href="/profile/new" style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>Create Profile</span>
        </Link>
      </div>
      
      {profiles.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <QrCode size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            No profiles yet
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Create your first QR profile to start sharing your contact info.
          </p>
          <Link href="/profile/new" style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Create My First Profile
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {profiles.map((profile) => (
            <div key={profile.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{
                backgroundColor: profile.primaryColor || '#3b82f6',
                height: '8px'
              }}></div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem'
                }}>
                  {profile.name}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {profile.jobTitle || 'No job title'}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginTop: '1rem'
                }}>
                  <Link href={`/profile/${profile.id}/edit`} style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Settings size={14} />
                    <span>Edit</span>
                  </Link>
                  
                  <Link href={`/p/${profile.slug}`} style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ 
      padding: '4rem 1rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '5rem', 
        fontWeight: 'bold', 
        color: '#d1d5db',
        lineHeight: '1'
      }}>
        404
      </div>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        Page Not Found
      </h1>
      <p style={{ 
        marginBottom: '2rem',
        color: '#6b7280' 
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          fontWeight: '500',
          display: 'inline-block'
        }}
      >
        Go Home
      </Link>
    </div>
  );
}

// Router component
function AppRouter() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#e0f4ff' // Light blue background from index.css
    }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profiles">
            <RequireAuth>
              <ProfilesPage />
            </RequireAuth>
          </Route>
          <Route component={NotFoundPage} />
        </Switch>
      </main>
      <Footer />
      
      {/* Add global styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);