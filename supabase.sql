-- ============================================
-- Supabase PostgreSQL Migration Script
-- ============================================
-- Created: $(date)
-- Project: Next.js Full-Stack Application
-- Database: Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Drop existing tables if they exist (for clean migration)
-- ============================================
DROP TABLE IF EXISTS "likes" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "follows" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "media" CASCADE;
DROP TABLE IF EXISTS "sliders" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ============================================
-- Create Users table
-- ============================================
CREATE TABLE "users" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(255),
    "avatar" TEXT,
    "bio" TEXT,
    "role" VARCHAR(20) DEFAULT 'user',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Create Categories table
-- ============================================
CREATE TABLE "categories" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7) DEFAULT '#6366f1',
    "icon" VARCHAR(50),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Create Media table
-- ============================================
CREATE TABLE "media" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "url" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),
    "size" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ============================================
-- Create Sliders table
-- ============================================
CREATE TABLE "sliders" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "link_text" VARCHAR(100),
    "order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Create Posts table
-- ============================================
CREATE TABLE "posts" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "featured_image" TEXT,
    "status" VARCHAR(20) DEFAULT 'draft',
    "type" VARCHAR(20) DEFAULT 'post',
    "author_id" UUID NOT NULL,
    "category_id" UUID,
    "published_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
);

-- ============================================
-- Create Comments table
-- ============================================
CREATE TABLE "comments" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "content" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "parent_id" UUID,
    "status" VARCHAR(20) DEFAULT 'approved',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
    FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE
);

-- ============================================
-- Create Likes table
-- ============================================
CREATE TABLE "likes" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
    UNIQUE("user_id", "post_id")
);

-- ============================================
-- Create Follows table
-- ============================================
CREATE TABLE "follows" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE("follower_id", "following_id")
);

-- ============================================
-- Create Indexes for better performance
-- ============================================

-- Users table indexes
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_username" ON "users"("username");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- Categories table indexes
CREATE INDEX "idx_categories_slug" ON "categories"("slug");
CREATE INDEX "idx_categories_name" ON "categories"("name");

-- Media table indexes
CREATE INDEX "idx_media_user_id" ON "media"("user_id");
CREATE INDEX "idx_media_type" ON "media"("type");
CREATE INDEX "idx_media_created_at" ON "media"("created_at");

-- Sliders table indexes
CREATE INDEX "idx_sliders_order" ON "sliders"("order");
CREATE INDEX "idx_sliders_is_active" ON "sliders"("is_active");

-- Posts table indexes
CREATE INDEX "idx_posts_author_id" ON "posts"("author_id");
CREATE INDEX "idx_posts_category_id" ON "posts"("category_id");
CREATE INDEX "idx_posts_status" ON "posts"("status");
CREATE INDEX "idx_posts_type" ON "posts"("type");
CREATE INDEX "idx_posts_slug" ON "posts"("slug");
CREATE INDEX "idx_posts_published_at" ON "posts"("published_at");
CREATE INDEX "idx_posts_created_at" ON "posts"("created_at");

-- Comments table indexes
CREATE INDEX "idx_comments_author_id" ON "comments"("author_id");
CREATE INDEX "idx_comments_post_id" ON "comments"("post_id");
CREATE INDEX "idx_comments_parent_id" ON "comments"("parent_id");
CREATE INDEX "idx_comments_status" ON "comments"("status");
CREATE INDEX "idx_comments_created_at" ON "comments"("created_at");

-- Likes table indexes
CREATE INDEX "idx_likes_user_id" ON "likes"("user_id");
CREATE INDEX "idx_likes_post_id" ON "likes"("post_id");
CREATE INDEX "idx_likes_created_at" ON "likes"("created_at");

-- Follows table indexes
CREATE INDEX "idx_follows_follower_id" ON "follows"("follower_id");
CREATE INDEX "idx_follows_following_id" ON "follows"("following_id");
CREATE INDEX "idx_follows_created_at" ON "follows"("created_at");

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Users policies
CREATE POLICY "Users can view their own profile" ON "users" FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own profile" ON "users" FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert their own profile" ON "users" FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Media policies
CREATE POLICY "Users can view their own media" ON "media" FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert their own media" ON "media" FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own media" ON "media" FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own media" ON "media" FOR DELETE USING (auth.uid()::text = user_id::text);

-- Posts policies
CREATE POLICY "Anyone can view published posts" ON "posts" FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view their own posts" ON "posts" FOR SELECT USING (auth.uid()::text = author_id::text);
CREATE POLICY "Users can insert their own posts" ON "posts" FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);
CREATE POLICY "Users can update their own posts" ON "posts" FOR UPDATE USING (auth.uid()::text = author_id::text);
CREATE POLICY "Users can delete their own posts" ON "posts" FOR DELETE USING (auth.uid()::text = author_id::text);

