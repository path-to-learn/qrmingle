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
export function generateVCard(profile: ProfileLike, socialLinks: SocialLink[]): string {
  // Start vCard
  let vCardString = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.displayName || profile.name}`,
    `N:${profile.displayName || profile.name};;;`,
  ];

  // Add organization if title exists
  if (profile.title) {
    vCardString.push(`TITLE:${profile.title}`);
  }

  // Add note if bio exists
  if (profile.bio) {
    vCardString.push(`NOTE:${profile.bio}`);
  }

  // Add photo if exists
  if (profile.photoUrl) {
    // If photoUrl is a base64 string, include it directly
    if (profile.photoUrl.startsWith('data:image')) {
      // Extract base64 data without the prefix
      const base64Data = profile.photoUrl.split(',')[1];
      vCardString.push(`PHOTO;ENCODING=b;TYPE=JPEG:${base64Data}`);
    } else {
      vCardString.push(`PHOTO;VALUE=URL:${profile.photoUrl}`);
    }
  }

  // Add social links
  socialLinks.forEach(link => {
    // Handle special types
    switch (link.platform.toLowerCase()) {
      case 'phone':
      case 'mobile':
      case 'cell':
        vCardString.push(`TEL;TYPE=CELL:${link.url}`);
        break;
      case 'email':
        vCardString.push(`EMAIL:${link.url}`);
        break;
      case 'website':
      case 'web':
        vCardString.push(`URL:${link.url}`);
        break;
      case 'linkedin':
        vCardString.push(`X-SOCIALPROFILE;TYPE=linkedin:${link.url}`);
        break;
      case 'twitter':
      case 'x':
        vCardString.push(`X-SOCIALPROFILE;TYPE=twitter:${link.url}`);
        break;
      case 'facebook':
        vCardString.push(`X-SOCIALPROFILE;TYPE=facebook:${link.url}`);
        break;
      case 'instagram':
        vCardString.push(`X-SOCIALPROFILE;TYPE=instagram:${link.url}`);
        break;
      case 'github':
        vCardString.push(`X-SOCIALPROFILE;TYPE=github:${link.url}`);
        break;
      case 'youtube':
        vCardString.push(`X-SOCIALPROFILE;TYPE=youtube:${link.url}`);
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
export function downloadVCard(profile: ProfileLike, socialLinks: SocialLink[]): void {
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
export function getVCardDataUrl(profile: ProfileLike, socialLinks: SocialLink[]): string {
  const vCardString = generateVCard(profile, socialLinks);
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardString)}`;
}