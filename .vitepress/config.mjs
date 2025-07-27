import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: "Mohanpathi | System Architect & Full-Stack Engineer",
  description: "Mohanpathi - Expert System Architect specializing in scalable systems, real-time data processing, and enterprise-grade solutions. QuickLinker-ZeroRPM, BrandPulse, Chainly SDK, Distributed Abuse Detection, Attestify projects.",
  
  // SEO and Meta Configuration
  head: [
    // Favicon and Icons
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    
    // SEO Meta Tags
    ['meta', { name: 'theme-color', content: '#dc2626' }],
    ['meta', { name: 'keywords', content: 'mohanpathi, mohanpathi system architect, mohanpathi portfolio, system architect india, full-stack engineer, node.js expert, postgresql developer, redis specialist, real-time systems, microservices architecture, enterprise solutions, scalable web applications, quicklinker zerorpm, brandpulse sentiment analysis, chainly sdk workflow orchestration, distributed abuse detection, attestify cryptographic security, typescript sdk development, kafka streaming, influxdb time series, mongodb developer, kubernetes orchestration, docker containerization, machine learning engineer, cloud native architecture, event driven systems, software engineering portfolio' }],
    ['meta', { name: 'author', content: 'Mohanpathi' }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
    ['meta', { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
    ['meta', { name: 'bingbot', content: 'index, follow' }],
    ['meta', { name: 'revisit-after', content: '7 days' }],
    ['meta', { name: 'rating', content: 'general' }],
    ['meta', { name: 'distribution', content: 'global' }],
    ['meta', { name: 'geography', content: 'India' }],
    ['meta', { name: 'ICBM', content: '20.5937,78.9629' }],
    ['meta', { name: 'DC.title', content: 'Mohanpathi - System Architect & Full-Stack Engineer Portfolio' }],
    ['meta', { name: 'DC.creator', content: 'Mohanpathi' }],
    ['meta', { name: 'DC.subject', content: 'Software Engineering, System Architecture, Portfolio' }],
    ['meta', { name: 'DC.description', content: 'Professional portfolio showcasing enterprise-grade software projects and system architecture expertise' }],
    ['meta', { name: 'DC.language', content: 'en' }],
    ['meta', { name: 'DC.coverage', content: 'Worldwide' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: 'Mohanpathi Portfolio' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    ['meta', { name: 'HandheldFriendly', content: 'true' }],
    ['meta', { name: 'MobileOptimized', content: '320' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
    ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }],
    
    // OpenGraph Meta Tags
    ['meta', { property: 'og:type', content: 'profile' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:locale:alternate', content: 'en_GB' }],
    ['meta', { property: 'og:site_name', content: 'Mohanpathi Portfolio - System Architect & Engineer' }],
    ['meta', { property: 'og:title', content: 'Mohanpathi | Expert System Architect & Full-Stack Engineer Portfolio' }],
    ['meta', { property: 'og:description', content: 'Professional portfolio of Mohanpathi, an expert System Architect specializing in scalable systems, real-time data processing, and enterprise-grade solutions. Featured projects: QuickLinker-ZeroRPM URL shortener, BrandPulse sentiment analysis platform, Chainly SDK workflow orchestration, Distributed Abuse Detection system, and Attestify cryptographic security framework.' }],
    ['meta', { property: 'og:url', content: 'https://starlo-rd.github.io/' }],
    ['meta', { property: 'og:image', content: 'https://starlo-rd.github.io/og-image.jpg' }],
    ['meta', { property: 'og:image:secure_url', content: 'https://starlo-rd.github.io/og-image.jpg' }],
    ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Mohanpathi - Professional System Architect and Full-Stack Engineer Portfolio showcasing enterprise-grade software projects' }],
    ['meta', { property: 'og:updated_time', content: new Date().toISOString() }],
    ['meta', { property: 'profile:first_name', content: 'Mohanpathi' }],
    ['meta', { property: 'profile:username', content: 'mohanpathi' }],
    ['meta', { property: 'article:author', content: 'https://starlo-rd.github.io/' }],
    ['meta', { property: 'article:publisher', content: 'https://starlo-rd.github.io/' }],
    
    // Twitter Card Meta Tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@mohanpathi' }],
    ['meta', { name: 'twitter:creator', content: '@mohanpathi' }],
    ['meta', { name: 'twitter:title', content: 'Mohanpathi | Expert System Architect & Full-Stack Engineer Portfolio' }],
    ['meta', { name: 'twitter:description', content: 'Professional portfolio of Mohanpathi featuring enterprise-grade projects: QuickLinker-ZeroRPM, BrandPulse, Chainly SDK, Distributed Abuse Detection, and Attestify. Specializing in scalable systems, real-time data processing, and cryptographic security.' }],
    ['meta', { name: 'twitter:image', content: 'https://starlo-rd.github.io/og-image.jpg' }],
    ['meta', { name: 'twitter:image:alt', content: 'Mohanpathi Portfolio - System Architect showcasing enterprise software projects' }],
    ['meta', { name: 'twitter:label1', content: 'Specialization' }],
    ['meta', { name: 'twitter:data1', content: 'System Architecture & Full-Stack Engineering' }],
    ['meta', { name: 'twitter:label2', content: 'Technologies' }],
    ['meta', { name: 'twitter:data2', content: 'Node.js, TypeScript, PostgreSQL, Kafka, Kubernetes' }],
    
    // Additional SEO
    ['meta', { name: 'application-name', content: 'Mohanpathi Portfolio' }],
    ['meta', { name: 'msapplication-TileColor', content: '#dc2626' }],
    ['meta', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    
    // Enhanced Structured Data (JSON-LD) - Person Schema
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://starlo-rd.github.io/#person",
      "name": "Mohanpathi",
      "alternateName": ["mohanpathi", "Mohan Pathi"],
      "jobTitle": "System Architect & Full-Stack Engineer",
      "description": "Expert System Architect and Full-Stack Engineer specializing in scalable systems, real-time data processing, enterprise-grade solutions, and cryptographic security. Creator of high-performance applications processing millions of events daily.",
      "url": "https://starlo-rd.github.io/",
      "mainEntityOfPage": "https://starlo-rd.github.io/",
      "image": {
        "@type": "ImageObject",
        "url": "https://starlo-rd.github.io/og-image.jpg",
        "width": 1200,
        "height": 630,
        "caption": "Mohanpathi - System Architect Portfolio"
      },
      "sameAs": [
        "https://github.com/STarLo-rd",
        "https://linkedin.com/in/mohanpathi",
        "https://twitter.com/mohanpathi"
      ],
      "knowsAbout": [
        {
          "@type": "Thing",
          "name": "System Architecture",
          "description": "Enterprise-scale system design and microservices architecture"
        },
        {
          "@type": "Thing",
          "name": "Full-Stack Development",
          "description": "End-to-end web application development with modern technologies"
        },
        {
          "@type": "ComputerLanguage",
          "name": "Node.js",
          "description": "Server-side JavaScript runtime for scalable applications"
        },
        {
          "@type": "ComputerLanguage",
          "name": "TypeScript",
          "description": "Strongly typed programming language for large-scale applications"
        },
        {
          "@type": "SoftwareApplication",
          "name": "PostgreSQL",
          "description": "Advanced relational database management system"
        },
        {
          "@type": "SoftwareApplication",
          "name": "Apache Kafka",
          "description": "Distributed streaming platform for real-time data processing"
        },
        {
          "@type": "SoftwareApplication",
          "name": "Kubernetes",
          "description": "Container orchestration platform for cloud-native applications"
        }
      ],
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "name": "System Architecture Expertise",
          "description": "Proven expertise in designing and implementing enterprise-scale distributed systems"
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Full-Stack Development Mastery",
          "description": "Comprehensive skills in frontend and backend development with modern frameworks"
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Cryptographic Security Implementation",
          "description": "Advanced knowledge in implementing secure payment systems and digital signatures"
        }
      ],
      "hasOccupation": {
        "@type": "Occupation",
        "name": "System Architect",
        "description": "Designs and implements scalable, high-performance software systems",
        "skills": ["System Design", "Microservices", "Distributed Systems", "Performance Optimization", "Security Architecture"]
      },
      "workLocation": {
        "@type": "Place",
        "name": "Remote / India",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 20.5937,
          "longitude": 78.9629
        }
      },
      "email": "mohanpathi.dev@gmail.com",
      "worksFor": {
        "@type": "Organization",
        "name": "Independent Software Architect",
        "description": "Freelance system architect specializing in enterprise solutions"
      }
    })],
    
    // Website Schema
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://starlo-rd.github.io/#website",
      "url": "https://starlo-rd.github.io/",
      "name": "Mohanpathi Portfolio - System Architect & Full-Stack Engineer",
      "description": "Professional portfolio showcasing enterprise-grade software projects and system architecture expertise by Mohanpathi",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "url": "https://starlo-rd.github.io/"
      },
      "about": {
        "@type": "Person",
        "name": "Mohanpathi",
        "jobTitle": "System Architect & Full-Stack Engineer"
      },
      "author": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      },
      "creator": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      },
      "publisher": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://starlo-rd.github.io/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      }
    })],
    
    // Professional Service Schema
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": "https://starlo-rd.github.io/#service",
      "name": "Mohanpathi - System Architecture & Engineering Services",
      "description": "Professional system architecture, full-stack development, and enterprise solution consulting services",
      "url": "https://starlo-rd.github.io/",
      "serviceType": ["System Architecture", "Full-Stack Development", "Enterprise Solutions", "Performance Optimization", "Security Implementation"],
      "provider": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      },
      "areaServed": {
        "@type": "Place",
        "name": "Worldwide"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Software Engineering Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "System Architecture Design",
              "description": "Enterprise-scale system design and microservices architecture"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Full-Stack Development",
              "description": "End-to-end web application development with modern technologies"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Performance Optimization",
              "description": "Application performance tuning and scalability improvements"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Security Implementation",
              "description": "Cryptographic security and secure payment system implementation"
            }
          }
        ]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "mohanpathi.dev@gmail.com",
        "contactType": "customer service",
        "availableLanguage": "English"
      }
    })],
    
    // Enhanced Projects Portfolio Schema
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": "https://starlo-rd.github.io/#portfolio",
      "name": "Mohanpathi's Software Engineering Portfolio",
      "description": "Comprehensive portfolio showcasing enterprise-grade software projects, system architecture expertise, and innovative solutions in scalable systems development",
      "url": "https://starlo-rd.github.io/projects",
      "author": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      },
      "creator": {
        "@type": "Person",
        "@id": "https://starlo-rd.github.io/#person"
      },
      "dateCreated": "2024-01-01",
      "dateModified": new Date().toISOString().split('T')[0],
      "inLanguage": "en-US",
      "hasPart": [
        {
          "@type": "SoftwareApplication",
          "@id": "https://starlo-rd.github.io/docs/quicklinker-zeroRPM/",
          "name": "QuickLinker-ZeroRPM",
          "description": "High-performance URL shortener engineered for massive scale with sub-millisecond response times, 99.99% uptime, and intelligent caching. Built with Node.js, PostgreSQL, and Redis for enterprise-grade reliability.",
          "applicationCategory": ["Web Application", "URL Shortener", "High Performance System"],
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["Node.js", "JavaScript", "TypeScript"],
          "database": ["PostgreSQL", "Redis"],
          "runtimePlatform": ["Node.js", "Docker", "Kubernetes"],
          "applicationSubCategory": "Enterprise URL Management",
          "featureList": ["Sub-millisecond response times", "99.99% uptime", "Intelligent caching", "Real-time analytics", "Cost-optimized architecture"],
          "author": {
            "@type": "Person",
            "@id": "https://starlo-rd.github.io/#person"
          },
          "url": "https://starlo-rd.github.io/docs/quicklinker-zeroRPM/",
          "keywords": ["url shortener", "high performance", "scalable architecture", "node.js", "postgresql", "redis", "microservices"]
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://starlo-rd.github.io/docs/brandpulse/",
          "name": "BrandPulse",
          "description": "Enterprise-scale real-time brand monitoring platform processing 700K+ social media posts per second with advanced sentiment analysis, streaming architecture, and machine learning integration. Built with Node.js, Apache Kafka, and InfluxDB.",
          "applicationCategory": ["Analytics Platform", "Real-time Processing", "Sentiment Analysis"],
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["Node.js", "JavaScript", "Python"],
          "database": ["InfluxDB", "MongoDB"],
          "runtimePlatform": ["Apache Kafka", "Docker", "Kubernetes"],
          "applicationSubCategory": "Social Media Analytics",
          "featureList": ["700K+ posts/second processing", "Real-time sentiment analysis", "Machine learning integration", "Fault-tolerant architecture", "Sub-second dashboard updates"],
          "author": {
            "@type": "Person",
            "@id": "https://starlo-rd.github.io/#person"
          },
          "url": "https://starlo-rd.github.io/docs/brandpulse/",
          "keywords": ["sentiment analysis", "real-time processing", "kafka streaming", "machine learning", "social media monitoring", "influxdb", "brand analytics"]
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://starlo-rd.github.io/docs/chainly-sdk/",
          "name": "Chainly SDK",
          "description": "Enterprise-grade TypeScript workflow orchestration framework with intelligent dependency resolution, advanced error handling, and real-time event-driven execution. Reduces workflow implementation time by 60% with type safety and <1ms execution overhead.",
          "applicationCategory": ["Developer SDK", "Workflow Orchestration", "TypeScript Framework"],
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["TypeScript", "Node.js"],
          "runtimePlatform": ["Node.js", "NPM"],
          "applicationSubCategory": "Workflow Management",
          "featureList": ["60% faster implementation", "80% fewer runtime errors", "<1ms execution overhead", "10,000+ concurrent tasks", "Type-safe workflows"],
          "author": {
            "@type": "Person",
            "@id": "https://starlo-rd.github.io/#person"
          },
          "url": "https://starlo-rd.github.io/docs/chainly-sdk/",
          "keywords": ["typescript sdk", "workflow orchestration", "dependency resolution", "event-driven architecture", "developer tools", "type safety"]
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://starlo-rd.github.io/docs/distributed-abuse-detection/",
          "name": "Distributed Abuse Detection System",
          "description": "Enterprise-scale content moderation system processing 2.5M+ events daily with multi-modal AI inference (text, image, audio), 45ms average latency, and 99.95% availability. Built with Node.js, Go, Kafka, and Kubernetes.",
          "applicationCategory": ["Content Moderation Platform", "Machine Learning System", "Distributed System"],
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["Node.js", "Go", "Python"],
          "database": ["PostgreSQL", "Redis"],
          "runtimePlatform": ["Apache Kafka", "Kubernetes", "Docker"],
          "applicationSubCategory": "AI-Powered Content Moderation",
          "featureList": ["2.5M+ events/day processing", "Multi-modal AI inference", "45ms average latency", "99.95% system availability", "Auto-scaling capabilities"],
          "author": {
            "@type": "Person",
            "@id": "https://starlo-rd.github.io/#person"
          },
          "url": "https://starlo-rd.github.io/docs/distributed-abuse-detection/",
          "keywords": ["content moderation", "machine learning", "distributed systems", "kubernetes", "real-time processing", "ai inference", "auto-scaling"]
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://starlo-rd.github.io/docs/attestify/",
          "name": "Attestify",
          "description": "Enterprise-grade TypeScript SDK ecosystem for cryptographically secure payment commitments using HD wallets, secp256k1 signatures, and distributed trust mechanisms. Features military-grade security and legally binding digital commitments.",
          "applicationCategory": ["Cryptographic SDK", "Payment Security", "Digital Signatures"],
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["TypeScript", "JavaScript"],
          "database": ["MongoDB"],
          "runtimePlatform": ["Node.js", "NPM"],
          "applicationSubCategory": "Cryptographic Security Framework",
          "featureList": ["Military-grade cryptographic security", "HD wallet integration", "Digital signature verification", "Cross-platform compatibility", "Enterprise SDK architecture"],
          "author": {
            "@type": "Person",
            "@id": "https://starlo-rd.github.io/#person"
          },
          "url": "https://starlo-rd.github.io/docs/attestify/",
          "keywords": ["cryptographic security", "digital signatures", "payment commitments", "hd wallets", "typescript sdk", "secp256k1", "enterprise security"]
        }
      ],
      "about": ["System Architecture", "Full-Stack Development", "Enterprise Solutions", "Scalable Systems", "Real-time Processing", "Cryptographic Security"],
      "genre": "Software Engineering Portfolio",
      "keywords": ["mohanpathi portfolio", "system architect", "full-stack engineer", "enterprise software", "scalable systems", "real-time processing", "cryptographic security", "microservices", "node.js expert", "typescript developer"]
    })],
    
    // Breadcrumb Schema
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://starlo-rd.github.io/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Projects",
          "item": "https://starlo-rd.github.io/projects"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Resume",
          "item": "https://starlo-rd.github.io/resume"
        }
      ]
    })]
  ],
  
  // Enhanced Site Configuration for SEO
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',
  
  // Cache and performance optimizations
  cacheDir: './.vitepress/cache',
  outDir: './.vitepress/dist',
  
  // SEO-specific configuration
  ignoreDeadLinks: false,
  mpa: false,
  
  // Custom head injection per page
  transformHead: ({ pageData }) => {
    const head = []
    
    // Add canonical URL for each page
    head.push(['link', { rel: 'canonical', href: `https://starlo-rd.github.io/${pageData.relativePath.replace(/\.md$/, '.html').replace(/index\.html$/, '')}` }])
    
    // Add page-specific meta description
    if (pageData.frontmatter?.description) {
      head.push(['meta', { name: 'description', content: pageData.frontmatter.description }])
    }
    
    // Add page-specific keywords
    if (pageData.frontmatter?.keywords) {
      head.push(['meta', { name: 'keywords', content: pageData.frontmatter.keywords }])
    }
    
    return head
  },
  
  // Enhanced Performance optimizations for SEO
  vite: {
    build: {
      minify: 'terser',
      cssMinify: true,
      rollupOptions: {
        output: {
          // Removed manual chunks to fix build error with Vue externalization
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      target: 'es2020'
    },
    optimizeDeps: {
      include: ['vue', '@vueuse/core']
    },
    ssr: {
      noExternal: ['@vueuse/core']
    }
  },
  
  // SEO-optimized build configuration
  buildEnd: async (siteConfig) => {
    // Generate additional SEO files during build
  },
  
  // Enhanced head configuration for dynamic pages
  transformPageData: (pageData, { siteConfig }) => {
    // Add dynamic meta tags based on page content
    if (pageData.frontmatter && pageData.frontmatter.title) {
      pageData.title = `${pageData.frontmatter.title} | Mohanpathi Portfolio`
      pageData.description = pageData.frontmatter.description || 'Enterprise-grade software project by Mohanpathi - System Architect & Full-Stack Engineer'
    }
  },
  
  // Sitemap Generation
  sitemap: {
    hostname: 'https://starlo-rd.github.io/'
  },
  
  themeConfig: {
    // Navigation bar at the top
    siteTitle: "MOHANPATHI",
    nav: [
      { text: 'Home', link: '/' },
      { 
        text: 'Projects', 
        items: [
          { text: '🚀 QuickLinker-ZeroRPM', link: '/docs/quicklinker-zeroRPM/' },
          { text: '⚡ BrandPulse', link: '/docs/brandpulse/' },
          { text: '⚡ Chainly SDK', link: '/docs/chainly-sdk/' },
          { text: '📋 Template Generator', link: '/docs/template-generator/' },
          { text: '🛡️ Distributed Abuse Detection', link: '/docs/distributed-abuse-detection/' },
          { text: '🔐 Attestify', link: '/docs/attestify/' }
        ]
      },
      { text: 'Resume', link: '/resume' },
      { text: 'Contact', link: 'mailto:mohanpathi.dev@gmail.com' },
    ],

    // Sidebar for specific sections
    sidebar: {
      // Sidebar for ZeroRPM project (unchanged)
      '/docs/quicklinker-zeroRPM/': [
        {
          text: 'QuickLinker-ZeroRPM',
          link: "/docs/quicklinker-zeroRPM",
          items: [
            { text: 'Overview', link: '/docs/quicklinker-zeroRPM/overview.md' },
            {
              text: 'Project Details',
              collapsed: false, // Open by default; set to true to collapse initially
              items: [
                { text: 'Introduction', link: '/docs/quicklinker-zeroRPM/project-overview/introduction' },
                { text: 'Core Goals', link: '/docs/quicklinker-zeroRPM/project-overview/core-goals' },
                { text: 'Roadmap', link: '/docs/quicklinker-zeroRPM/project-overview/roadmap' },
              ],
            },
            {
              text: 'Technical Architecture',
              collapsed: false,
              items: [
                { text: 'Phase 1: Minimum Viable Scaling', link: '/docs/quicklinker-zeroRPM/technical-architecture/phase-1' },
                { text: 'Phase 2: Analytics Pipeline', link: '/docs/quicklinker-zeroRPM/technical-architecture/phase-2' },
                { text: 'Phase 3: Resilience Engineering', link: '/docs/quicklinker-zeroRPM/technical-architecture/phase-3' },
                { text: 'Database Comparison', link: '/docs/quicklinker-zeroRPM/technical-architecture/database-comparison' },
                { text: 'Hosting Options', link: '/docs/quicklinker-zeroRPM/technical-architecture/hosting-options' },
              ],
            },
            {
              text: 'Findings',
              collapsed: false,
              items: [
                { text: 'Feasibility Analysis', link: '/docs/quicklinker-zeroRPM/findings/feasibility' },
                { text: 'Cost Analysis', link: '/docs/quicklinker-zeroRPM/findings/cost-analysis' },
                { text: 'SQLite & LiteFS Insights', link: '/docs/quicklinker-zeroRPM/findings/sqlite-litefs' },
                { text: 'Free Hosting', link: '/docs/quicklinker-zeroRPM/findings/free-hosting' },
              ],
            },
            { text: 'References', link: '/docs/quicklinker-zeroRPM/references' },
          ],
        },
      ],
      
      // Sidebar for BrandPulse project
      '/docs/brandpulse/': [
        {
          text: 'BrandPulse',
          items: [
            { text: 'Overview', link: '/docs/brandpulse/' },
            { text: 'Problem Statement', link: '/docs/brandpulse/problem-statement' },
            { text: 'Use Cases', link: '/docs/brandpulse/use-cases' },
            { text: 'Technical Architecture', link: '/docs/brandpulse/technical-arch' },
            {
              text: 'Implementation',
              link: '/docs/brandpulse/implementation/',
              collapsed: true,
              items: [
                {
                  text: 'Research Prototypes',
                  collapsed: true,
                  items: [
                    {
                      text: 'Data Generation',
                      items: [
                        { text: 'Overview', link: '/docs/brandpulse/implementation/research/data-generation/overview' },
                        { text: 'Version 1', link: '/docs/brandpulse/implementation/research/data-generation/v1' },
                        { text: 'Version 2', link: '/docs/brandpulse/implementation/research/data-generation/v2' },
                        { text: 'Version 3', link: '/docs/brandpulse/implementation/research/data-generation/v3' },
                        { text: 'Version 4', link: '/docs/brandpulse/implementation/research/data-generation/v4' },
                        { text: 'Version 5', link: '/docs/brandpulse/implementation/research/data-generation/v5' }
                      ]
                    },
                    {
                      text: 'Data Ingestion',
                      items: [
                        { text: 'Overview', link: '/docs/brandpulse/implementation/research/data-ingestion/overview' },
                      ]
                    }
                  ]
                },
                { text: 'Producer', link: '/docs/brandpulse/implementation/producer' },
                { text: 'Consumer', link: '/docs/brandpulse/implementation/consumer' },
                { text: 'Sentiment Analysis', link: '/docs/brandpulse/implementation/sentiment-analysis' },
                { text: 'InfluxDB Integration', link: '/docs/brandpulse/implementation/influxdb' },
                { text: 'Performance Optimization', link: '/docs/brandpulse/implementation/performance' },
                { text: 'Issues Faced', link: '/docs/brandpulse/implementation/issues-faced' },
                { text: 'Lessons Learned', link: '/docs/brandpulse/implementation/lessons-learned' }
              ]
            },
            { text: 'Value Proposition', link: '/docs/brandpulse/value-prop' },
            { text: 'Future Enhancements', link: '/docs/brandpulse/future-enhancements' },
            { text: 'Why It Rocks', link: '/docs/brandpulse/why-it-rocks' },
            { text: 'Demo', link: '/docs/brandpulse/demo' }
          ]
        }
      ],

      // Sidebar for Chainly SDK
      '/docs/chainly-sdk/': [
        {
          text: 'Chainly SDK',
          items: [
            { text: 'Overview', link: '/docs/chainly-sdk/' },
            { text: 'Technical Architecture', link: '/docs/chainly-sdk/architecture' },
            { text: 'Implementation Guide', link: '/docs/chainly-sdk/implementation' },
            { text: 'API Reference', link: '/docs/chainly-sdk/api-reference' },
            { text: 'Examples & Tutorials', link: '/docs/chainly-sdk/examples' }
          ]
        }
      ],

      // Sidebar for Template Generator
      '/docs/template-generator/': [
        {
          text: 'Template Generator',
          items: [
            { text: 'Overview', link: '/docs/template-generator/' },
            { text: 'Technical Architecture', link: '/docs/template-generator/architecture' },
            { text: 'Implementation Guide', link: '/docs/template-generator/implementation' },
            { text: 'Demo & Examples', link: '/docs/template-generator/demo' }
          ]
        }
      ],

      // Sidebar for Distributed Abuse Detection System
      '/docs/distributed-abuse-detection/': [
        {
          text: 'Abuse Detection System',
          items: [
            { text: 'Overview', link: '/docs/distributed-abuse-detection/' },
            { text: 'Technical Architecture', link: '/docs/distributed-abuse-detection/architecture' },
            { text: 'Implementation Details', link: '/docs/distributed-abuse-detection/implementation' },
            { text: 'Performance Analysis', link: '/docs/distributed-abuse-detection/performance' },
            { text: 'Deployment Guide', link: '/docs/distributed-abuse-detection/deployment' }
          ]
        }
      ],

      // Sidebar for Attestation SDK
      '/docs/attestify/': [
        {
          text: 'Attestation SDK',
          items: [
            { text: 'Overview', link: '/docs/attestify/' },
            { text: 'Technical Architecture', link: '/docs/attestify/tech-architecture' },
            { text: 'Use Cases', link: '/docs/attestify/usecases' },
            { text: 'Implementation', link: '/docs/attestify/implementation' },
            { text: 'Demo', link: '/docs/attestify/demo' }
          ]
        }
      ],
      // Sidebar for root (unchanged)
      '/': [
        {
          text: 'Welcome',
          items: [
            { text: 'Home', link: '/' },
            { text: 'Projects', link: '/projects' }
          ]
        }
      ]
    },

    footer: {
      message: 'Built with precision engineering and innovative solutions.',
      copyright: 'Copyright © 2025 Mohanpathi. All rights reserved.'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/STarLo-rd' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/mohanpathi' },
      { icon: 'twitter', link: 'https://twitter.com/mohanpathi' }
    ],

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  }
})