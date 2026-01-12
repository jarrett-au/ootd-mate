export type StyleOption =
  | "casual"
  | "formal"
  | "minimalist"
  | "bohemian"
  | "streetwear"
  | "preppy"
  | "athletic";

export type OccasionOption = "work" | "date" | "casual" | "events/formal" | "athletic";

export interface Profile {
  id: string;
  userId: string;
  height?: number;
  weight?: number;
  primaryStyle?: StyleOption;
  secondaryStyle?: StyleOption;
  occasions?: OccasionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCreate {
  height?: number;
  weight?: number;
  primary_style?: StyleOption;
  secondary_style?: StyleOption;
  occasions?: OccasionOption[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(error.detail || "An error occurred");
  }

  return response.json();
}

export const profileApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<Profile> => {
    return request<Profile>("/api/profile/", {
      method: "GET",
    });
  },

  /**
   * Update or create user profile
   */
  updateProfile: async (data: ProfileCreate): Promise<Profile> => {
    return request<Profile>("/api/profile/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

export const STYLE_OPTIONS: readonly StyleOption[] = [
  "casual",
  "formal",
  "minimalist",
  "bohemian",
  "streetwear",
  "preppy",
  "athletic",
] as const;

export const OCCASION_OPTIONS: readonly OccasionOption[] = [
  "work",
  "date",
  "casual",
  "events/formal",
  "athletic",
] as const;

export const STYLE_LABELS: Record<StyleOption, string> = {
  casual: "Casual",
  formal: "Formal",
  minimalist: "Minimalist",
  bohemian: "Bohemian",
  streetwear: "Streetwear",
  preppy: "Preppy",
  athletic: "Athletic",
};

export const OCCASION_LABELS: Record<OccasionOption, string> = {
  work: "Work",
  date: "Date",
  casual: "Casual",
  "events/formal": "Events/Formal",
  athletic: "Athletic",
};
