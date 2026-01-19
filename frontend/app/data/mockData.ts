export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  sourcePlatform: "YouTube" | "Manual";
  status: "Ready" | "In Progress" | "Distributed";
  languages: string[];
  destinations: string[];
  updatedAt: string;
};

export type Channel = {
  id: string;
  name: string;
  platform: "YouTube" | "Manual";
  email?: string;
  connected: boolean;
};

export type Account = {
  id: string;
  platform: "YouTube" | "TikTok" | "Instagram" | "Facebook" | "X";
  name: string;
  connected: boolean;
};

export type Language = {
  code: string;
  name: string;
  enabled: boolean;
};

export const MOCK_VIDEOS: Video[] = [
  {
    id: "vid_1",
    title: "LabelVerificationDemo",
    thumbnail: "https://i.ytimg.com/vi/1k7e1QxwE9Q/hqdefault.jpg",
    duration: "5:42",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "Ready",
    languages: ["EN", "ES", "FR"],
    destinations: ["youtube", "tiktok"],
    updatedAt: "2025-01-16"
  },
  {
    id: "vid_2",
    title: "What I learned 3",
    thumbnail: "https://i.ytimg.com/vi/0tOJ9Z5vD4A/hqdefault.jpg",
    duration: "7:31",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "In Progress",
    languages: ["EN", "ES"],
    destinations: ["youtube"],
    updatedAt: "2025-01-15"
  },
  {
    id: "vid_3",
    title: "What I Learned #2",
    thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
    duration: "8:34",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "Distributed",
    languages: ["EN", "ES", "FR", "DE", "AR"],
    destinations: ["youtube", "tiktok", "instagram"],
    updatedAt: "2025-01-14"
  },
  {
    id: "vid_4",
    title: "What I Learned Project #1",
    thumbnail: "https://i.ytimg.com/vi/2e3hDkX8T4E/hqdefault.jpg",
    duration: "7:55",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "Ready",
    languages: ["EN"],
    destinations: ["youtube", "facebook"],
    updatedAt: "2025-01-13"
  },
  {
    id: "vid_5",
    title: "Thomas S Tournament Exxon",
    thumbnail: "https://i.ytimg.com/vi/x7V2p8y4G1c/hqdefault.jpg",
    duration: "1:52",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "In Progress",
    languages: ["EN", "ES", "FR", "DE"],
    destinations: ["tiktok"],
    updatedAt: "2025-01-12"
  },
  {
    id: "vid_6",
    title: "Innovation Plan Deca",
    thumbnail: "https://i.ytimg.com/vi/4ZcQmQL6g14/hqdefault.jpg",
    duration: "7:25",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "Distributed",
    languages: ["EN", "ES"],
    destinations: ["youtube", "tiktok", "instagram", "facebook"],
    updatedAt: "2025-01-11"
  },
  {
    id: "vid_7",
    title: "Hosa Prez Elect Vid (2021)",
    thumbnail: "https://i.ytimg.com/vi/ktvTqknDobU/hqdefault.jpg",
    duration: "0:52",
    channel: "Sidiq Moltafet",
    sourcePlatform: "YouTube",
    status: "Ready",
    languages: ["EN"],
    destinations: ["youtube"],
    updatedAt: "2025-01-10"
  }
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: "ch_1",
    name: "Sidiq Moltafet",
    platform: "YouTube",
    email: "sidiq@example.com",
    connected: true
  },
  {
    id: "ch_2",
    name: "Manual Upload",
    platform: "Manual",
    connected: false
  }
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc_1",
    platform: "YouTube",
    name: "Sidiq Moltafet",
    connected: true
  },
  {
    id: "acc_2",
    platform: "TikTok",
    name: "VoxAll TikTok",
    connected: true
  },
  {
    id: "acc_3",
    platform: "Instagram",
    name: "VoxAll Instagram",
    connected: false
  },
  {
    id: "acc_4",
    platform: "Facebook",
    name: "VoxAll Facebook",
    connected: false
  },
  {
    id: "acc_5",
    platform: "X",
    name: "VoxAll X",
    connected: false
  }
];

export const MOCK_LANGUAGES: Language[] = [
  { code: "EN", name: "English", enabled: true },
  { code: "ES", name: "Spanish", enabled: true },
  { code: "FR", name: "French", enabled: true },
  { code: "DE", name: "German", enabled: true },
  { code: "AR", name: "Arabic", enabled: false },
  { code: "HI", name: "Hindi", enabled: false },
  { code: "ZH", name: "Chinese", enabled: false },
  { code: "JA", name: "Japanese", enabled: false }
];
