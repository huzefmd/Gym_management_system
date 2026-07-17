export type Plan = 'basic' | 'premium';
export type SubscriptionStatus = 'paid' | 'pending' | 'expired';
export type MemberStatus = 'active' | 'banned' | 'pending';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height: number | null;
  starting_weight: number | null;
  address: string | null;
  emergency_contact: string | null;
  fitness_goals: string | null;
  medical_notes: string | null;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  status: MemberStatus;
  profile_photo_path: string | null;
  assigned_coach_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  photo_path: string | null;
  created_at: string;
}

export interface MealPlan {
  id: string;
  member_id: string;
  coach_id: string | null;
  day_of_week: string;
  meal_name: string;
  description: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  time_of_day: string | null;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  member_id: string;
  coach_id: string | null;
  day_of_week: string;
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  notes: string | null;
  video_link: string | null;
  created_at: string;
}

export interface ProgressLog {
  id: string;
  user_id: string;
  weight: number | null;
  photo_path: string | null;
  note: string | null;
  logged_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  checked_in_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
