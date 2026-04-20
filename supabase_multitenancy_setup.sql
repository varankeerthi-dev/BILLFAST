-- ==========================================
-- 1. CLEAN SLATE: DELETE ALL EXISTING DATA
-- ==========================================
-- This wipes all existing records to ensure a fresh, multi-tenant start.
TRUNCATE TABLE 
  clients, projects, materials, services, site_visits, 
  quotations, purchase_orders, delivery_challans, meetings, 
  warehouses, item_categories, item_units, company_variants, 
  item_stock, item_variant_pricing 
RESTART IDENTITY CASCADE;

-- ==========================================
-- 2. SETUP CORE TABLES (ORGANISATIONS & PROFILES)
-- ==========================================
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles link Supabase Auth Users to an Organisation
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  organisation_id UUID REFERENCES organisations(id),
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. ADD ORGANISATION_ID TO EVERY MODULE
-- ==========================================
DO $$ 
BEGIN 
  -- Add organisation_id column to every table that stores data
  ALTER TABLE clients ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE materials ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE services ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE quotations ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE delivery_challans ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE meetings ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE item_units ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE company_variants ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE item_stock ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
  ALTER TABLE item_variant_pricing ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id);
END $$;

-- ==========================================
-- 4. ENABLE RLS & ENFORCE ISOLATION
-- ==========================================
DO $$ 
DECLARE 
  t text;
  tables text[] := ARRAY[
    'clients', 'projects', 'materials', 'services', 'site_visits', 
    'quotations', 'purchase_orders', 'delivery_challans', 'meetings', 
    'warehouses', 'item_categories', 'item_units', 'company_variants', 
    'item_stock', 'item_variant_pricing', 'organisations', 'profiles'
  ];
BEGIN 
  FOR t IN SELECT unnest(tables) LOOP
    -- Enable RLS on the table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    
    -- Drop existing policies to avoid conflicts
    EXECUTE format('DROP POLICY IF EXISTS "org_isolation" ON %I', t);
    
    -- Create the Security Policy
    -- Logic: "organisation_id must match the organisation_id found in the user's profile"
    IF t = 'organisations' THEN
      EXECUTE format('CREATE POLICY "org_isolation" ON %I FOR ALL USING (id = (SELECT organisation_id FROM profiles WHERE id = auth.uid()))', t);
    ELSIF t = 'profiles' THEN
      EXECUTE format('CREATE POLICY "org_isolation" ON %I FOR ALL USING (id = auth.uid())', t);
    ELSE
      EXECUTE format('CREATE POLICY "org_isolation" ON %I FOR ALL USING (organisation_id = (SELECT organisation_id FROM profiles WHERE id = auth.uid()))', t);
    END IF;
  END LOOP;
END $$;
