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
          { text: 'BrandPulse', link: '/docs/brandpulse/' }
        ]
      }
    ],

    // Sidebar for specific sections
    sidebar: {
      // Sidebar for ZeroRPM project
      '/docs/zeroRPM/': [
        {
          text: 'QuickLinker-ZeroRPM',
          items: [
            { text: 'Overview', link: '/docs/zeroRPM/' },
            { text: 'Phase 1', link: '/docs/zeroRPM/phases/phase1' },
            { text: 'Phase 2', link: '/docs/zeroRPM/phases/phase2' },
            { text: 'Phase 3', link: '/docs/zeroRPM/phases/phase3' }
          ]
        }
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
            { text: 'Implementation', link: '/docs/brandpulse/implementation' },
            { text: 'Value Proposition', link: '/docs/brandpulse/value-prop' },
            { text: 'Future Enhancements', link: '/docs/brandpulse/future-enhancements' },
            { text: 'Why It Rocks', link: '/docs/brandpulse/why-it-rocks' },
            { text: 'Demo', link: '/docs/brandpulse/demo' }
          ]
        }
      ],

      // Optional: Sidebar for root (e.g., Home page)
      '/': [
        {
          text: 'Welcome',
          items: [
            { text: 'Home', link: '/' },
            { text: 'Projects', link: '/docs/zeroRPM/' } // Default to ZeroRPM or a projects overview page
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/STarLo-rd' }
    ]
  }
})