import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create categories
  const natureCategory = await prisma.mediaCategory.create({
    data: {
      name: 'Nature',
      slug: 'nature',
      description: 'Beautiful nature and landscape images'
    }
  })

  const architectureCategory = await prisma.mediaCategory.create({
    data: {
      name: 'Architecture',
      slug: 'architecture',
      description: 'Modern and classical architecture'
    }
  })

  const technologyCategory = await prisma.mediaCategory.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest technology and innovation'
    }
  })

  const businessCategory = await prisma.mediaCategory.create({
    data: {
      name: 'Business',
      slug: 'business',
      description: 'Business and professional settings'
    }
  })

  const designCategory = await prisma.mediaCategory.create({
    data: {
      name: 'Design',
      slug: 'design',
      description: 'Creative design and art'
    }
  })

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  // Create media items
  const mediaItems = await Promise.all([
    prisma.mediaItem.create({
      data: {
        title: 'Mountain Landscape',
        description: 'Beautiful mountain scenery with sunset',
        fileUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
        fileType: 'IMAGE',
        isFeatured: true,
        sortOrder: 1,
        categoryId: natureCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'Ocean View',
        description: 'Calm ocean waters at dawn',
        fileUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop',
        fileType: 'IMAGE',
        isFeatured: false,
        sortOrder: 2,
        categoryId: natureCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'City Architecture',
        description: 'Modern building design',
        fileUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop',
        fileType: 'IMAGE',
        isFeatured: true,
        sortOrder: 3,
        categoryId: architectureCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'Technology Innovation',
        description: 'Latest tech innovations',
        fileUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop',
        fileType: 'IMAGE',
        isFeatured: false,
        sortOrder: 4,
        categoryId: technologyCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'Team Meeting',
        description: 'Collaborative work session',
        fileUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1920&h=1080&fit=crop',
        fileType: 'IMAGE',
        isFeatured: false,
        sortOrder: 5,
        categoryId: businessCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'Product Design',
        description: 'Creative design process',
        fileUrl: 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1920&h=1080&fit=crop',
        fileType: 'IMAGE',
        isFeatured: true,
        sortOrder: 6,
        categoryId: designCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'Product Demo Video',
        description: 'See our product in action',
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        fileType: 'VIDEO',
        isFeatured: true,
        sortOrder: 7,
        categoryId: businessCategory.id,
        createdBy: adminUser.id
      }
    }),
    prisma.mediaItem.create({
      data: {
        title: 'Company Introduction',
        description: 'Learn about our company',
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        fileType: 'VIDEO',
        isFeatured: false,
        sortOrder: 8,
        categoryId: businessCategory.id,
        createdBy: adminUser.id
      }
    })
  ])

  // Create sliders
  const imageSlider = await prisma.slider.create({
    data: {
      name: 'Hero Image Slider',
      type: 'IMAGE',
      isActive: true,
      autoPlay: true,
      autoPlayInterval: 5000,
      loop: true
    }
  })

  const videoSlider = await prisma.slider.create({
    data: {
      name: 'Video Content Slider',
      type: 'VIDEO',
      isActive: true,
      autoPlay: false,
      autoPlayInterval: 8000,
      loop: true
    }
  })

  // Create slider items for image slider
  await Promise.all([
    prisma.sliderItem.create({
      data: {
        sliderId: imageSlider.id,
        mediaId: mediaItems[0].id, // Mountain Landscape
        title: 'Welcome to Our Modern Web App',
        subtitle: 'Experience the Future',
        callToAction: 'Get Started',
        callToActionUrl: '#features',
        sortOrder: 1
      }
    }),
    prisma.sliderItem.create({
      data: {
        sliderId: imageSlider.id,
        mediaId: mediaItems[2].id, // City Architecture
        title: 'Beautiful Image Gallery',
        subtitle: 'Browse Our Collection',
        callToAction: 'View Gallery',
        callToActionUrl: '#gallery',
        sortOrder: 2
      }
    }),
    prisma.sliderItem.create({
      data: {
        sliderId: imageSlider.id,
        mediaId: mediaItems[4].id, // Team Meeting
        title: 'Video Content Experience',
        subtitle: 'Watch & Learn',
        callToAction: 'Watch Now',
        callToActionUrl: '#videos',
        sortOrder: 3
      }
    })
  ])

  // Create slider items for video slider
  await Promise.all([
    prisma.sliderItem.create({
      data: {
        sliderId: videoSlider.id,
        mediaId: mediaItems[6].id, // Product Demo Video
        title: 'Product Demo Video',
        subtitle: 'See It In Action',
        callToAction: 'Learn More',
        callToActionUrl: '#',
        sortOrder: 1
      }
    }),
    prisma.sliderItem.create({
      data: {
        sliderId: videoSlider.id,
        mediaId: mediaItems[7].id, // Company Introduction
        title: 'Company Introduction',
        subtitle: 'Who We Are',
        callToAction: 'About Us',
        callToActionUrl: '#',
        sortOrder: 2
      }
    })
  ])

  // Create navigation links
  const aboutLink = await prisma.navigationLink.create({
    data: {
      title: 'About',
      url: '#about',
      isExternal: false,
      sortOrder: 4,
      isActive: true
    }
  })

  await Promise.all([
    prisma.navigationLink.create({
      data: {
        title: 'Home',
        url: '/',
        isExternal: false,
        sortOrder: 1,
        isActive: true
      }
    }),
    prisma.navigationLink.create({
      data: {
        title: 'Gallery',
        url: '#gallery',
        isExternal: false,
        sortOrder: 2,
        isActive: true
      }
    }),
    prisma.navigationLink.create({
      data: {
        title: 'Videos',
        url: '#videos',
        isExternal: false,
        sortOrder: 3,
        isActive: true
      }
    }),
    aboutLink,
    prisma.navigationLink.create({
      data: {
        title: 'Our Story',
        url: '#story',
        isExternal: false,
        sortOrder: 1,
        isActive: true,
        parentId: aboutLink.id
      }
    }),
    prisma.navigationLink.create({
      data: {
        title: 'Team',
        url: '#team',
        isExternal: false,
        sortOrder: 2,
        isActive: true,
        parentId: aboutLink.id
      }
    }),
    prisma.navigationLink.create({
      data: {
        title: 'Contact',
        url: '#contact',
        isExternal: false,
        sortOrder: 5,
        isActive: true
      }
    })
  ])

  // Create social media links
  await Promise.all([
    prisma.socialMediaLink.create({
      data: {
        platform: 'Facebook',
        url: 'https://facebook.com',
        iconName: 'facebook',
        isActive: true,
        sortOrder: 1
      }
    }),
    prisma.socialMediaLink.create({
      data: {
        platform: 'Twitter',
        url: 'https://twitter.com',
        iconName: 'twitter',
        isActive: true,
        sortOrder: 2
      }
    }),
    prisma.socialMediaLink.create({
      data: {
        platform: 'Instagram',
        url: 'https://instagram.com',
        iconName: 'instagram',
        isActive: true,
        sortOrder: 3
      }
    }),
    prisma.socialMediaLink.create({
      data: {
        platform: 'LinkedIn',
        url: 'https://linkedin.com',
        iconName: 'linkedin',
        isActive: true,
        sortOrder: 4
      }
    }),
    prisma.socialMediaLink.create({
      data: {
        platform: 'GitHub',
        url: 'https://github.com',
        iconName: 'github',
        isActive: true,
        sortOrder: 5
      }
    })
  ])

  // Create site configuration
  await Promise.all([
    prisma.siteConfig.create({
      data: {
        key: 'company_name',
        value: JSON.stringify('Modern Web App'),
        description: 'Company name displayed throughout the site',
        updatedBy: adminUser.id
      }
    }),
    prisma.siteConfig.create({
      data: {
        key: 'company_description',
        value: JSON.stringify('Modern web application showcasing the best in design and functionality.'),
        description: 'Company description for SEO and about section',
        updatedBy: adminUser.id
      }
    }),
    prisma.siteConfig.create({
      data: {
        key: 'contact_email',
        value: JSON.stringify('info@modernwebapp.com'),
        description: 'Contact email address',
        updatedBy: adminUser.id
      }
    }),
    prisma.siteConfig.create({
      data: {
        key: 'contact_phone',
        value: JSON.stringify('+1 (555) 123-4567'),
        description: 'Contact phone number',
        updatedBy: adminUser.id
      }
    }),
    prisma.siteConfig.create({
      data: {
        key: 'contact_address',
        value: JSON.stringify('123 Business St, City, State 12345'),
        description: 'Company address',
        updatedBy: adminUser.id
      }
    })
  ])

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })