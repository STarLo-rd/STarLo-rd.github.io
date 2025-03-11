import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mohanpathi Portfolio",
  description: "Personal Findings, Research, and Works",
  themeConfig: {
    // Navigation bar at the top
    nav: [
      { text: 'Home', link: '/' },
      { 
        text: 'Projects', 
        items: [
          { text: 'QuickLinker-ZeroRPM', link: '/docs/zeroRPM/' },
          { text: 'BrandPulse', link: '/docs/brandpulse/' },
          { text: 'Attestify', link: '/docs/attestify/' }
        ]
      }
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

      // Sidebar for Attestation SDK (new)
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
            { text: 'Projects', link: '/docs/zeroRPM/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/STarLo-rd' }
    ]
  }
})