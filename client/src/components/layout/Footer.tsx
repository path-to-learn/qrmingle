import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground text-sm mb-4 md:mb-0">
            &copy; {currentYear} ContactQrConnect. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy">
              <a className="text-muted-foreground hover:text-primary text-sm">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-muted-foreground hover:text-primary text-sm">
                Terms of Service
              </a>
            </Link>
            <Link href="/help">
              <a className="text-muted-foreground hover:text-primary text-sm">
                Help Center
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
