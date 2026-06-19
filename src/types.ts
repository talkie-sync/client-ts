export interface CreatePairResponse {
  words: string;
  session_id: string;
  channel_id: string;
  expires_in: number;
}

export interface ClaimPairRequest {
  words: string;
}

export interface ClaimPairResponse {
  session_id: string;
  channel_id: string;
}

export interface Message {
  id: string;
  seq: number;
  payload: string;
  created_at: number;
}

export interface PushMessageRequest {
  payload: string;
}

export interface MessageListResponse {
  messages: Message[];
  next_seq: number | null;
}

export interface Project {
  id: string;
  name: string;
  tier: "free" | "creator" | "pro";
  created_at: number;
}

export interface UserMe {
  id: string;
  email: string;
  tier: string;
  projects: Project[];
}

export interface TierConfig {
  label: string;
  maxProjects: number | null;
  maxChannels: number | null;
  maxPairsPerDay: number | null;
  pairsPerMonth: number | null;
  pairTTLSec: number | null;
  creemProductId: string | null;
  maxMessagesPerChannel: number | null;
  messagesPerSecond: number | null;
}

export interface ConfigResponse {
  tiers: Record<string, TierConfig>;
}

export interface ApiError {
  error: string;
  message?: string;
}
