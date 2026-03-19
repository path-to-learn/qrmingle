import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-2xl">Help Center</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-muted-foreground mb-6">
          Find answers to frequently asked questions about using QrMingle. If you can't find what you're looking for, please contact our support team.
        </p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-medium">
              How do I create my first profile?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              To create your first profile, log in to your account and click on the "Create New Profile" button on the dashboard. Fill in your details such as name, title, bio, and upload a photo if desired. You can also add social media links. Once complete, click "Save" to generate your QR code.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-medium">
              How do I customize my QR code?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              You can customize your QR code by editing your profile and scrolling to the QR code customization section. All users have access to various design options including different styles, colors, and size adjustments to make your QR code stand out.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-medium">
              What features are available in QrMingle?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Currently, all users can create up to 3 profiles with full QR code customization options, detailed analytics, and vCard generation. Premium plans with additional features like unlimited profiles, custom domains, and advanced branding options will be available in the future as our user base grows.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-medium">
              How do I share my QR code with others?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              After creating your profile, you can download your QR code as an image file from your dashboard. You can print it on business cards, add it to your email signature, or display it at events. When someone scans your QR code, they'll be directed to your profile page.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg font-medium">
              How do I view analytics for my profiles?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              To view analytics, navigate to the "Analytics" section in your dashboard. You'll see data on how many times your QR codes have been scanned, geographic locations of scans, devices used, and other engagement metrics.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger className="text-lg font-medium">
              Will premium features be available in the future?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! As our user base grows, we plan to introduce premium plans with advanced features such as unlimited profiles, custom domains, and additional design options. For now, all users can enjoy the full range of QR customization options and analytics at no cost.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger className="text-lg font-medium">
              How can I update my profile information?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              You can update your profile at any time by selecting the profile from your dashboard and clicking "Edit." Make your changes and click "Save" to update. All changes will be reflected immediately in your profile page when someone scans your QR code.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Still need help?</h3>
          <p className="text-muted-foreground">
            Contact our support team at <a href="mailto:support@qrmingle.com" className="text-primary hover:underline">support@qrmingle.com</a> or use the live chat feature in the bottom right corner of the screen during business hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}