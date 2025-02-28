import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mohanpathi portfolio",
  description: "By personal findings/research and works",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/docs/zeroRPM/index.md' }
    ],

    sidebar: [
      {
        text: 'QuickLinker-ZeroRPM',
        items: [
          { text: 'phase 1', link: '/docs/zeroRPM/phases/phase1' },
          { text: 'phase 2', link: '/docs/zeroRPM/phases/phase2' },
          { text: 'phase 3', link: '/docs/zeroRPM/phases/phase3' },
        ],
        link: "/docs/zeroRPM/index.md"
      },
      {
        text: 'Upcoming',
        // items: [
        //   { text: 'Markdown Examples', link: '/markdown-examples' },
        //   { text: 'Runtime API Examples', link: '/api-examples' }
        // ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/STarLo-rd' }
    ]
  }
})
