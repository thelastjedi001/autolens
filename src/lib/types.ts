// Database row types for Autolens.
// Hand-written to mirror supabase/schema.sql exactly.

export type AccountType = 'private' | 'dealer'
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other'
export type Transmission = 'manual' | 'automatic'
export type BodyType =
  | 'sedan'
  | 'suv'
  | 'hatchback'
  | 'coupe'
  | 'truck'
  | 'van'
  | 'wagon'
  | 'convertible'
  | 'other'
export type Condition = 'new' | 'used' | 'certified_pre_owned'
export type ListingStatus = 'active' | 'sold' | 'draft'

export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  account_type: AccountType
  dealer_name: string | null
  location: string | null
  phone: string | null
  created_at: string
}

export type Listing = {
  id: string
  seller_id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number | null
  fuel_type: FuelType | null
  transmission: Transmission | null
  body_type: BodyType | null
  colour: string | null
  condition: Condition
  description: string | null
  location: string | null
  status: ListingStatus
  views: number
  created_at: string
  updated_at: string
}

export type ListingImage = {
  id: string
  listing_id: string
  storage_path: string
  url: string
  position: number
  created_at: string
}

export type Conversation = {
  id: string
  listing_id: string | null
  buyer_id: string
  seller_id: string
  last_message_at: string
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}

// Joined shapes used across pages
export type ListingWithDetails = Listing & {
  listing_images: ListingImage[]
  profiles: Profile
}

export type ConversationWithDetails = Conversation & {
  messages: Message[]
  buyer: Profile
  seller: Profile
  listing?: (Listing & { listing_images: ListingImage[] }) | null
}

// Insert shapes (columns with defaults are optional)
export type ProfileInsert = {
  id: string
  full_name?: string
  avatar_url?: string | null
  account_type?: AccountType
  dealer_name?: string | null
  location?: string | null
  phone?: string | null
  created_at?: string
}

export type ListingInsert = {
  id?: string
  seller_id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number | null
  fuel_type?: FuelType | null
  transmission?: Transmission | null
  body_type?: BodyType | null
  colour?: string | null
  condition?: Condition
  description?: string | null
  location?: string | null
  status?: ListingStatus
  views?: number
  created_at?: string
  updated_at?: string
}

export type ListingImageInsert = {
  id?: string
  listing_id: string
  storage_path: string
  url: string
  position?: number
  created_at?: string
}

export type ConversationInsert = {
  id?: string
  listing_id?: string | null
  buyer_id: string
  seller_id: string
  last_message_at?: string
  created_at?: string
}

export type MessageInsert = {
  id?: string
  conversation_id: string
  sender_id: string
  body: string
  read?: boolean
  created_at?: string
}

// Supabase generic
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
        Relationships: []
      }
      listings: {
        Row: Listing
        Insert: ListingInsert
        Update: Partial<ListingInsert>
        Relationships: []
      }
      listing_images: {
        Row: ListingImage
        Insert: ListingImageInsert
        Update: Partial<ListingImageInsert>
        Relationships: []
      }
      conversations: {
        Row: Conversation
        Insert: ConversationInsert
        Update: Partial<ConversationInsert>
        Relationships: []
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: Partial<MessageInsert>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_views: {
        Args: { listing: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
