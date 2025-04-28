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
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Designed & Developed by
                <a 
                  href="https://www.linkedin.com/in/prashantd/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 border-b border-blue-400 hover:border-purple-400"
                >
                  Prashant Dathwal
                </a>
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Code className="h-3 w-3 mr-1" /> Patent Pending
              </span>
              <span>DMCA Protected</span>
              <span>v1.2.5</span>
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-2">
              Made with ❤️ in Seattle, WA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
