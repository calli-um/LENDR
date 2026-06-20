export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          email_verified: boolean;
          verified_lender: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          email_verified?: boolean;
          verified_lender?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          email_verified?: boolean;
          verified_lender?: boolean;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          price_per_day: number;
          category: string;
          location: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          price_per_day: number;
          category: string;
          location: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          price_per_day?: number;
          category?: string;
          location?: string;
          status?: string;
          created_at?: string;
        };
      };
      item_images: {
        Row: {
          id: string;
          item_id: string;
          url: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          item_id: string;
          url: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          item_id?: string;
          url?: string;
          sort_order?: number;
        };
      };
      wishlist_items: {
        Row: {
          user_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          item_id?: string;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          item_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          renter_id?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      check_booking_overlap: {
        Args: {
          p_item_id: string;
          p_start_date: string;
          p_end_date: string;
          p_exclude_booking_id?: string;
        };
        Returns: boolean;
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemImage = Database["public"]["Tables"]["item_images"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type ItemWithImages = Item & {
  item_images: ItemImage[];
  profiles?: Profile | null;
};

export type BookingWithDetails = Booking & {
  items: Item & { profiles: Profile | null; item_images: ItemImage[] };
  renter: Profile | null;
};

export type ReviewWithReviewer = Review & {
  reviewer: Profile | null;
};
