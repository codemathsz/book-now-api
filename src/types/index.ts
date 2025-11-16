export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  label: string;
  max_tables: number;
  is_active: boolean;
}

export interface Reservation {
  id: string;
  user_id: string;
  time_slot_id: number;
  date: string; // YYYY-MM-DD
  table_number: number;
  status: 'active' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ReservationWithDetails extends Reservation {
  user_name?: string;
  user_email?: string;
  time_slot_label?: string;
  start_time?: string;
  end_time?: string;
}

export interface CreateReservationDTO {
  time_slot_id: number;
  date: string;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AvailabilityResponse {
  time_slot_id: number;
  label: string;
  start_time: string;
  end_time: string;
  available_tables: number;
  max_tables: number;
  is_available: boolean;
}

export interface DashboardOverview {
  date: string;
  total_reservations: number;
  total_cancelled: number;
  slots: {
    time_slot_id: number;
    label: string;
    reserved_tables: number;
    available_tables: number;
    max_tables: number;
  }[];
}
