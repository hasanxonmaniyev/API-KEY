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
  'Student & Developer Profile (with Photo)',
  'Personal profile with avatar image, career details and skills for portfolio apps',
  '[
    {"id": "avatar", "key": "avatar", "name": "Profile Photo", "type": "image", "required": false, "defaultValue": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"},
    {"id": "firstName", "key": "firstName", "name": "First Name", "type": "text", "required": true, "defaultValue": "Hasan"},
    {"id": "lastName", "key": "lastName", "name": "Last Name", "type": "text", "required": true, "defaultValue": "Maniyev"},
    {"id": "age", "key": "age", "name": "Age", "type": "number", "required": true, "defaultValue": 23},
    {"id": "profession", "key": "profession", "name": "Profession", "type": "text", "required": true, "defaultValue": "Full-Stack Developer"},
    {"id": "email", "key": "email", "name": "Email Address", "type": "email", "required": false, "defaultValue": "hasan@example.com"},
    {"id": "city", "key": "city", "name": "City", "type": "text", "required": true, "defaultValue": "Tashkent"},
    {"id": "carName", "key": "carName", "name": "Car Name", "type": "text", "required": false, "defaultValue": "BMW M5 Competition"},
    {"id": "fianceName", "key": "fianceName", "name": "Fiancé Name", "type": "text", "required": false, "defaultValue": "Zulayho"}
  ]'::jsonb,
  true
),
(
  2,
  'E-Commerce Product Catalog (with Image)',
  'Dynamic products with image preview, price, brand, rating and stock status',
  '[
    {"id": "productImage", "key": "productImage", "name": "Product Image", "type": "image", "required": true, "defaultValue": "https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80"},
    {"id": "productName", "key": "productName", "name": "Product Name", "type": "text", "required": true, "defaultValue": "iPhone 17 Pro"},
    {"id": "price", "key": "price", "name": "Price ($)", "type": "number", "required": true, "defaultValue": 1199},
    {"id": "brand", "key": "brand", "name": "Brand", "type": "text", "required": true, "defaultValue": "Apple"},
    {"id": "color", "key": "color", "name": "Color Accent", "type": "color", "required": false, "defaultValue": "#4f46e5"},
    {"id": "inStock", "key": "inStock", "name": "In Stock", "type": "boolean", "required": true, "defaultValue": true},
    {"id": "description", "key": "description", "name": "Product Description", "type": "textarea", "required": false, "defaultValue": "Next-generation flagship smartphone with titanium body."}
  ]'::jsonb,
  true
),
(
  3,
  'Cinema & Movie Hub (with Poster)',
  'Movie card API with poster image, release year, rating and genre tags',
  '[
    {"id": "poster", "key": "poster", "name": "Movie Poster", "type": "image", "required": true, "defaultValue": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"},
    {"id": "title", "key": "title", "name": "Movie Title", "type": "text", "required": true, "defaultValue": "Interstellar"},
    {"id": "director", "key": "director", "name": "Director", "type": "text", "required": true, "defaultValue": "Christopher Nolan"},
    {"id": "year", "key": "year", "name": "Release Year", "type": "number", "required": true, "defaultValue": 2014},
    {"id": "rating", "key": "rating", "name": "IMDb Rating", "type": "number", "required": true, "defaultValue": 8.7},
    {"id": "isAvailable", "key": "isAvailable", "name": "Available to Stream", "type": "boolean", "required": true, "defaultValue": true}
  ]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for templates
SELECT setval('templates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM templates));
