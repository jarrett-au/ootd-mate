export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  occasion: string | null;
  season: string | null;
  tags: string | null; // JSON string array
  createdAt: Date;
  updatedAt: Date;
  clothingItems?: OutfitClothingItem[];
}

export interface OutfitClothingItem {
  id: string;
  outfitId: string;
  clothingItemId: string;
  clothingItem?: {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
  };
  createdAt: Date;
}

export interface OutfitInput {
  name: string;
  description?: string;
  imageUrl?: string;
  occasion?: string;
  season?: string;
  tags?: string[];
  clothingItemIds: string[];
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  outfitId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
