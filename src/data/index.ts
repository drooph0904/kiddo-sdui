/**
 * Data boundary. The mock JSON files stand in for payloads delivered by production backend
 * gateways. Because real server data is untrusted and may not match our types, we cast it
 * through `unknown` here — exactly once, at the edge — and let SafeBlock / parsing guards
 * defend the renderer downstream.
 */
import type { Campaign, HomePayload } from '../types/schema';
import homepageRaw from './homepage.json';
import backToSchoolRaw from './campaigns/backToSchool.json';
import summerPlayhouseRaw from './campaigns/summerPlayhouse.json';
import mysteryGiftRaw from './campaigns/mysteryGift.json';

export const homePayload: HomePayload = homepageRaw as unknown as HomePayload;

export const campaigns: Campaign[] = [
  backToSchoolRaw as unknown as Campaign,
  summerPlayhouseRaw as unknown as Campaign,
  mysteryGiftRaw as unknown as Campaign,
];
