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

/**
 * Save contact to device contacts
 * This function handles the appropriate method based on the device
 * @param profile The user profile data
 * @param socialLinks The user's social links 
 * @returns A promise that resolves when the operation is complete
 */
export async function saveToContacts(profile: ProfileLike, socialLinks: SocialLink[] | any[]): Promise<void> {
  if (isMobileDevice()) {
    try {
      // On mobile devices, try to use the direct mechanism
      const dataUrl = getVCardDataUrl(profile, socialLinks);
      
      // Check if Web Share API is available as a fallback for mobile
      if (navigator.share && /Android/i.test(navigator.userAgent)) {
        // Create a file to share
        const vCardString = generateVCard(profile, socialLinks);
        const blob = new Blob([vCardString], { type: 'text/vcard' });
        const file = new File([blob], `${profile.displayName || profile.name}.vcf`, { type: 'text/vcard' });
        
        try {
          await navigator.share({
            title: `${profile.displayName || profile.name}'s Contact Info`,
            files: [file]
          });
          return;
        } catch (error) {
          // Fall back to direct URL approach if share fails
          console.log('Falling back to direct URL approach', error);
        }
      }
      
      // Direct URL approach for iOS and as fallback
      window.location.href = dataUrl;
    } catch (error) {
      console.error('Error saving contact on mobile:', error);
      // Fallback to download if anything fails
      downloadVCard(profile, socialLinks);
    }
  } else {
    // On desktop, use the download method
    downloadVCard(profile, socialLinks);
  }
}