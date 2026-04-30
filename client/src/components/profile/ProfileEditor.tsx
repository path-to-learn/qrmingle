import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ProfileFormData, profileFormSchema } from "@shared/schema";
import { X, Plus, Upload, Image, X as XIcon, QrCode as QrCodeIcon, Crop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ImageCropper from "./ImageCropper";

type ProfileEditorProps = {
  profileData?: ProfileFormData & { id?: number };
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isPremium?: boolean;
};

export default function ProfileEditor({
  profileData,
  onSubmit,
  onCancel,
  isEditing = false,
  isPremium = false,
}: ProfileEditorProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string>(
    profileData?.photoUrl || ""
  );
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string>(
    profileData?.backgroundUrl || ""
  );
  const [showCropper, setShowCropper] = useState(false);
  const [imageToProcess, setImageToProcess] = useState<string>("");
  const [tempImageData, setTempImageData] = useState<string>("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profileData?.name || "",
      displayName: profileData?.displayName || "",
      title: profileData?.title || "",
      bio: profileData?.bio || "",
      photoUrl: profileData?.photoUrl || "",
      photoSize: profileData?.photoSize || 120,
      backgroundUrl: profileData?.backgroundUrl || "",
      backgroundOpacity: profileData?.backgroundOpacity || 100,
      cardColor: profileData?.cardColor || "#ffffff",
      qrStyle: profileData?.qrStyle || "basic",
      qrColor: profileData?.qrColor || "#3B82F6",
      qrSize: profileData?.qrSize || 150,
      qrPosition: profileData?.qrPosition || "bottom",
      photoPosition: profileData?.photoPosition || "top",
      layoutStyle: profileData?.layoutStyle || "standard",
      socialLinks: profileData?.socialLinks?.length
        ? profileData.socialLinks
        : [{ platform: "LinkedIn", url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // This would normally upload to a server, but for now we'll just use a data URL
    // In a real app, you'd use a file upload service
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageToProcess(dataUrl);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageData: string) => {
    // Compress image before storing to avoid payload too large errors
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 400;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = (height / width) * maxSize; width = maxSize; }
        else { width = (width / height) * maxSize; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      setPreviewUrl(compressed);
      form.setValue("photoUrl", compressed);
    };
    img.src = croppedImageData;
  };
  
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Similar to photo upload, we'll use a data URL for now
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBackgroundPreviewUrl(dataUrl);
      form.setValue("backgroundUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (data: ProfileFormData) => {
    console.log("Form submission attempt with data:", data);
    
    // Make sure non-premium users can't use premium QR styles
    const premiumStyles = ['bordered', 'gradient', 'rounded', 'shadow'];
    if (!isPremium && premiumStyles.includes(data.qrStyle)) {
      data.qrStyle = 'basic';
      toast({
        title: "Premium feature unavailable",
        description: "Premium QR styles are only available for premium users. Your profile will use the basic style.",
        variant: "destructive",
      });
    }
    
    // Validate that we have at least one social link with valid data
    if (!data.socialLinks || data.socialLinks.length === 0) {
      data.socialLinks = [{ platform: "LinkedIn", url: "https://linkedin.com" }];
    }
    
    // Validate all required fields are present
    if (!data.name || !data.displayName) {
      toast({
        title: "Missing required fields",
        description: "Please fill in your name and display name",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Submitting profile data:", data);
    onSubmit(data);
  };

  // All available social platforms
  const allSocialPlatforms = [
    "LinkedIn",
    "Facebook",
    "Twitter",
    "Instagram",
    "Email",
    "Phone",
    "Website",
    "GitHub",
    "YouTube",
    "TikTok",
    "WhatsApp",
    "Telegram",
  ];
  
  // Get available platforms that haven't been selected yet
  const getAvailablePlatforms = (currentIndex: number) => {
    const socialLinks = form.watch("socialLinks");
    const selectedPlatforms = socialLinks.map(link => link.platform);
    // Include the current platform in available options (so it doesn't disappear from its own dropdown)
    const currentPlatform = form.watch(`socialLinks.${currentIndex}.platform`);

    // Filter out platforms that are already selected (except the current one)
    return allSocialPlatforms.filter(platform => {
      if (platform === currentPlatform) {
        return true; // Always include the current platform
      }
      
      // Check if this platform is already selected in any other row
      const isAlreadySelected = socialLinks.some(
        (link, idx) => idx !== currentIndex && link.platform === platform
      );
      
      return !isAlreadySelected;
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{isEditing ? "Edit Profile" : "Create New Profile"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="mb-6">
                  <FormLabel className="block mb-2">Profile Photo</FormLabel>
                  <div className="flex flex-col items-center">
                    <Avatar 
                      className="mb-3" 
                      style={{ 
                        width: `${form.watch("photoSize")}px`, 
                        height: `${form.watch("photoSize")}px` 
                      }}
                    >
                      {previewUrl ? (
                        <AvatarImage
                          src={previewUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex gap-2 mb-3">
                      <Button
                        type="button"
                        className="flex items-center"
                        onClick={() => document.getElementById("photo-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </Button>
                      {previewUrl && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex items-center"
                            onClick={() => {
                              setImageToProcess(previewUrl);
                              setShowCropper(true);
                            }}
                          >
                            <Crop className="mr-2 h-4 w-4" />
                            Crop
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setPreviewUrl("");
                              form.setValue("photoUrl", "");
                            }}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {previewUrl && (
                      <div className="w-full mt-2">
                        <FormLabel className="text-sm block mb-2">Photo Size (profile view)</FormLabel>
                        <FormField
                          control={form.control}
                          name="photoSize"
                          render={({ field }) => (
                            <div>
                              <input
                                type="range"
                                min={60}
                                max={240}
                                step={10}
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                style={{ width: "100%", marginBottom: "6px" }}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Small</span>
                                <span>{field.value}px</span>
                                <span>Large</span>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <FormLabel className="block mb-2">Card Color</FormLabel>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: form.watch("cardColor") || "#ffffff" }}
                    />
                    <FormField
                      control={form.control}
                      name="cardColor"
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="color"
                          className="w-24 h-10 p-1"
                          placeholder="Select a color"
                        />
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose a background color for your profile card
                  </p>
                </div>

                <div className="mb-6">
                  <FormLabel className="block mb-2">Background Image</FormLabel>
                  <div className="flex flex-col items-center">
                    <div className="relative w-full h-32 mb-3 bg-muted rounded-md overflow-hidden">
                      {backgroundPreviewUrl ? (
                        <img
                          src={backgroundPreviewUrl}
                          alt="Background preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Image className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="flex items-center"
                        onClick={() => document.getElementById("background-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Background
                        <Input
                          id="background-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBackgroundUpload}
                        />
                      </Button>
                      {backgroundPreviewUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBackgroundPreviewUrl("");
                            form.setValue("backgroundUrl", "");
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {backgroundPreviewUrl && (
                      <div className="w-full mt-4">
                        <FormLabel className="text-sm block mb-2">Background Opacity (profile view)</FormLabel>
                        <FormField
                          control={form.control}
                          name="backgroundOpacity"
                          render={({ field }) => (
                            <div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                style={{ width: "100%", marginBottom: "6px" }}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Transparent</span>
                                <span>{field.value}%</span>
                                <span>Solid</span>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="block">QR Code Style</FormLabel>
                    {!isPremium && (
                      <a href="/premium" className="text-xs text-primary hover:underline">
                        Upgrade for premium styles
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    <FormField
                      control={form.control}
                      name="qrStyle"
                      render={({ field }) => (
                        <div
                          className={`border ${
                            field.value === "basic"
                              ? "border-primary"
                              : "border-muted"
                          } rounded-md p-2 text-center cursor-pointer`}
                          onClick={() => field.onChange("basic")}
                        >
                          <div className="bg-muted p-2 rounded mb-2 flex justify-center">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-12 w-12"
                              fill="currentColor"
                            >
                              <path d="M0,0 h33.33v33.33h-33.33z M41.67,0 h16.67v8.33h-16.67z M66.67,0 h33.33v33.33h-33.33z M8.33,8.33 h16.67v16.67h-16.67z M75,8.33 h16.67v16.67h-16.67z M41.67,16.67 h8.33v8.33h-8.33z M58.33,16.67 h8.33v8.33h-8.33z M41.67,33.33 h16.67v8.33h-16.67z M66.67,33.33 h8.33v8.33h-8.33z M0,41.67 h8.33v16.67h-8.33z M16.67,41.67 h16.67v8.33h-16.67z M83.33,41.67 h16.67v8.33h-16.67z M25,50 h8.33v8.33h-8.33z M50,50 h16.67v8.33h-16.67z M75,50 h8.33v8.33h-8.33z M0,66.67 h33.33v33.33h-33.33z M41.67,66.67 h8.33v16.67h-8.33z M58.33,66.67 h8.33v8.33h-8.33z M75,66.67 h8.33v8.33h-8.33z M66.67,75 h8.33v8.33h-8.33z M83.33,75 h8.33v8.33h-8.33z M8.33,75 h16.67v16.67h-16.67z M58.33,83.33 h16.67v16.67h-16.67z M83.33,83.33 h16.67v16.67h-16.67z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">Basic</span>
                        </div>
                      )}
                    />
                    
                    {/* Bordered style - Premium */}
                    <FormField
                      control={form.control}
                      name="qrStyle"
                      render={({ field }) => (
                        <div
                          className={`border ${
                            field.value === "bordered"
                              ? "border-primary"
                              : "border-muted"
                          } rounded-md p-2 text-center cursor-pointer relative ${!isPremium ? 'opacity-50' : ''}`}
                          onClick={() => isPremium && field.onChange("bordered")}
                        >
                          <div className="bg-muted p-2 rounded mb-2 flex justify-center relative">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-12 w-12"
                              style={{ border: `2px solid ${form.watch("qrColor") || "#3B82F6"}` }}
                              fill={form.watch("qrColor") || "#3B82F6"}
                            >
                              <path d="M0,0 h33.33v33.33h-33.33z M41.67,0 h16.67v8.33h-16.67z M66.67,0 h33.33v33.33h-33.33z M8.33,8.33 h16.67v16.67h-16.67z M75,8.33 h16.67v16.67h-16.67z M41.67,16.67 h8.33v8.33h-8.33z M58.33,16.67 h8.33v8.33h-8.33z M41.67,33.33 h16.67v8.33h-16.67z M66.67,33.33 h8.33v8.33h-8.33z M0,41.67 h8.33v16.67h-8.33z M16.67,41.67 h16.67v8.33h-16.67z M83.33,41.67 h16.67v8.33h-16.67z M25,50 h8.33v8.33h-8.33z M50,50 h16.67v8.33h-16.67z M75,50 h8.33v8.33h-8.33z M0,66.67 h33.33v33.33h-33.33z M41.67,66.67 h8.33v16.67h-8.33z M58.33,66.67 h8.33v8.33h-8.33z M75,66.67 h8.33v8.33h-8.33z M66.67,75 h8.33v8.33h-8.33z M83.33,75 h8.33v8.33h-8.33z M8.33,75 h16.67v16.67h-16.67z M58.33,83.33 h16.67v16.67h-16.67z M83.33,83.33 h16.67v16.67h-16.67z" />
                            </svg>
                            {!isPremium && (
                              <div className="absolute inset-0 bg-background bg-opacity-70 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary bg-white px-1 py-0.5 rounded shadow-sm">
                                  Premium
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Bordered
                          </span>
                        </div>
                      )}
                    />
                    
                    {/* Gradient style - Premium */}
                    <FormField
                      control={form.control}
                      name="qrStyle"
                      render={({ field }) => (
                        <div
                          className={`border ${
                            field.value === "gradient"
                              ? "border-primary"
                              : "border-muted"
                          } rounded-md p-2 text-center cursor-pointer relative ${!isPremium ? 'opacity-50' : ''}`}
                          onClick={() => isPremium && field.onChange("gradient")}
                        >
                          <div className="bg-muted p-2 rounded mb-2 flex justify-center relative">
                            <div style={{ 
                              background: `linear-gradient(135deg, ${form.watch("qrColor") || "#3B82F6"}33, ${form.watch("qrColor") || "#3B82F6"}11)`,
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '0.25rem'
                            }} />
                            <svg
                              viewBox="0 0 100 100"
                              className="h-12 w-12 relative z-10"
                              fill={form.watch("qrColor") || "#3B82F6"}
                            >
                              <path d="M0,0 h33.33v33.33h-33.33z M41.67,0 h16.67v8.33h-16.67z M66.67,0 h33.33v33.33h-33.33z M8.33,8.33 h16.67v16.67h-16.67z M75,8.33 h16.67v16.67h-16.67z M41.67,16.67 h8.33v8.33h-8.33z M58.33,16.67 h8.33v8.33h-8.33z M41.67,33.33 h16.67v8.33h-16.67z M66.67,33.33 h8.33v8.33h-8.33z M0,41.67 h8.33v16.67h-8.33z M16.67,41.67 h16.67v8.33h-16.67z M83.33,41.67 h16.67v8.33h-16.67z M25,50 h8.33v8.33h-8.33z M50,50 h16.67v8.33h-16.67z M75,50 h8.33v8.33h-8.33z M0,66.67 h33.33v33.33h-33.33z M41.67,66.67 h8.33v16.67h-8.33z M58.33,66.67 h8.33v8.33h-8.33z M75,66.67 h8.33v8.33h-8.33z M66.67,75 h8.33v8.33h-8.33z M83.33,75 h8.33v8.33h-8.33z M8.33,75 h16.67v16.67h-16.67z M58.33,83.33 h16.67v16.67h-16.67z M83.33,83.33 h16.67v16.67h-16.67z" />
                            </svg>
                            {!isPremium && (
                              <div className="absolute inset-0 bg-background bg-opacity-70 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary bg-white px-1 py-0.5 rounded shadow-sm">
                                  Premium
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Gradient
                          </span>
                        </div>
                      )}
                    />
                    
                    {/* Rounded style - Premium */}
                    <FormField
                      control={form.control}
                      name="qrStyle"
                      render={({ field }) => (
                        <div
                          className={`border ${
                            field.value === "rounded"
                              ? "border-primary"
                              : "border-muted"
                          } rounded-md p-2 text-center cursor-pointer relative ${!isPremium ? 'opacity-50' : ''}`}
                          onClick={() => isPremium && field.onChange("rounded")}
                        >
                          <div className="bg-muted p-2 rounded mb-2 flex justify-center relative">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-12 w-12"
                              style={{ borderRadius: "8px" }}
                              fill={form.watch("qrColor") || "#3B82F6"}
                            >
                              <path d="M0,0 h33.33v33.33h-33.33z M41.67,0 h16.67v8.33h-16.67z M66.67,0 h33.33v33.33h-33.33z M8.33,8.33 h16.67v16.67h-16.67z M75,8.33 h16.67v16.67h-16.67z M41.67,16.67 h8.33v8.33h-8.33z M58.33,16.67 h8.33v8.33h-8.33z M41.67,33.33 h16.67v8.33h-16.67z M66.67,33.33 h8.33v8.33h-8.33z M0,41.67 h8.33v16.67h-8.33z M16.67,41.67 h16.67v8.33h-16.67z M83.33,41.67 h16.67v8.33h-16.67z M25,50 h8.33v8.33h-8.33z M50,50 h16.67v8.33h-16.67z M75,50 h8.33v8.33h-8.33z M0,66.67 h33.33v33.33h-33.33z M41.67,66.67 h8.33v16.67h-8.33z M58.33,66.67 h8.33v8.33h-8.33z M75,66.67 h8.33v8.33h-8.33z M66.67,75 h8.33v8.33h-8.33z M83.33,75 h8.33v8.33h-8.33z M8.33,75 h16.67v16.67h-16.67z M58.33,83.33 h16.67v16.67h-16.67z M83.33,83.33 h16.67v16.67h-16.67z" />
                            </svg>
                            {!isPremium && (
                              <div className="absolute inset-0 bg-background bg-opacity-70 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary bg-white px-1 py-0.5 rounded shadow-sm">
                                  Premium
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Rounded
                          </span>
                        </div>
                      )}
                    />
                    
                    {/* Shadow style - Premium */}
                    <FormField
                      control={form.control}
                      name="qrStyle"
                      render={({ field }) => (
                        <div
                          className={`border ${
                            field.value === "shadow"
                              ? "border-primary"
                              : "border-muted"
                          } rounded-md p-2 text-center cursor-pointer relative ${!isPremium ? 'opacity-50' : ''}`}
                          onClick={() => isPremium && field.onChange("shadow")}
                        >
                          <div className="bg-muted p-2 rounded mb-2 flex justify-center relative">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-12 w-12"
                              style={{ 
                                filter: "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.15))" 
                              }}
                              fill={form.watch("qrColor") || "#3B82F6"}
                            >
                              <path d="M0,0 h33.33v33.33h-33.33z M41.67,0 h16.67v8.33h-16.67z M66.67,0 h33.33v33.33h-33.33z M8.33,8.33 h16.67v16.67h-16.67z M75,8.33 h16.67v16.67h-16.67z M41.67,16.67 h8.33v8.33h-8.33z M58.33,16.67 h8.33v8.33h-8.33z M41.67,33.33 h16.67v8.33h-16.67z M66.67,33.33 h8.33v8.33h-8.33z M0,41.67 h8.33v16.67h-8.33z M16.67,41.67 h16.67v8.33h-16.67z M83.33,41.67 h16.67v8.33h-16.67z M25,50 h8.33v8.33h-8.33z M50,50 h16.67v8.33h-16.67z M75,50 h8.33v8.33h-8.33z M0,66.67 h33.33v33.33h-33.33z M41.67,66.67 h8.33v16.67h-8.33z M58.33,66.67 h8.33v8.33h-8.33z M75,66.67 h8.33v8.33h-8.33z M66.67,75 h8.33v8.33h-8.33z M83.33,75 h8.33v8.33h-8.33z M8.33,75 h16.67v16.67h-16.67z M58.33,83.33 h16.67v16.67h-16.67z M83.33,83.33 h16.67v16.67h-16.67z" />
                            </svg>
                            {!isPremium && (
                              <div className="absolute inset-0 bg-background bg-opacity-70 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary bg-white px-1 py-0.5 rounded shadow-sm">
                                  Premium
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Shadow
                          </span>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="qrColor"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>QR Code Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: field.value }}
                          />
                          <Input
                            type="color"
                            {...field}
                            className="w-full h-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mb-6">
                  <FormLabel className="block mb-2">Layout Configuration</FormLabel>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="qrPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>QR Code Position</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="bottom">Bottom</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="photoPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo Position</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="hidden">Hidden</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="layoutStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Layout Style</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select layout style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="compact">Compact</SelectItem>
                              <SelectItem value="centered">Centered</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="qrSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>QR Code Size</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Input
                                type="range"
                                min="100"
                                max="250"
                                step="10"
                                className="w-full h-8"
                                {...field}
                                value={field.value.toString()}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <div className="text-sm font-medium w-12">{field.value}px</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Professional, Social, Family"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name as shown on profile"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Title/Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Marketing Specialist, Travel Enthusiast"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Bio/About</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short description about yourself"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mb-6">
                  <FormLabel>Social Links</FormLabel>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-2 mb-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1/4">
                          <Select
                            value={form.watch(`socialLinks.${index}.platform`)}
                            onValueChange={(value) =>
                              form.setValue(
                                `socialLinks.${index}.platform`,
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  form.watch(`socialLinks.${index}.platform`) ||
                                  "Select"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePlatforms(index).map((platform) => (
                                <SelectItem key={platform} value={platform}>
                                  {platform}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Enter URL or contact info"
                            {...form.register(`socialLinks.${index}.url`)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* QR Code upload option */}
                      <div className="flex items-center justify-between ml-[calc(25%+0.75rem)]">
                        <div className="flex items-center gap-2">
                          <QrCodeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Have a QR code for this platform?
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                          onClick={() => document.getElementById(`qr-upload-${index}`)?.click()}
                        >
                          Upload QR
                          <Input
                            id={`qr-upload-${index}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              // Read QR code image as data URL
                              const reader = new FileReader();
                              reader.onload = () => {
                                const dataUrl = reader.result as string;
                                // Store the QR code image URL in the form data
                                // Use "qrCodeImage" as a prefix to distinguish it from regular URLs
                                form.setValue(
                                  `socialLinks.${index}.url`,
                                  `qrCodeImage:${dataUrl}`
                                );
                                toast({
                                  title: "QR Code uploaded",
                                  description: `Your ${form.watch(`socialLinks.${index}.platform`)} QR code has been attached.`,
                                });
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </Button>
                      </div>
                      
                      {/* Preview if QR code is uploaded */}
                      {form.watch(`socialLinks.${index}.url`)?.startsWith('qrCodeImage:') && (
                        <div className="flex gap-2 items-center ml-[calc(25%+0.75rem)]">
                          <div className="w-14 h-14 border rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={form.watch(`socialLinks.${index}.url`).replace('qrCodeImage:', '')}
                              alt="QR Code preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">Custom QR code attached</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => form.setValue(`socialLinks.${index}.url`, '')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-primary"
                    onClick={() =>
                      append({ platform: "LinkedIn", url: "" })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another Link
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Profile" : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Form>
      
      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          image={imageToProcess}
          open={showCropper}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </Card>
  );
}
