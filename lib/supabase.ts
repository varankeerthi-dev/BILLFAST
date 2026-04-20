import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export interface SiteVisit {
  id: string
  project_id: string
  client_id: string
  visit_date: string
  status: string
  notes?: string
  next_step?: string
  follow_up_date?: string
  visited_by?: string
  engineer?: string
  purpose?: string
  created_by?: string
  in_time?: string
  out_time?: string
  site_address?: string
  measurements?: string
  location_url?: string
  discussion?: string
  postponed_reason?: string
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  location: string
  status: string
  budget?: number
  organisation_id?: string
  project_type?: string
  po_value?: number
  po_required?: boolean
  description?: string
  start_date?: string
  end_date?: string
  created_at: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  vendor_no?: string
  city?: string
  state?: string
  category?: string
  status?: string
  gstin?: string
  address_line_1?: string
  address_line_2?: string
  pincode?: string
  created_at: string
}

export interface Material {
  id: string
  name: string
  category: string
  unit: string
  price: number
  stock: number
  purchase_price?: number
  gst_rate?: number
  hsn_code?: string
  size?: string
  pressure_class?: string
  schedule_type?: string
  material?: string
  end_connection?: string
  sale_price?: number
  uses_variant?: boolean
  display_name?: string
  item_code?: string
  sub_category?: string
  is_active?: boolean
  created_at: string
}

export type ProjectStatus = 'pending' | 'active' | 'completed' | 'on_hold' | 'cancelled' | 'draft'
export type ProjectType = 'residential' | 'commercial' | 'industrial' | 'renovation'

export interface Service {
  id: string
  name: string
  service_name?: string
  description?: string
  service_code?: string
  unit?: string
  sale_price?: number
  tax_rate?: number
  hsn_code?: string
  category: string
  is_active?: boolean
  created_at: string
}

export interface ItemCategory {
  id: string
  name: string
  category_name?: string
  description?: string
  is_active?: boolean
  created_at: string
}

export interface ItemUnit {
  id: string
  name: string
  unit_name?: string
  unit_code?: string
  description?: string
  abbreviation: string
  is_active?: boolean
  created_at: string
}

export interface CompanyVariant {
  id: string
  company_id: string
  variant_name: string
  description?: string
  is_active?: boolean
  created_at: string
}

export interface Warehouse {
  id: string
  name: string
  warehouse_name?: string
  warehouse_code?: string
  location: string
  is_default?: boolean
  is_active?: boolean
  created_at: string
}
