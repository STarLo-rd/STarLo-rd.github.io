---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "My Portfolio"
  text: "Showcasing my research, projects, and technical insights"
  tagline: "Innovating through code, data, and scalable systems"
  actions:
    - theme: brand
      text: projects
      link: /
    # - theme: alt
    #   text: API Examples
    #   link: /api-examples
features:
  - title: QuickLinker-ZeroRPM
    details: A high-performance URL shortener built with Node.js, PostgreSQL, and Redis. It’s designed to handle heavy traffic with smart caching and cost-efficient scaling.
    link: /docs/zeroRPM/
  - title: BrandPulse
    details: A real-time brand monitoring platform processing 700K social media posts per second, delivering instant sentiment insights using Node.js, Kafka, and InfluxDB.
    link: /docs/brandpulse/
  - title: Coming Soon
    details: Stay tuned for more projects—big ideas in the works tackling data, scale, and real-world impact.
---