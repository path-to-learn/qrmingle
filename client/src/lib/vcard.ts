/**
 * Utility functions to generate vCard data for contact sharing
 */

import type { SocialLink } from "@shared/schema";

// Using a more generic type to accommodate different profile structures
interface ProfileLike {
  id: number;
  name: string;
  displayName: string;
  title?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  slug: string;
  [key: string]: any;
}

/**
 * Generates a vCard string from profile data
 * @param profile The user profile data
 * @param socialLinks The user's social links
 * @returns A string in vCard format
 */
export function generateVCard(profile: ProfileLike, socialLinks: SocialLink[] | any[]): string {
  // Parse name components if available
  const fullName = profile.displayName || profile.name;
  let lastName = "";
  let firstName = fullName;
  
  if (fullName.includes(" ")) {
    const nameParts = fullName.split(" ");
    lastName = nameParts.pop() || "";
    firstName = nameParts.join(" ");
  }
  
  // Start vCard
  let vCardString = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `N:${lastName};${firstName};;;`,
  ];

  // Add organization if title exists
  if (profile.title) {
    // If title contains company info like "Software Engineer at Company"
    if (profile.title.toLowerCase().includes(" at ")) {
      const parts = profile.title.split(" at ");
      vCardString.push(`TITLE:${parts[0]}`);
      vCardString.push(`ORG:${parts[1]}`);
    } else {
      vCardString.push(`TITLE:${profile.title}`);
    }
  }

  // Add note if bio exists
  if (profile.bio) {
    // Escape special characters in the bio
    const escapedBio = profile.bio
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");
    vCardString.push(`NOTE:${escapedBio}`);
  }

  // Add profile URL
  vCardString.push(`URL:${window.location.href}`);

  // Add photo if exists
  if (profile.photoUrl) {
    // If photoUrl is a base64 string, include it directly
    if (profile.photoUrl.startsWith('data:image')) {
      // Extract base64 data without the prefix
      const base64Data = profile.photoUrl.split(',')[1];
      vCardString.push(`PHOTO;ENCODING=b;TYPE=JPEG:${base64Data}`);
    } else {
      vCardString.push(`PHOTO;VALUE=URI:${profile.photoUrl}`);
    }
  }

  // Add social links
  socialLinks.forEach(link => {
    // Handle special types
    switch (link.platform.toLowerCase()) {
      case 'phone':
      case 'mobile':
      case 'cell':
        // Clean phone number formatting
        const phoneNumber = link.url.replace(/[^+0-9]/g, '');
        vCardString.push(`TEL;TYPE=CELL:${phoneNumber}`);
        break;
      case 'home':
      case 'landline':
        const homeNumber = link.url.replace(/[^+0-9]/g, '');
        vCardString.push(`TEL;TYPE=HOME:${homeNumber}`);
        break;
      case 'work':
      case 'office':
        const workNumber = link.url.replace(/[^+0-9]/g, '');
        vCardString.push(`TEL;TYPE=WORK:${workNumber}`);
        break;
      case 'email':
      case 'mail':
        vCardString.push(`EMAIL;TYPE=INTERNET:${link.url}`);
        break;
      case 'work email':
      case 'work mail':
        vCardString.push(`EMAIL;TYPE=WORK:${link.url}`);
        break;
      case 'website':
      case 'web':
      case 'site':
        vCardString.push(`URL:${link.url}`);
        break;
      case 'address':
      case 'location':
        vCardString.push(`ADR:;;${link.url};;;`);
        break;
      case 'linkedin':
        vCardString.push(`X-SOCIALPROFILE;TYPE=linkedin:${link.url}`);
        vCardString.push(`URL;TYPE=linkedin:${link.url}`);
        break;
      case 'twitter':
      case 'x':
        vCardString.push(`X-SOCIALPROFILE;TYPE=twitter:${link.url}`);
        vCardString.push(`URL;TYPE=twitter:${link.url}`);
        break;
      case 'facebook':
        vCardString.push(`X-SOCIALPROFILE;TYPE=facebook:${link.url}`);
        vCardString.push(`URL;TYPE=facebook:${link.url}`);
        break;
      case 'instagram':
        vCardString.push(`X-SOCIALPROFILE;TYPE=instagram:${link.url}`);
        vCardString.push(`URL;TYPE=instagram:${link.url}`);
        break;
      case 'github':
        vCardString.push(`X-SOCIALPROFILE;TYPE=github:${link.url}`);
        vCardString.push(`URL;TYPE=github:${link.url}`);
        break;
      case 'youtube':
        vCardString.push(`X-SOCIALPROFILE;TYPE=youtube:${link.url}`);
        vCardString.push(`URL;TYPE=youtube:${link.url}`);
        break;
      default:
        // Add as URL for other social platforms
        vCardString.push(`URL;TYPE=${link.platform}:${link.url}`);
    }
  });

  // Add timestamp
  vCardString.push(`REV:${new Date().toISOString()}`);

  // End vCard
  vCardString.push('END:VCARD');

  return vCardString.join('\n');
}

/**
 * Creates and triggers a download of the vCard file
 * @param profile The user profile data
 * @param socialLinks The user's social links
 */
