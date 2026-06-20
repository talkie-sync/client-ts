import { encryptPayload, decryptPayload } from "./crypto";
import type {
  CreatePairResponse,
  ClaimPairRequest,
  ClaimPairResponse,
  PushMessageRequest,
  MessageListResponse,
  UserMe,
  ConfigResponse,
  Project,
  ApiError,
} from "./types";

export interface TalkieClientOptions {
  baseUrl: string;
  apiKey: string;
}

export class TalkieClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options: TalkieClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const init: RequestInit = {
      method,
      headers,
    };

    if (body) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      throw new Error(`${error.error}: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async createPair(channelId?: string, sessionId?: string): Promise<CreatePairResponse> {
    const query = new URLSearchParams();
    if (channelId) query.set("channel_id", channelId);
    if (sessionId) query.set("session_id", sessionId);
    const qs = query.toString();
    return this.request("POST", `/api/pair${qs ? `?${qs}` : ""}`);
  }

  async claimPair(words: string): Promise<ClaimPairResponse> {
    return this.request<ClaimPairResponse>("POST", "/api/pair", { words } as ClaimPairRequest);
  }

  async pushMessage(channelId: string, payload: string): Promise<{ id: string }> {
    const cleanChannelId = channelId.split(":")[0];
    return this.request("POST", `/api/pair/${cleanChannelId}/messages`, { payload } as PushMessageRequest);
  }

  async pushEncryptedMessage(channelId: string, payload: string, sessionId: string): Promise<{ id: string }> {
    const encrypted = await encryptPayload(payload, sessionId);
    return this.pushMessage(channelId, encrypted);
  }

  async pollMessages(channelId: string, after = 0, timeout?: number): Promise<MessageListResponse> {
    const cleanChannelId = channelId.split(":")[0];
    const params = new URLSearchParams({ after: String(after) });
    if (timeout) params.set("timeout", String(timeout));
    return this.request("GET", `/api/pair/${cleanChannelId}/messages?${params}`);
  }

  async listMessages(channelId: string, after = 0): Promise<MessageListResponse> {
    const cleanChannelId = channelId.split(":")[0];
    return this.request("GET", `/api/pair/${cleanChannelId}/messages?after=${after}`);
  }

  async decryptMessagePayload(message: { payload: string }, sessionId: string): Promise<string> {
    return decryptPayload(message.payload, sessionId);
  }

  async getUser(): Promise<UserMe> {
    return this.request("GET", "/api/user/me");
  }

  async listProjects(): Promise<{ projects: Project[] }> {
    return this.request("GET", "/api/projects");
  }

  async getProject(id: string): Promise<Project> {
    return this.request("GET", `/api/projects/${id}`);
  }

  async createProject(name: string): Promise<Project> {
    return this.request("POST", "/api/projects", { name });
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request("DELETE", `/api/projects/${id}`);
  }

  async getConfig(): Promise<ConfigResponse> {
    return this.request("GET", "/api/config/tiers");
  }

  async createCheckoutUrl(priceId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
    return this.request("POST", "/api/billing/checkout", {
      price_id: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createPortalUrl(): Promise<{ url: string }> {
    return this.request("POST", "/api/billing/portal");
  }

  async upgradeSubscription(priceId: string): Promise<{ success: boolean }> {
    return this.request("POST", "/api/billing/upgrade", { price_id: priceId });
  }
}
