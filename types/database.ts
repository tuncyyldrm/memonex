/**
 * Supabase Database Schema Definitions for Memonex3D
 * Synchronized with the production PostgreSQL / Supabase schema.
 */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  gallery: string[] | Record<string, unknown> | null;
  author: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  gallery: string[] | Record<string, unknown> | null;
  category: string | null;
  price: number | null;
  featured: boolean;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
}

export interface ContactMessage {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  url: string | null;
  alt: string | null;
  type: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  role: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  updated_at: string;
  brand_name: string | null;
  brand_suffix: string | null;
  brand_slogan: string | null;
  logo_subtext: string | null;
  ga_tracking_id: string | null;
  site_title_template: string | null;
  site_description_default: string | null;
  site_url: string | null;
  og_image_default: string | null;
  allow_ai_bots: boolean;
  accent_color_hex: string | null;
  border_radius_large: string | null;
  border_radius_section: string | null;
  hero_title_upper: string | null;
  hero_title_lower: string | null;
  price_currency: string | null;
  price_valid_until: string | null;
  shipping_days_min: number;
  shipping_days_max: number;
  handling_time_max: number;
  default_delivery_note: string | null;
  default_tech: string | null;
  default_material: string | null;
  default_precision: string | null;
  whatsapp_no: string | null;
  wa_default_msg: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  workshop_address: string | null;
  geo_latitude: string | null;
  geo_longitude: string | null;
  catalog_empty_msg: string | null;
  blog_empty_msg: string | null;
  not_found_emoji: string | null;
  not_found_title: string | null;
  og_image_products: string | null;
  og_image_blog: string | null;
}

export interface Filament {
  id: string;
  material: string;
  color_name: string;
  color_hex: string;
  is_active: boolean;
  is_premium: boolean;
  price_multiplier: number;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost> & { title: string; slug: string };
        Update: Partial<BlogPost>;
      };
      products: {
        Row: Product;
        Insert: Partial<Product> & { name: string; slug: string };
        Update: Partial<Product>;
      };
      pages: {
        Row: Page;
        Insert: Partial<Page> & { title: string; slug: string };
        Update: Partial<Page>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Partial<ContactMessage>;
        Update: Partial<ContactMessage>;
      };
      media: {
        Row: Media;
        Insert: Partial<Media>;
        Update: Partial<Media>;
      };
      admins: {
        Row: Admin;
        Insert: Partial<Admin> & { id: string };
        Update: Partial<Admin>;
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
      };
      filaments: {
        Row: Filament;
        Insert: Partial<Filament> & { material: string; color_name: string; color_hex: string };
        Update: Partial<Filament>;
      };
    };
  };
};
