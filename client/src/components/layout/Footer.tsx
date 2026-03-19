import { Link } from "wouter";
import { ExternalLink, Code } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const creationDate = "© 2023-2025";

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">
            {creationDate} QrMingle. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/about">
              <div className="text-muted-foreground hover:text-primary text-sm cursor-pointer">
                About
              </div>
            </Link>
            <Link href="/reviews">
              <div className="text-muted-foreground hover:text-primary text-sm cursor-pointer">
                Reviews
              </div>
            </Link>
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
        </div>
        
        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center text-xs text-gray-400 mt-2">
              Made with ❤️ in Sunnyvale, CA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
