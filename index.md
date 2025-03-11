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
      link: /projects.md
    # - theme: alt
    #   text: API Examples
    #   link: /api-examples
features:
  - title: QuickLinker-ZeroRPM
    details: A high-performance URL shortener built with Node.js, PostgreSQL, and Redis. It’s designed to handle heavy traffic with smart caching and cost-efficient scaling.
    link: /docs/quicklinker-zeroRPM
  - title: BrandPulse
    details: A real-time brand monitoring platform processing 700K social media posts per second, delivering instant sentiment insights using Node.js, Kafka, and InfluxDB.
    link: /docs/brandpulse/
  - title: Attestify
    details: A TypeScript SDK ecosystem for cryptographically secure payment commitments, leveraging HD wallets, secp256k1 signatures, and a RESTful backend with MongoDB. Scales trust for finance and beyond.
    link: /docs/attestify/
---