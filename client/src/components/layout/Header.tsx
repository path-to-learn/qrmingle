import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User, BarChart2, Crown, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { user, logoutMutation, isEffectivelyPremium } = useAuth();
  
  // Use useRoute to check if we're on login or register pages
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  
  // Check if we're on any auth page
  const isAuthPage = isLoginPage || isRegisterPage;
  
  // Determine if user is in trial mode (has trial date but not premium)
  const isInTrialMode = user && !user.isPremium && user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date();
  
  // Format trial expiry date for display
  const formatTrialExpiry = () => {
    if (!user?.trialExpiresAt) return '';
    const expiryDate = new Date(user.trialExpiresAt);
    
    // Show days remaining if within a week
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    
    if (diffDays <= 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    }
    
    // Otherwise show date
    return expiryDate.toLocaleDateString();
  };
  
  // Just log when rendered with user state
  console.log("Header render:", { isLoggedIn: !!user, user, isAuthPage, isInTrialMode });

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      {isInTrialMode && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center text-sm py-1">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Premium trial active - {formatTrialExpiry()}</span>
            <Link href="/premium">
              <Button size="sm" variant="outline" className="ml-4 text-white border-white hover:bg-white/20 hover:text-white">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.75 4.5C3.75 3.12 4.87 2 6.25 2h11.5c1.38 0 2.5 1.12 2.5 2.5v15c0 1.38-1.12 2.5-2.5 2.5H6.25C4.87 20 3.75 18.88 3.75 17.5v-15zM6.25 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h11.5c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5H6.25zM7.5 12.25h9M11.75 18a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
              <span className="font-bold text-xl text-primary">QrMingle</span>
            </div>
          </Link>
        </div>
        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 group">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-neutral-dark group-hover:text-primary transition-colors">
                    {user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <div className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profiles</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/analytics">
                    <div className="flex items-center cursor-pointer">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                {!user.isPremium && (
                  <DropdownMenuItem asChild>
                    <Link href="/premium">
                      <div className="flex items-center cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        <span>
                          Upgrade to Premium
                          {isInTrialMode && (
                            <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-700 border-blue-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Trial
                            </Badge>
                          )}
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !isAuthPage && (
              <Link href="/login">
                <Button variant="link" className="text-muted-foreground hover:text-primary">
                  <User className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
