import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfettiOptions, triggerConfetti } from "@/lib/confetti";
import { Switch } from "@/components/ui/switch";
import { HexColorPicker } from "react-colorful";

export interface ConfettiSettingsProps {
  onChange?: (settings: ConfettiOptions) => void;
  initialSettings?: ConfettiOptions;
}

export default function ConfettiSettings({ onChange, initialSettings }: ConfettiSettingsProps) {
  const defaultSettings: ConfettiOptions = {
    particleCount: 80,
    spread: 70,
    startVelocity: 30,
    gravity: 1,
    style: 'basic',
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    shapes: ['square', 'circle'],
  };
  
  const [settings, setSettings] = useState<ConfettiOptions>(initialSettings || defaultSettings);

  const [customColor, setCustomColor] = useState("#ff0000");
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (key: keyof ConfettiOptions, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onChange?.(newSettings);
  };

  const handleColorAdd = () => {
    const newColors = [...(settings.colors || []), customColor];
    handleChange('colors', newColors);
  };

  const handleColorRemove = (index: number) => {
    const newColors = [...(settings.colors || [])];
    newColors.splice(index, 1);
    handleChange('colors', newColors);
  };

  const previewConfetti = () => {
    triggerConfetti(settings);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Customize Your Celebrations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="style">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="particles">Particles</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label>Effect Style</Label>
                <Select 
                  value={settings.style || 'basic'} 
                  onValueChange={(value) => handleChange('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a confetti style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="fireworks">Fireworks</SelectItem>
                    <SelectItem value="snow">Snow</SelectItem>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="school">School Pride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="particles" className="space-y-4 pt-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Particle Count</Label>
                  <span className="text-sm text-muted-foreground">{settings.particleCount}</span>
                </div>
                <Slider 
                  min={10} 
                  max={200} 
                  step={10}
                  value={[settings.particleCount || 80]} 
                  onValueChange={(value) => handleChange('particleCount', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Spread</Label>
                  <span className="text-sm text-muted-foreground">{settings.spread}°</span>
                </div>
                <Slider 
                  min={0} 
                  max={360} 
                  step={10}
                  value={[settings.spread || 70]} 
                  onValueChange={(value) => handleChange('spread', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Start Velocity</Label>
                  <span className="text-sm text-muted-foreground">{settings.startVelocity}</span>
                </div>
                <Slider 
                  min={5} 
                  max={60} 
                  step={5}
                  value={[settings.startVelocity || 30]} 
                  onValueChange={(value) => handleChange('startVelocity', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Gravity</Label>
                  <span className="text-sm text-muted-foreground">{settings.gravity}</span>
                </div>
                <Slider 
                  min={0.1} 
                  max={2} 
                  step={0.1}
                  value={[settings.gravity || 1]} 
                  onValueChange={(value) => handleChange('gravity', value[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="square-shape"
                  checked={(settings.shapes || []).includes('square')}
                  onCheckedChange={(checked) => {
                    const shapes = [...(settings.shapes || [])];
                    if (checked) {
                      if (!shapes.includes('square')) shapes.push('square');
                    } else {
                      const index = shapes.indexOf('square');
                      if (index !== -1) shapes.splice(index, 1);
                    }
                    handleChange('shapes', shapes);
                  }}
                />
                <Label htmlFor="square-shape">Square Particles</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="circle-shape"
                  checked={(settings.shapes || []).includes('circle')}
                  onCheckedChange={(checked) => {
                    const shapes = [...(settings.shapes || [])];
                    if (checked) {
                      if (!shapes.includes('circle')) shapes.push('circle');
                    } else {
                      const index = shapes.indexOf('circle');
                      if (index !== -1) shapes.splice(index, 1);
                    }
                    handleChange('shapes', shapes);
                  }}
                />
                <Label htmlFor="circle-shape">Circle Particles</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {(settings.colors || []).map((color, index) => (
                  <div 
                    key={index} 
                    className="relative w-12 h-12 rounded-md cursor-pointer overflow-hidden group"
                    style={{ backgroundColor: color }}
                  >
                    <button 
                      className="absolute -right-1 -top-1 bg-white opacity-0 group-hover:opacity-100 rounded-full p-1 transition-opacity"
                      onClick={() => handleColorRemove(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Label>Add a New Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <HexColorPicker 
                      color={customColor} 
                      onChange={setCustomColor} 
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="h-10 rounded-md" style={{ backgroundColor: customColor }}></div>
                    <Button size="sm" onClick={handleColorAdd}>Add Color</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Switch 
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
            <Label htmlFor="preview-mode">Celebration Preview</Label>
          </div>
          
          <Button onClick={previewConfetti}>
            Test Confetti
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}