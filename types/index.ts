// =============================================================================
// Type Definitions - Lost Pet Identification & Recovery Network
// Team: Harshitha Vangaveti (PES2UG24AM064) & Hamsa M N (PES2UG24AM060)
// =============================================================================

export type UserRole = 'OWNER' | 'FINDER' | 'SHELTER_STAFF' | 'ADMIN';

export type AnimalType = 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';

export type ReportStatus = 'ACTIVE' | 'RESOLVED' | 'EXPIRED' | 'UNDER_INVESTIGATION';

export type FoundReportStatus = 'UNCLAIMED' | 'MATCHED' | 'SHELTERED';

export type MatchStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Pet {
  pet_id: number;
  owner_id: number;
  pet_name: string;
  animal_type: AnimalType;
  breed?: string;
  age?: number;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  color_description: string;
  distinctive_marks?: string;
  microchip_id?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  owner_name?: string;
  owner_phone?: string;
}

export interface LostReport {
  report_id: number;
  pet_id: number;
  reported_by: number;
  lost_date: string;
  last_seen_location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: ReportStatus;
  reward_amount: number;
  created_at: string;
  pet_name?: string;
  animal_type?: AnimalType;
  breed?: string;
  color_description?: string;
  owner_name?: string;
  owner_phone?: string;
  photo_url?: string;
  days_missing?: number;
}

export interface FoundReport {
  found_report_id: number;
  finder_id: number;
  animal_type: AnimalType;
  breed_guess?: string;
  color_description: string;
  found_date: string;
  found_location: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  description?: string;
  status: FoundReportStatus;
  created_at: string;
  finder_name?: string;
  finder_phone?: string;
}

export interface PotentialMatch {
  match_id: number;
  report_id: number;
  found_report_id: number;
  match_score: number;
  match_status: MatchStatus;
  matched_by?: number;
  matched_at: string;
  notes?: string;
  lost_pet_name?: string;
  lost_animal_type?: AnimalType;
  lost_breed?: string;
  lost_color?: string;
  last_seen_location?: string;
  found_location?: string;
  found_animal_type?: AnimalType;
  found_breed_guess?: string;
  found_color?: string;
  owner_name?: string;
  finder_name?: string;
}

export interface Shelter {
  shelter_id: number;
  shelter_name: string;
  contact_person?: string;
  email: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  current_count: number;
  occupancy_status?: string;
  utilization_rate_pct?: number;
}

export interface MongoSighting {
  _id?: string;
  lost_report_id: number;
  reported_by_user_id: number;
  reporter_name: string;
  timestamp: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: string;
  description: string;
  confidence_level: 'CERTAIN' | 'LIKELY' | 'UNSURE';
  photo_urls: string[];
  is_verified: boolean;
  verified_by?: number;
}

export interface DashboardStats {
  active_lost_reports: number;
  unclaimed_found_pets: number;
  pending_matches: number;
  total_recovered_pets: number;
  active_shelters: number;
  registered_owners: number;
  average_match_score: number;
}