export function downloadVCard(profile: ProfileLike, socialLinks: SocialLink[] | any[]): void {
  const vCardString = generateVCard(profile, socialLinks);
  const blob = new Blob([vCardString], { type: 'text/vcard' });
  const url = window.URL.createObjectURL(blob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${profile.displayName || profile.name}.vcf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up the URL object
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
}

/**
 * Creates a data URL for the vCard that can be used in a link
 * @param profile The user profile data
 * @param socialLinks The user's social links
 * @returns A data URL containing the vCard data
 */
export function getVCardDataUrl(profile: ProfileLike, socialLinks: SocialLink[] | any[]): string {
  const vCardString = generateVCard(profile, socialLinks);
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardString)}`;
}

/**
 * Determines if the current device is a mobile device
 * @returns boolean true if the device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
}

// Define missing types for the Web Contacts API
interface ContactInfo {
  name?: string[];
  email?: string[];
  tel?: string[];
  address?: string[];
  icon?: Blob[];
  [key: string]: any;
}

interface ContactsManager {
  select: (properties: string[], options?: {multiple?: boolean}) => Promise<ContactInfo[]>;
  getProperties: () => Promise<string[]>;
}

// Extend Navigator interface to include the Web Contacts API
declare global {
  interface Navigator {
    contacts?: ContactsManager;
    share?: (data: {
      title?: string;
      text?: string;
      url?: string;
      files?: File[];
    }) => Promise<void>;
    canShare?: (data: {
      files?: File[];
      [key: string]: any;
    }) => boolean;
  }
}

/**
 * Check if the Web Contact API is available
 * This is a newer API that allows direct saving to contacts on supported browsers
 */
export function hasContactsAPI(): boolean {
  return !!(navigator.contacts && typeof (navigator.contacts as any).select === 'function');
}

/**
 * Check if the Web Share API supports sharing files
 */
export function hasShareWithFilesAPI(): boolean {
  if (!navigator.share || !navigator.canShare) return false;
  
  try {
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    return navigator.canShare({ files: [testFile] });
  } catch (e) {
    return false;
  }
}

/**
 * Save contact to device contacts
 * This function handles the appropriate method based on the device
 * @param profile The user profile data
 * @param socialLinks The user's social links 
 * @returns A promise that resolves when the operation is complete
 */
export async function saveToContacts(profile: ProfileLike, socialLinks: SocialLink[] | any[]): Promise<void> {
  const isMobile = isMobileDevice();
  const vCardString = generateVCard(profile, socialLinks);
  const fileName = `${profile.displayName || profile.name}.vcf`;
  
  try {
    // METHOD 1: Try using the modern Contacts API for Chrome on Android (when available)
    if (hasContactsAPI()) {
      console.log('Using Web Contacts API');
      // We return early as we handle fallbacks directly in this block
      try {
        // Extract phone number from social links if available
        let phoneNumber = '';
        let email = '';
        for (const link of socialLinks) {
          if (['phone', 'mobile', 'cell'].includes(link.platform.toLowerCase())) {
            phoneNumber = link.url.replace(/[^+0-9]/g, '');
            break;
          }
          if (['email', 'mail'].includes(link.platform.toLowerCase())) {
            email = link.url;
            break;
          }
        }
        
        // The Contacts API can only add a contact, not fully populate it
        // We open the contacts API with the basic info, then the user can save
        const props = ['name', 'email', 'tel'];
        const opts = { multiple: false };
        
        // Create a contact with the basic info - this just helps populate the fields
        // The user still needs to save the contact themselves
        const contacts = [{
          name: [profile.displayName || profile.name],
          email: email ? [email] : [],
          tel: phoneNumber ? [phoneNumber] : []
        }];
        
        await (navigator.contacts as any).select(props, opts);
        return;
      } catch (e) {
        console.error('Error using Contacts API, falling back:', e);
        // Continue to fallback methods
      }
    }
    
    // METHOD 2: Try using Web Share API with file sharing (Android)
    // This is most reliable for Android devices as it works with most default contacts apps
    if (isMobile && hasShareWithFilesAPI()) {
      try {
        console.log('Using Web Share API with file sharing');
        const blob = new Blob([vCardString], { type: 'text/vcard' });
        const file = new File([blob], fileName, { type: 'text/vcard' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${profile.displayName || profile.name}'s Contact Info`,
            text: `Contact information for ${profile.displayName || profile.name}`,
            files: [file]
          });
          return;
        }
      } catch (e) {
        console.error('Error using Web Share API with files, falling back:', e);
        // Continue to fallback methods
      }
    }
    
    // METHOD 3: Direct vCard URL (works on iOS especially)
    if (isMobile) {
      try {
        console.log('Using direct vCard URL method');
        const dataUrl = getVCardDataUrl(profile, socialLinks);
        
        // On iOS this often triggers the native "Add to Contacts" flow
        // A new tab/window will open briefly and then close
        window.location.href = dataUrl;
        return;
      } catch (e) {
        console.error('Error using direct vCard URL, falling back:', e);
        // Continue to fallback methods
      }
    }
    
    // METHOD 4: Fallback to traditional download for desktops and as last resort
    console.log('Using traditional download method');
    downloadVCard(profile, socialLinks);
    
  } catch (error) {
    console.error('Error in saveToContacts:', error);
    // Final fallback
    downloadVCard(profile, socialLinks);
  }
}