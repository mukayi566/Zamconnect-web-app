export type CitizenStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type AdminRole = 'admin' | 'registrar' | 'verifier';
export type VerificationMethod = 'qr' | 'nrc' | 'biometric';
export type VerificationResult = 'verified' | 'failed' | 'tampered';

export interface Citizen {
  id: string;
  nrc_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  province: string;
  district: string;
  phone: string;
  email: string;
  photo_url: string;
  status: CitizenStatus;
  role: 'citizen';
  qr_payload: string;
  created_at: string;
  updated_at: string;
  registered_by: string;
}

export interface VerificationLog {
  id: string;
  citizen_id: string;
  verifier_id: string;
  method: VerificationMethod;
  result: VerificationResult;
  organization: string;
  ip_address: string;
  created_at: string;
  citizen?: Citizen; // Joined data
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_id: string;
  target_type: 'citizen' | 'admin' | 'system';
  ip_address: string;
  metadata: any;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  province: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
}

export interface AuthState {
  session: any | null;
  user: AdminUser | null;
  isLoading: boolean;
  setSession: (session: any) => void;
  setUser: (user: AdminUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}