-- Comments policies
CREATE POLICY "Anyone can view approved comments" ON "comments" FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can insert their own comments" ON "comments" FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);
CREATE POLICY "Users can update their own comments" ON "comments" FOR UPDATE USING (auth.uid()::text = author_id::text);
CREATE POLICY "Users can delete their own comments" ON "comments" FOR DELETE USING (auth.uid()::text = author_id::text);

-- Likes policies
CREATE POLICY "Users can view all likes" ON "likes" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON "likes" FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own likes" ON "likes" FOR DELETE USING (auth.uid()::text = user_id::text);

-- Follows policies
CREATE POLICY "Users can view all follows" ON "follows" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own follows" ON "follows" FOR INSERT WITH CHECK (auth.uid()::text = follower_id::text);
CREATE POLICY "Users can delete their own follows" ON "follows" FOR DELETE USING (auth.uid()::text = follower_id::text);

-- ============================================
-- Insert Sample Data
-- ============================================

-- Sample Categories
INSERT INTO "categories" ("name", "slug", "description", "color", "icon") VALUES
('Technology', 'technology', 'Latest tech news and updates', '#3b82f6', 'Cpu'),
('Design', 'design', 'Design tips and inspiration', '#8b5cf6', 'Palette'),
('Development', 'development', 'Programming tutorials and guides', '#10b981', 'Code'),
('Business', 'business', 'Business insights and strategies', '#f59e0b', 'Briefcase'),
('Lifestyle', 'lifestyle', 'Lifestyle tips and trends', '#ec4899', 'Heart');

-- Sample Users
INSERT INTO "users" ("id", "email", "username", "name", "bio", "role") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'johndoe', 'John Doe', 'Full-stack developer and tech enthusiast', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'janesmith', 'Jane Smith', 'UI/UX designer with a passion for creativity', 'user'),
('550e8400-e29b-41d4-a716-446655440003', 'mike.wilson@example.com', 'mikewilson', 'Mike Wilson', 'Product manager and business strategist', 'user');

-- Sample Media
INSERT INTO "media" ("url", "type", "name", "size", "width", "height", "alt", "user_id") VALUES
('https://picsum.photos/800/600?random=1', 'image', 'sample-image-1.jpg', 245760, 800, 600, 'Sample image 1', '550e8400-e29b-41d4-a716-446655440001'),
('https://picsum.photos/800/600?random=2', 'image', 'sample-image-2.jpg', 245760, 800, 600, 'Sample image 2', '550e8400-e29b-41d4-a716-446655440002'),
('https://picsum.photos/800/600?random=3', 'image', 'sample-image-3.jpg', 245760, 800, 600, 'Sample image 3', '550e8400-e29b-41d4-a716-446655440003');

-- Sample Sliders
INSERT INTO "sliders" ("title", "description", "image", "link", "link_text", "order", "is_active") VALUES
('Welcome to Our Platform', 'Discover amazing content and connect with our community', 'https://picsum.photos/1200/400?random=10', '/about', 'Learn More', 1, true),
('Latest Features', 'Explore our newest tools and capabilities', 'https://picsum.photos/1200/400?random=11', '/features', 'View Features', 2, true),
('Join Our Community', 'Connect with thousands of users worldwide', 'https://picsum.photos/1200/400?random=12', '/signup', 'Get Started', 3, true);

