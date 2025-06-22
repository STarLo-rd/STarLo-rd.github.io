import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
    ['meta', { name: 'keywords', content: 'Mohanpathi, System Architect, Full-Stack Engineer, Node.js Developer, PostgreSQL Expert, Redis Specialist, Real-time Systems, QuickLinker-ZeroRPM, BrandPulse, Chainly SDK, Workflow Orchestration, TypeScript SDK, Distributed Abuse Detection, Content Moderation, Machine Learning, Kubernetes, Attestify, Scalable Architecture, Enterprise Solutions, Cryptographic Security, Data Processing, Kafka, InfluxDB, MongoDB' }],
    ['meta', { name: 'author', content: 'Mohanpathi' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'googlebot', content: 'index, follow' }],
    
    // OpenGraph Meta Tags
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:site_name', content: 'Mohanpathi Portfolio' }],
    ['meta', { property: 'og:title', content: 'Mohanpathi | System Architect & Full-Stack Engineer' }],
    ['meta', { property: 'og:description', content: 'Expert System Architect specializing in scalable systems, real-time data processing, and enterprise-grade solutions. Featured projects: QuickLinker-ZeroRPM, BrandPulse, Chainly SDK, Distributed Abuse Detection, Attestify.' }],
    ['meta', { property: 'og:url', content: 'https://starlo-rd.github.io/my-portfolio/' }],
    ['meta', { property: 'og:image', content: 'https://starlo-rd.github.io/my-portfolio/og-image.jpg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Mohanpathi - System Architect Portfolio' }],
    
    // Twitter Card Meta Tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@mohanpathi' }],
    ['meta', { name: 'twitter:creator', content: '@mohanpathi' }],
    ['meta', { name: 'twitter:title', content: 'Mohanpathi | System Architect & Full-Stack Engineer' }],
    ['meta', { name: 'twitter:description', content: 'Expert System Architect specializing in scalable systems, real-time data processing, and enterprise-grade solutions.' }],
    ['meta', { name: 'twitter:image', content: 'https://starlo-rd.github.io/my-portfolio/og-image.jpg' }],
    
    // Additional SEO
    ['meta', { name: 'application-name', content: 'Mohanpathi Portfolio' }],
    ['meta', { name: 'msapplication-TileColor', content: '#dc2626' }],
    ['meta', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    
    // Structured Data (JSON-LD)
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Mohanpathi",
      "jobTitle": "System Architect & Full-Stack Engineer",
      "description": "Expert System Architect specializing in scalable systems, real-time data processing, and enterprise-grade solutions",
      "url": "https://starlo-rd.github.io/my-portfolio/",
      "sameAs": [
        "https://github.com/STarLo-rd",
        "https://linkedin.com/in/mohanpathi",
        "https://twitter.com/mohanpathi"
      ],
      "knowsAbout": [
        "System Architecture",
        "Full-Stack Development",
        "Node.js",
        "Go Programming",
        "PostgreSQL",
        "Redis",
        "Real-time Systems",
        "Scalable Architecture",
        "Enterprise Solutions",
        "TypeScript",
        "Workflow Orchestration",
        "SDK Development",
        "Developer Tools",
        "Cryptographic Security",
        "Data Processing",
        "Apache Kafka",
        "InfluxDB",
        "MongoDB",
        "Kubernetes",
        "Docker",
        "Machine Learning",
        "Content Moderation",
        "Distributed Systems",
        "Microservices",
        "Cloud Native Architecture",
        "Event-Driven Architecture"
      ],
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "name": "System Architecture Expertise"
        },
        {
          "@type": "EducationalOccupationalCredential", 
          "name": "Full-Stack Development"
        }
      ]
    })],
    
    // Projects Structured Data
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Mohanpathi's Featured Projects",
      "description": "Portfolio of enterprise-grade software projects",
      "itemListElement": [
        {
          "@type": "SoftwareApplication",
          "position": 1,
          "name": "QuickLinker-ZeroRPM",
          "description": "High-performance URL shortener engineered for massive scale with Node.js, PostgreSQL, and Redis",
          "applicationCategory": "Web Application",
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["Node.js", "PostgreSQL", "Redis"]
        },
        {
          "@type": "SoftwareApplication",
          "position": 2,
          "name": "BrandPulse",
          "description": "Real-time brand monitoring platform processing 700K+ social media posts per second",
          "applicationCategory": "Analytics Platform",
          "operatingSystem": "Cross-platform", 
          "programmingLanguage": ["Node.js", "Apache Kafka", "InfluxDB"]
        },
        {
          "@type": "SoftwareApplication",
          "position": 3,
          "name": "Chainly SDK",
          "description": "TypeScript workflow orchestration framework with intelligent dependency resolution and event-driven execution",
          "applicationCategory": "Developer SDK",
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["TypeScript", "Node.js"]
        },
        {
          "@type": "SoftwareApplication",
          "position": 4,
          "name": "Distributed Abuse Detection System",
          "description": "Enterprise-scale content moderation system processing millions of events daily with multi-modal ML inference",
          "applicationCategory": "Content Moderation Platform",
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["Node.js", "Go", "Apache Kafka", "Kubernetes"]
        },
        {
          "@type": "SoftwareApplication",
          "position": 5,
          "name": "Attestify",
          "description": "Enterprise-grade TypeScript SDK for cryptographically secure payment commitments",
          "applicationCategory": "SDK",
          "operatingSystem": "Cross-platform",
          "programmingLanguage": ["TypeScript", "MongoDB"]
        }
      ]
    })]
  ],
  
  // Site Configuration
  lang: 'en-US',
  base: '/my-portfolio/',
  cleanUrls: true,
  
  // Performance optimizations
  vite: {
    build: {
      minify: 'terser',
      cssMinify: true
    }
  },
  
  // Sitemap Generation
  sitemap: {
    hostname: 'https://starlo-rd.github.io/my-portfolio/'
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