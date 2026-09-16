export interface SubmitContactRequest {
  comment: string;
  email?: string | null;
  name?: string | null;
}

export interface ContactMessage {
  id: string;
  comment: string;
  email: string | null;
  name: string | null;
  userId: string | null;
  handled: boolean;
  createdAtUtc: string;
}

export interface ContactListResponse {
  items: ContactMessage[];
  total: number;
}
