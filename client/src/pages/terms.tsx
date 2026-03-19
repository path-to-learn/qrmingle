import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-2xl">Terms of Service</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h2 className="text-xl font-medium mb-2">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By using QrMingle, you agree to these Terms of Service. If you do not agree to these Terms, please do not use our service.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Description of Service</h2>
          <p className="text-muted-foreground">
            QrMingle provides users with the ability to create digital contact cards with customizable QR codes that can be shared with others. We offer both free and premium features as described on our website.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Account Registration</h2>
          <p className="text-muted-foreground">
            To use QrMingle, you must create an account. You agree to provide accurate information during registration and to keep your account credentials secure. You are responsible for all activities that occur under your account.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">User Content</h2>
          <p className="text-muted-foreground">
            You retain ownership of any content you upload to QrMingle. However, by using our service, you grant us a license to use, store, and display your content to provide our service to you. You are responsible for ensuring that your content does not violate any third-party rights.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Prohibited Conduct</h2>
          <p className="text-muted-foreground mb-2">
            You agree not to use QrMingle for any unlawful or prohibited purpose, including but not limited to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Infringing on the intellectual property rights of others</li>
            <li>Violating any laws or regulations</li>
            <li>Engaging in any activity that disrupts or interferes with our services</li>
            <li>Creating misleading or fraudulent QR codes</li>
            <li>Accessing or attempting to access other users' accounts</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Premium Features and Payments</h2>
          <p className="text-muted-foreground">
            QrMingle offers premium features for an additional fee. All payment terms are specified on our website. Subscription fees are non-refundable except as required by law. You can cancel your premium subscription at any time, but you will not receive a refund for the current billing period.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms at any time. We will notify you of any significant changes. Your continued use of QrMingle after such modifications constitutes your acceptance of the updated Terms.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-medium mb-2">Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms, please contact us at support@qrmingle.com.
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground pt-4 border-t">
          <p>Last updated: April 2025</p>
        </div>
      </CardContent>
    </Card>
  );
}