-- Sample Posts
INSERT INTO "posts" ("title", "slug", "content", "excerpt", "featured_image", "status", "type", "author_id", "category_id", "published_at") VALUES
('Getting Started with Next.js 15', 'getting-started-nextjs-15', '# Getting Started with Next.js 15

Next.js 15 brings exciting new features and improvements. In this comprehensive guide, we''ll explore everything you need to know to get started.

## Key Features

- Improved App Router
- Enhanced performance
- Better developer experience
- Built-in optimizations

## Installation

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

## Conclusion

Next.js 15 is a powerful framework that makes building React applications easier than ever.', 'Learn how to get started with Next.js 15 and its new features', 'https://picsum.photos/800/400?random=20', 'published', 'post', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM "categories" WHERE slug = 'development'), CURRENT_TIMESTAMP - INTERVAL '1 day'),

('Modern UI Design Principles', 'modern-ui-design-principles', '# Modern UI Design Principles

Creating beautiful and functional user interfaces requires understanding key design principles.

## Core Principles

1. **Consistency**: Maintain visual consistency throughout your design
2. **Hierarchy**: Guide users through clear visual hierarchy
3. **Accessibility**: Design for all users
4. **Performance**: Optimize for fast loading times

## Best Practices

- Use proper color contrast
- Implement responsive design
- Focus on user experience
- Test with real users

## Tools and Resources

- Figma for design
- Tailwind CSS for styling
- Storybook for component development', 'Explore essential UI design principles for modern web applications', 'https://picsum.photos/800/400?random=21', 'published', 'post', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM "categories" WHERE slug = 'design'), CURRENT_TIMESTAMP - INTERVAL '2 days'),

('Building Scalable Business Applications', 'building-scalable-business-apps', '# Building Scalable Business Applications

Learn how to architect applications that can grow with your business needs.

## Architecture Patterns

### Microservices
- Service-oriented architecture
- Independent deployment
- Technology diversity

### Monolith with Modules
- Simpler deployment
- Shared database
- Tight coupling

## Key Considerations

- Database design
- API design
- Security
- Performance
- Monitoring

## Technology Stack

- Backend: Node.js/Python
- Database: PostgreSQL/MongoDB
- Caching: Redis
- Message Queue: RabbitMQ', 'Discover strategies for building applications that scale with your business', 'https://picsum.photos/800/400?random=22', 'published', 'post', '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM "categories" WHERE slug = 'business'), CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Sample Comments
INSERT INTO "comments" ("content", "author_id", "post_id", "status") VALUES
('Great article! This really helped me understand Next.js 15 better.', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM "posts" WHERE slug = 'getting-started-nextjs-15'), 'approved'),
('I''ve been using Next.js for a while, and version 15 is definitely a game changer!', '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM "posts" WHERE slug = 'getting-started-nextjs-15'), 'approved'),
('Excellent design principles! I especially appreciate the focus on accessibility.', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM "posts" WHERE slug = 'modern-ui-design-principles'), 'approved'),
('This is exactly what I needed for my current project. Thank you for sharing!', '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM "posts" WHERE slug = 'modern-ui-design-principles'), 'approved'),
('Very insightful! The architecture patterns section is particularly useful.', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM "posts" WHERE slug = 'building-scalable-business-applications'), 'approved'),
('Do you have any recommendations for monitoring tools?', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM "posts" WHERE slug = 'building-scalable-business-applications'), 'approved');

-- Sample Likes
INSERT INTO "likes" ("user_id", "post_id") VALUES
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM "posts" WHERE slug = 'getting-started-nextjs-15')),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM "posts" WHERE slug = 'getting-started-nextjs-15')),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM "posts" WHERE slug = 'modern-ui-design-principles')),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM "posts" WHERE slug = 'modern-ui-design-principles')),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM "posts" WHERE slug = 'building-scalable-business-applications')),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM "posts" WHERE slug = 'building-scalable-business-applications'));

-- Sample Follows
INSERT INTO "follows" ("follower_id", "following_id") VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');

-- ============================================
-- Create Functions for common operations
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sliders_updated_at BEFORE UPDATE ON "sliders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON "posts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON "comments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Create Views for common queries
-- ============================================

-- View for posts with author and category info
CREATE VIEW "posts_with_details" AS
SELECT 
    p.*,
    u.username as author_username,
    u.name as author_name,
    u.avatar as author_avatar,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT c.id) as comment_count
FROM "posts" p
LEFT JOIN "users" u ON p.author_id = u.id
LEFT JOIN "categories" c ON p.category_id = c.id
LEFT JOIN "likes" l ON p.id = l.post_id
LEFT JOIN "comments" c ON p.id = c.post_id AND c.status = 'approved'
GROUP BY p.id, u.username, u.name, u.avatar, c.name, c.slug, c.color;

-- View for user stats
CREATE VIEW "user_stats" AS
SELECT 
    u.id,
    u.username,
    u.name,
    u.avatar,
    COUNT(DISTINCT p.id) as post_count,
    COUNT(DISTINCT f1.id) as follower_count,
    COUNT(DISTINCT f2.id) as following_count,
    COUNT(DISTINCT l.id) as like_count
FROM "users" u
LEFT JOIN "posts" p ON u.id = p.author_id AND p.status = 'published'
LEFT JOIN "follows" f1 ON u.id = f1.following_id
LEFT JOIN "follows" f2 ON u.id = f2.follower_id
LEFT JOIN "likes" l ON u.id = l.user_id
GROUP BY u.id, u.username, u.name, u.avatar;

-- ============================================
-- Migration Complete!
-- ============================================

-- Summary of created tables:
-- 1. users - User accounts and profiles
-- 2. categories - Content categories
-- 3. media - Media files and uploads
-- 4. sliders - Homepage sliders
-- 5. posts - Blog posts and content
-- 6. comments - Post comments
-- 7. likes - Post likes
-- 8. follows - User follows

-- Sample data included:
-- 5 categories
-- 3 users
-- 3 media items
-- 3 sliders
-- 3 posts
-- 6 comments
-- 6 likes
-- 6 follows

-- Features implemented:
-- UUID primary keys
-- Row Level Security (RLS)
-- Performance indexes
-- Foreign key constraints
-- Updated_at triggers
-- Database views
-- Sample data for testing

-- Database is ready for production use!