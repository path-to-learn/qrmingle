import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Linkedin, 
  Mail, 
  Calendar, 
  Award, 
  Code, 
  FileText,
  Shield
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  const releaseDate = "April 2025";
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">About QrMingle</CardTitle>
          <CardDescription className="text-lg">
            The story behind the application and its development
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="max-w-xl text-center">
              <div className="mb-4 text-sm text-muted-foreground flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-1" /> Initial Release: {releaseDate}
              </div>
              <p className="text-lg mb-4">
                QrMingle is a digital contact card application developed by Prashant Dathwal. The platform enables professionals and individuals to create and share personalized 
                QR code-based contact profiles that work seamlessly across all devices.
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <img 
                  src="/signature.png" 
                  alt="Prashant Dathwal's Signature" 
                  className="h-16 opacity-90"
                  onError={(e) => {
                    // In case the signature image isn't available
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid md:grid-cols-2 gap-8 pt-4">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Code className="h-5 w-5 mr-2 text-primary" /> Development Journey
              </h3>
              <p className="text-muted-foreground mb-3">
                QrMingle was designed and developed by Prashant Dathwal as a solution to the inefficiency
                of traditional business card exchanges. The application was built using:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>React with TypeScript for the frontend</li>
                <li>Node.js and Python backend services</li>
                <li>PostgreSQL database for data persistence</li>
                <li>Modern UI components with Tailwind CSS</li>
                <li>QR code generation with custom styling options</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" /> Intellectual Property
              </h3>
              <p className="text-muted-foreground mb-3">
                QrMingle represents original work with protected intellectual property:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Copyright © 2023-2025 Prashant Dathwal. All rights reserved.</li>
                <li>Patent pending for QR code generation and profile management system</li>
                <li>Registered trademark application for "QrMingle"</li>
                <li>DMCA protected codebase and design assets</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="rounded-lg bg-slate-50 p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" /> Verification & Documentation
            </h3>
            <p className="mb-4">
              The authenticity and ownership of QrMingle can be verified through the following channels:
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 text-slate-500" />
                <div>
                  <strong>Source Code Repository</strong>
                  <p className="text-muted-foreground">Private repository with documented development history dating back to initial commit on January 15, 2023.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-slate-500" />
                <div>
                  <strong>Developer Contact</strong>
                  <p className="text-muted-foreground">For verification purposes, contact Prashant Dathwal at <span className="font-medium">dathwal@qrmingle.com</span></p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2 pb-6">
          <div className="flex flex-col items-center">
            <div className="flex space-x-4 mb-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/prashantdathwal" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://linkedin.com/in/prashantdathwal" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:dathwal@qrmingle.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </a>
              </Button>
            </div>
            <Link href="/">
              <span className="text-sm text-primary hover:underline">Back to Home</span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}