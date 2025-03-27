import { Link } from "wouter";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">
            &copy; {currentYear} ContactQrConnect. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex space-x-6">
              <Link href="/privacy">
                <div className="text-muted-foreground hover:text-primary text-sm cursor-pointer">
                  Privacy Policy
                </div>
              </Link>
              <Link href="/terms">
                <div className="text-muted-foreground hover:text-primary text-sm cursor-pointer">
                  Terms of Service
                </div>
              </Link>
              <Link href="/help">
                <div className="text-muted-foreground hover:text-primary text-sm cursor-pointer">
                  Help Center
                </div>
              </Link>
            </div>
            {!user && (
              <div className="flex space-x-3 mt-3 md:mt-0">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
