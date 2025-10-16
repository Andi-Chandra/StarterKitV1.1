# Technical Documentation - Modern Web App
*Berdasarkan codeguide-starter-lite*

## Project Overview

A modern, responsive web application built on top of **codeguide-starter-lite**, featuring content management capabilities, user authentication, and admin functionality. The app will showcase company information through various media formats including image sliders, galleries, and video content.

## Technology Stack

### Core Framework (Berdasarkan codeguide-starter-lite)
- **Framework**: Next.js 15.5.4 with App Router + Turbopack
- **Language**: TypeScript 5
- **UI Components**: shadcn/ui dengan Radix UI components
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation
- **Theme**: next-themes untuk dark/light mode

### Backend & Database (Sudah tersedia)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk.js v6.27.1
- **ORM**: Supabase Client (built-in)
- **Real-time**: Supabase Realtime

### Additional Libraries (Sudah tersedia)
- **Carousel**: embla-carousel-react (untuk sliders)
- **Date Handling**: date-fns
- **Charts**: recharts (untuk admin analytics)
- **Toast Notifications**: sonner
- **Animations**: tw-animate-css

---

## Core Features

### 1. Authentication System (Clerk.js Integration)
- **User Registration/Sign In**: Email/password, social login options
- **Session Management**: Secure token-based authentication
- **Role-based Access**: User vs Admin permissions
- **Profile Management**: User profile editing
- **Middleware Protection**: Route protection dengan middleware.ts

### 2. Content Management
- **Image Slider**: Dynamic hero section dengan embla-carousel
- **Image Gallery**: Grid-based gallery dengan filtering
- **Video Slider**: Video content carousel
- **Media Upload**: Admin interface untuk content management
- **Responsive Design**: Mobile-first approach

### 3. Navigation & Layout
- **Responsive Header**: Company logo, navigation links
- **Mobile Menu**: Hamburger menu untuk mobile devices
- **Footer**: Social media links, company information
- **Breadcrumb Navigation**: Untuk better UX
- **Dark/Light Mode**: Theme switching

### 4. Admin Dashboard
- **Content Management**: CRUD operations untuk media
- **User Management**: View dan manage users
- **Analytics**: Basic usage statistics dengan recharts
- **Settings**: Site configuration
- **Real-time Updates**: Supabase realtime subscriptions

---

## User Flow

### Public User Flow
```
1. Landing Page
   ├── View header dengan company branding
   ├── Navigate melalui berbagai sections
   ├── Interact dengan image slider (embla-carousel)
   ├── Browse image gallery dengan filter
   ├── Watch video content di slider
   └── View footer dengan social links

2. Authentication Flow (Clerk.js)
   ├── Click Sign In
   ├── Pilih authentication method
   ├── Complete authentication
   └── Redirect ke dashboard/profile

3. Content Interaction
   ├── View image slider (auto-play/manual)
   ├── Browse gallery dengan filtering
   ├── Watch videos di slider
   └── Share content ke social media
```

### Admin User Flow
```
1. Admin Authentication
   ├── Sign in dengan admin credentials
   └── Access admin dashboard

2. Content Management
   ├── Upload new images/videos
   ├── Edit existing content
   ├── Organize media ke categories
   └── Delete unwanted content

3. User Management
   ├── View semua registered users
   ├── Manage user permissions
   └── Handle user reports/issues

4. Site Configuration
   ├── Update company information
   ├── Manage navigation links
   ├── Configure social media links
   └── Update site settings
```

---

## Database Schema (PostgreSQL dengan RLS)

### Users Table (Clerk Integration)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE user_role AS ENUM ('user', 'admin');
```

### Media Categories
```sql
CREATE TABLE media_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Media Items
```sql
CREATE TABLE media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type media_type NOT NULL,
    file_size INTEGER,
    dimensions JSONB, -- {width: number, height: number}
    category_id UUID REFERENCES media_categories(id),
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE media_type AS ENUM ('image', 'video');
```

### Sliders (embla-carousel Integration)
```sql
CREATE TABLE sliders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type slider_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_play BOOLEAN DEFAULT TRUE,
    auto_play_interval INTEGER DEFAULT 5000, -- milliseconds
    loop BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE slider_type AS ENUM ('image', 'video', 'mixed');
```

### Slider Items
```sql
CREATE TABLE slider_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slider_id UUID REFERENCES sliders(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
    title VARCHAR(255),
    subtitle TEXT,
    call_to_action TEXT,
    call_to_action_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Site Configuration
```sql
CREATE TABLE site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Navigation Links
```sql
CREATE TABLE navigation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    is_external BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    parent_id UUID REFERENCES navigation_links(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Social Media Links
```sql
CREATE TABLE social_media_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) NOT NULL, -- Lucide icon names
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Row Level Security (RLS) Policies

### Users Table RLS
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users dapat view profile mereka sendiri
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

-- Users dapat update profile mereka sendiri
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Admins dapat view semua users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );

-- Admins dapat update semua users
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );
```

### Media Items RLS
```sql
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Everyone dapat view active media
CREATE POLICY "Everyone can view active media" ON media_items
    FOR SELECT USING (true);

-- Hanya admins yang dapat create media
CREATE POLICY "Admins can create media" ON media_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );

-- Hanya admins yang dapat update media
CREATE POLICY "Admins can update media" ON media_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );

