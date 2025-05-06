import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RocketIcon, Sparkles } from 'lucide-react';
import ConfettiSettings from '@/components/confetti/ConfettiSettings';
import { ConfettiOptions, triggerFireworks } from '@/lib/confetti';
import { getConfettiSettings, saveConfettiSettings, triggerUserConfetti } from '@/lib/confetti-utils';

export default function ConfettiSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confettiSettings, setConfettiSettings] = useState<ConfettiOptions>(getConfettiSettings());

  const handleConfettiSettingsChange = (settings: ConfettiOptions) => {
    setConfettiSettings(settings);
    saveConfettiSettings(settings);
  };

  const handleSaveSettings = () => {
    // Here you would typically save the settings to the server
    // For now, we'll just show a success toast
    toast({
      title: 'Celebration Settings Saved',
      description: 'Your custom confetti settings have been saved!',
    });

    // Let's show a celebratory confetti to confirm settings saved
    triggerUserConfetti();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to customize your celebrations</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Celebration Settings</h1>
          <p className="text-lg text-muted-foreground">
            Customize how your profile celebrates important moments
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Personalize Your Celebrations</CardTitle>
              </div>
              <CardDescription>
                Make your QR profile experience uniquely yours with custom celebration effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Celebrations happen when you create new profiles, when contacts are saved, 
                and at other important moments. Choose how you want to celebrate!
              </p>
              
              <ConfettiSettings 
                onChange={handleConfettiSettingsChange}
                initialSettings={confettiSettings}
              />
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveSettings} className="gap-2">
                  <RocketIcon className="h-4 w-4" />
                  Save Celebration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}