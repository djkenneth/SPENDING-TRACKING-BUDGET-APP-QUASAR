export interface Icon {
  id: number;
  name: string;
  slug: string;
  path: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
  is_system: boolean;
  user_id: number | null;
  created_at: string;
}
