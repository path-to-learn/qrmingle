import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-2xl">Privacy Policy</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Introduction</h2>
          <p className="text-muted-foreground">
            QrMingle respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform to create and manage QR codes for contact sharing.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Information We Collect</h2>
          <p className="text-muted-foreground mb-2">
            We collect information you provide directly to us when you:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Create an account and profile</li>
            <li>Upload photos and contact information</li>
            <li>Add social media links</li>
            <li>Use our QR code customization features</li>
            <li>Interact with our platform</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">How We Use Your Information</h2>
          <p className="text-muted-foreground mb-2">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience</li>
            <li>Generate and customize your QR codes</li>
            <li>Provide analytics for QR code scans</li>
            <li>Process transactions and manage your account</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Security</h2>
          <p className="text-muted-foreground">
            We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at support@qrmingle.com.
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground pt-4 border-t">
          <p>Last updated: April 2025</p>
        </div>
      </CardContent>
    </Card>
  );
}