-- Hanya admins yang dapat delete media
CREATE POLICY "Admins can delete media" ON media_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );
```

---

## Project Structure (Berdasarkan codeguide-starter-lite)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── media/
│   │   └── users/
│   ├── api/
│   │   ├── auth/
│   │   ├── media/
│   │   └── admin/
│   ├── gallery/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── (shadcn components - already available)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx (embla-carousel)
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── theme-toggle.tsx
│   │   └── toast.tsx (sonner)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── MobileMenu.tsx
│   ├── media/
│   │   ├── ImageSlider.tsx (embla-carousel)
│   │   ├── VideoSlider.tsx (embla-carousel)
│   │   ├── Gallery.tsx
│   │   └── MediaCard.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── MediaManager.tsx
│       └── UserManager.tsx
├── lib/
│   ├── utils.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── clerk/
│   │   └── server.ts
│   └── validations/
│       └── schemas.ts (Zod)
└── middleware.ts (Clerk protection)
```

---

## API Routes Structure

### Authentication Routes (Clerk.js)
- `/api/auth/callback` - Clerk authentication callback
- `/api/auth/logout` - Logout endpoint
- `/api/auth/me` - Get current user info

### Media Routes
- `/api/media` - CRUD operations untuk media items
- `/api/media/upload` - File upload endpoint
- `/api/media/categories` - Media categories management
- `/api/media/gallery` - Public gallery endpoint

### Slider Routes
- `/api/sliders` - CRUD operations untuk sliders
- `/api/sliders/[id]/items` - Slider items management

### Admin Routes
- `/api/admin/users` - User management
- `/api/admin/config` - Site configuration
- `/api/admin/navigation` - Navigation management
- `/api/admin/social` - Social media links

---

## Component Implementation Details

### Image Slider (embla-carousel)
```typescript
// components/media/ImageSlider.tsx
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

export function ImageSlider({ slides, autoPlay = true }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi || !autoPlay) return
    
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [emblaApi, autoPlay])

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container">
        {slides.map((slide, index) => (
          <div className="embla__slide" key={index}>
            {/* Slide content */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Gallery Component
```typescript
// components/media/Gallery.tsx
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Gallery({ mediaItems, categories }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredItems = selectedCategory === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category_id === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Badge 
          variant={selectedCategory === 'all' ? 'default' : 'secondary'}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Badge>
        {categories.map(category => (
          <Badge 
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'secondary'}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Media content */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## Clerk.js Integration

### Middleware Configuration
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/webhooks',
    '/gallery'
  ],
  ignoredRoutes: [
    '/api/webhooks'
  ]
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
```

### Auth Components
```typescript
// components/auth/UserButton.tsx
import { UserButton } from '@clerk/nextjs'

export function UserProfile() {
  return <UserButton afterSignOutUrl="/" />
}

// components/auth/SignInButton.tsx
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function SignInBtn() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserProfile />
      </SignedIn>
    </>
  )
}
```

---

## Supabase Integration

### Client Configuration
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()
```

### Server Configuration
```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const supabase = createServerComponentClient<Database>({
  cookies
})
```

---

## Performance Optimizations

### Image Optimization
- Next.js Image component dengan lazy loading
- Supabase storage optimization
- Responsive images dengan multiple sizes
- WebP format support

### Database Optimization
- Proper indexing pada frequently queried columns
- Supabase connection pooling
- Query optimization dengan proper selects
- Real-time subscriptions untuk updates

### Frontend Optimization
- Code splitting dengan dynamic imports
- Component-level lazy loading
- embla-carousel untuk smooth sliders
- Optimized bundle size

---

## Security Considerations

### Authentication & Authorization
- Clerk.js untuk secure authentication
- JWT token validation
- Role-based access control
- Middleware protection

### Data Protection
- RLS policies di database level
- Input validation dengan Zod
- File upload security
- XSS dan CSRF protection

### API Security
- Rate limiting
- CORS configuration
- Environment variable protection
- Secure headers implementation

---

## Deployment Strategy

### Environment Setup
- **Development**: Local development dengan Supabase local
- **Staging**: Preview deployments di Vercel
- **Production**: Vercel + Supabase Production

### Environment Variables
```env
# Clerk.js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Next.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

---

## Development Timeline

### Week 1: Setup & Foundation
- Clone dan setup codeguide-starter-lite
- Configure Clerk.js dan Supabase
- Database schema creation
- Basic layout components

### Week 2: Core Features
- Image slider dengan embla-carousel
- Gallery implementation
- Video slider
- Basic authentication flow

### Week 3: Admin Dashboard
- Admin interface development
- Content management tools
- User management system
- CRUD operations

### Week 4: Polish & Deployment
- Performance optimization
- Testing dan bug fixes
- Production deployment
- Documentation finalization

---

## Conclusion

Technical documentation ini menyediakan foundation yang komprehensif untuk membangun modern web application menggunakan codeguide-starter-lite. Dengan memanfaatkan tech stack yang sudah tersedia (Next.js, shadcn/ui, Supabase, Clerk.js), kita dapat membangun aplikasi yang scalable, secure, dan maintainable dengan cepat.

Arsitektur ini memungkinkan future enhancements dan scalability, sementara chosen technology stack menyediakan robust tools untuk rapid development dan deployment.