# Modern Web App

A modern, responsive web application built with Next.js 15, featuring content management capabilities, user authentication, and admin functionality.

## 🚀 Features

### Core Features
- **Responsive Header** with company logo and navigation links
- **Image Slider** with auto-play functionality using embla-carousel
- **Image Gallery** with filtering, search, and pagination
- **Video Slider** with custom controls
- **Footer** with social media links and newsletter subscription
- **Sign In/Sign Up** with authentication infrastructure
- **Admin Dashboard** preparation with role-based access

### Technical Features
- **Database Integration** with Prisma ORM
- **API Routes** for CRUD operations
- **Type Safety** with TypeScript
- **Modern UI** with shadcn/ui components
- **Responsive Design** with Tailwind CSS
- **Performance Optimized** with Next.js Image optimization
- **Error Handling** with fallback UI

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Database**: SQLite with Prisma ORM
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Carousel**: embla-carousel-react
- **Form Handling**: React Hook Form + Zod
- **State Management**: Zustand
- **Development**: ESLint, TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd modern-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables in `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Setup database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   │   ├── media/    # Media management API
│   │   └── sliders/  # Slider management API
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   └── lib/          # Utilities and helpers
├── components/
│   ├── layout/       # Header, Footer components
│   ├── media/        # Image/Video sliders and gallery
│   └── ui/           # shadcn/ui components
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Database seed script
└── public/           # Static assets
```

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User management with roles (USER/ADMIN)
- **media_items** - Images and videos storage
- **media_categories** - Content categorization
- **sliders** - Dynamic slider configuration
- **slider_items** - Individual slide content
- **navigation_links** - Site navigation structure
- **social_media_links** - Social media integration
- **site_config** - Dynamic site settings

## 🎨 Components

### Header Component
- Responsive navigation with mobile menu
- Company logo and branding
- Sign in/sign up buttons
- Dropdown navigation support

### Image Slider
- Auto-play with configurable intervals
- Navigation arrows and dots
- Call-to-action buttons
- Responsive design

### Gallery Component
- Grid and list view modes
- Category filtering
- Search functionality
- Modal preview
- Pagination support

### Video Slider
- Custom video controls
- Progress bar with seek
- Volume controls
- Fullscreen support

### Footer Component
- Company information
- Social media links
- Newsletter subscription
- Multi-column layout

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 API Routes

### Media Management
- `GET /api/media` - Get all media items with pagination
- `POST /api/media` - Create new media item
- `GET /api/media/[id]` - Get specific media item
- `PUT /api/media/[id]` - Update media item
- `DELETE /api/media/[id]` - Delete media item

### Categories
- `GET /api/media/categories` - Get all categories
- `POST /api/media/categories` - Create new category

### Sliders
- `GET /api/sliders` - Get all sliders
- `POST /api/sliders` - Create new slider

## 🎯 Usage Examples

### Using the Image Slider
```typescript
import { ImageSlider } from '@/components/media/ImageSlider'

const slides = [
  {
    id: '1',
    title: 'Welcome',
    subtitle: 'Experience the Future',
    imageUrl: '/path/to/image.jpg',
    callToAction: 'Get Started',
    callToActionUrl: '#features'
  }
]

<ImageSlider 
  slides={slides}
  autoPlay={true}
  autoPlayInterval={5000}
  showArrows={true}
  showDots={true}
/>
```

### Using the Gallery
```typescript
import { Gallery } from '@/components/media/Gallery'

<Gallery 
  mediaItems={mediaItems}
  categories={categories}
  showSearch={true}
  showFilters={true}
/>
```

## 🔒 Security Features

- **Type Safety** with TypeScript
- **Input Validation** with Zod schemas
- **SQL Injection Protection** with Prisma ORM
- **XSS Protection** with React's built-in safeguards
- **Image Optimization** with Next.js Image component

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance

- **Code Splitting** with Next.js automatic splitting
- **Image Optimization** with Next.js Image component
- **Lazy Loading** for media content
- **Optimized Bundle** with tree shaking
- **Fast Refresh** during development

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Image Loading Issues
If you encounter image loading errors, ensure:
1. Next.js config includes the image hostnames
2. Images are accessible from the specified URLs
3. Network connectivity is stable

### Database Issues
If you encounter database issues:
1. Run `npm run db:push` to sync schema
2. Run `npm run db:seed` to populate with sample data
3. Check your `.env` file for correct DATABASE_URL

### Development Server Issues
If the development server doesn't start:
1. Ensure all dependencies are installed (`npm install`)
2. Check if port 3000 is available
3. Clear node_modules and reinstall if needed

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**