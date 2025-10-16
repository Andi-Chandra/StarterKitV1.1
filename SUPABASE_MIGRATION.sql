-- =====================================================
-- Supabase Migration Script
-- Run this in your Supabase Dashboard > SQL Editor
-- =====================================================

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Create Media Categories table
CREATE TABLE IF NOT EXISTS media_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Media Items table
CREATE TABLE IF NOT EXISTS media_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    dimensions TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category_id TEXT REFERENCES media_categories(id),
    created_by TEXT REFERENCES users(id)
);

-- Create Sliders table
CREATE TABLE IF NOT EXISTS sliders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_play BOOLEAN DEFAULT TRUE,
    auto_play_interval INTEGER DEFAULT 5000,
    loop BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Slider Items table
CREATE TABLE IF NOT EXISTS slider_items (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    call_to_action TEXT,
    call_to_action_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    slider_id TEXT NOT NULL REFERENCES sliders(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE
);

-- Create Site Config table
CREATE TABLE IF NOT EXISTS site_config (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT REFERENCES users(id)
);

-- Create Navigation Links table
CREATE TABLE IF NOT EXISTS navigation_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    is_external BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    parent_id TEXT REFERENCES navigation_links(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Social Media Links table
CREATE TABLE IF NOT EXISTS social_media_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Insert Sample Data
-- =====================================================

-- Insert sample media categories
INSERT INTO media_categories (id, name, slug, description) VALUES 
('cmgmzzpsk0000uf1lapo37h0d', 'Nature', 'nature', 'Beautiful nature photography'),
('cmgmzzpsm0001uf1l5sjwrre4', 'Architecture', 'architecture', 'Modern building designs'),
('cmgmzzpso0003uf1lhdupqbtt', 'People', 'people', 'People and lifestyle photos')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, name, role) VALUES 
('cmgmzzpsp0005uf1la6n6jt2d', 'admin@example.com', 'Admin User', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- Insert sample media items
INSERT INTO media_items (id, title, description, file_url, file_type, is_featured, sort_order, category_id, created_by) VALUES 
('cmgmzzpsr0007uf1lfezfoz9x', 'Mountain Landscape', 'Beautiful mountain scenery with sunset', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', 'IMAGE', true, 1, 'cmgmzzpsk0000uf1lapo37h0d', 'cmgmzzpsp0005uf1la6n6jt2d'),
('cmgmzzpss000buf1l4deu4v9u', 'City Architecture', 'Modern building design', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop', 'IMAGE', true, 3, 'cmgmzzpsm0001uf1l5sjwrre4', 'cmgmzzpsp0005uf1la6n6jt2d'),
('cmgmzzpsu000luf1lytg5bdxt', 'Team Meeting', 'Collaborative work session', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1920&h=1080&fit=crop', 'IMAGE', false, 5, 'cmgmzzpso0003uf1lhdupqbtt', 'cmgmzzpsp0005uf1la6n6jt2d'),
('cmgmzzpst000guf1lri8lrldm', 'Product Demo Video', 'See our product in action', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'VIDEO', true, 7, 'cmgmzzpso0003uf1lhdupqbtt', 'cmgmzzpsp0005uf1la6n6jt2d'),
('cmgmzzpst000juf1l3vfb7mjx', 'Company Introduction', 'Learn about our company', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'VIDEO', false, 8, 'cmgmzzpso0003uf1lhdupqbtt', 'cmgmzzpsp0005uf1la6n6jt2d')
ON CONFLICT (id) DO NOTHING;

-- Insert sample sliders
INSERT INTO sliders (id, name, type, is_active, auto_play, auto_play_interval, loop) VALUES 
('cmgmzzpsw000muf1ls639qw4u', 'Hero Image Slider', 'IMAGE', true, true, 5000, true),
('cmgmzzpsx000nuf1lgvko2wc6', 'Video Content Slider', 'VIDEO', true, false, 8000, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample slider items
INSERT INTO slider_items (id, title, subtitle, call_to_action, call_to_action_url, sort_order, slider_id, media_id) VALUES 
('cmgmzzpsy000tuf1liopd3jku', 'Welcome to Our Modern Web App', 'Experience the Future', 'Get Started', '#features', 1, 'cmgmzzpsw000muf1ls639qw4u', 'cmgmzzpsr0007uf1lfezfoz9x'),
('cmgmzzpsy000ruf1lq92mpd42', 'Beautiful Image Gallery', 'Browse Our Collection', 'View Gallery', '#gallery', 2, 'cmgmzzpsw000muf1ls639qw4u', 'cmgmzzpss000buf1l4deu4v9u'),
('cmgmzzpsy000quf1lwf3advw6', 'Video Content Experience', 'Watch & Learn', 'Watch Now', '#videos', 3, 'cmgmzzpsw000muf1ls639qw4u', 'cmgmzzpsu000luf1lytg5bdxt'),
('cmgmzzpt0000vuf1leewpflt8', 'Product Demo Video', 'See It In Action', 'Learn More', '#', 1, 'cmgmzzpsx000nuf1lgvko2wc6', 'cmgmzzpst000guf1lri8lrldm'),
('cmgmzzpt0000xuf1l404wvz1u', 'Company Introduction', 'Who We Are', 'About Us', '#', 2, 'cmgmzzpsx000nuf1lgvko2wc6', 'cmgmzzpst000juf1l3vfb7mjx')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Create Indexes for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_media_items_category_id ON media_items(category_id);
CREATE INDEX IF NOT EXISTS idx_media_items_created_by ON media_items(created_by);
CREATE INDEX IF NOT EXISTS idx_media_items_file_type ON media_items(file_type);
CREATE INDEX IF NOT EXISTS idx_media_items_is_featured ON media_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_slider_items_slider_id ON slider_items(slider_id);
CREATE INDEX IF NOT EXISTS idx_slider_items_media_id ON slider_items(media_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_navigation_links_parent_id ON navigation_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_links_is_active ON navigation_links(is_active);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Create RLS Policies
-- =====================================================

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);

-- Everyone can read public data
CREATE POLICY "Everyone can view media items" ON media_items FOR SELECT USING (true);
CREATE POLICY "Everyone can view media categories" ON media_categories FOR SELECT USING (true);
CREATE POLICY "Everyone can view sliders" ON sliders FOR SELECT USING (true);
CREATE POLICY "Everyone can view slider items" ON slider_items FOR SELECT USING (true);
CREATE POLICY "Everyone can view site config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Everyone can view navigation links" ON navigation_links FOR SELECT USING (true);
CREATE POLICY "Everyone can view social media links" ON social_media_links FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage media items" ON media_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage categories" ON media_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sliders" ON sliders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage slider items" ON slider_items FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- Migration Complete!
-- =====================================================