-- PostgreSQL Schema for Educational API Builder

-- 1. Templates Table (Admin defined dynamic API structures)
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Records Table (Student dynamic JSON data)
CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Dedicated Users Table (for fixed educational /api/users endpoints)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  car_name VARCHAR(100),
  fiance_name VARCHAR(100),
  profession VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Initial Default Templates if none exist
INSERT INTO templates (id, name, description, fields, is_published)
VALUES 
(
  1,
  'Student / User Profile',
  'Standard student profile API with personal and career details',
  '[
    {"id": "firstName", "key": "firstName", "name": "First Name", "type": "text", "required": true, "defaultValue": "John"},
    {"id": "lastName", "key": "lastName", "name": "Last Name", "type": "text", "required": true, "defaultValue": "Doe"},
    {"id": "age", "key": "age", "name": "Age", "type": "number", "required": true, "defaultValue": 22},
    {"id": "carName", "key": "carName", "name": "Car Name", "type": "text", "required": false, "defaultValue": "BMW M3"},
    {"id": "fianceName", "key": "fianceName", "name": "Fiancé Name", "type": "text", "required": false, "defaultValue": "Sarah"},
    {"id": "profession", "key": "profession", "name": "Profession", "type": "text", "required": true, "defaultValue": "Full-Stack Developer"},
    {"id": "city", "key": "city", "name": "City", "type": "text", "required": true, "defaultValue": "Tashkent"}
  ]'::jsonb,
  true
),
(
  2,
  'E-Commerce Product Catalog',
  'Dynamic product API for practicing shopping cart & store integrations',
  '[
    {"id": "productName", "key": "productName", "name": "Product Name", "type": "text", "required": true, "defaultValue": "iPhone 17 Pro"},
    {"id": "price", "key": "price", "name": "Price", "type": "number", "required": true, "defaultValue": 1199},
    {"id": "color", "key": "color", "name": "Color", "type": "text", "required": false, "defaultValue": "Space Titanium"},
    {"id": "brand", "key": "brand", "name": "Brand", "type": "text", "required": true, "defaultValue": "Apple"},
    {"id": "inStock", "key": "inStock", "name": "In Stock", "type": "boolean", "required": true, "defaultValue": true}
  ]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for templates
SELECT setval('templates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM templates));
