import { defineConfig } from "vitepress";

export default defineConfig({
  title: "@aibos/kernel",
  description: "The Business Constitution (L0 SSOT)",
  base: "/",
  
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/guides/getting-started" },
      { text: "Architecture", link: "/architecture/overview" },
      { text: "API Reference", link: "/api/" },
      { text: "Contributing", link: "/governance/contributing" },
    ],
    
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Introduction", link: "/guides/getting-started" },
          { text: "Usage Guide", link: "/guides/usage" },
          { text: "Glossary", link: "/guides/glossary" },
        ],
      },
      {
        text: "Architecture",
        items: [
          { text: "Overview", link: "/architecture/overview" },
          { text: "Layer Model", link: "/architecture/layer-model" },
          { text: "Design Principles", link: "/architecture/design-principles" },
        ],
      },
      {
        text: "Architecture Decisions",
        items: [
          { text: "ADR Index", link: "/adr/README" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Migration", link: "/guides/migration" },
          { text: "Troubleshooting", link: "/guides/troubleshooting" },
        ],
      },
      {
        text: "Governance",
        items: [
          { text: "Contributing", link: "/governance/contributing" },
          { text: "Release Process", link: "/governance/release-process" },
          { text: "Security", link: "/governance/security" },
          { text: "Code Standards", link: "/governance/code-standards" },
          { text: "Automation", link: "/governance/automation" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "API Docs", link: "/api/" },
        ],
      },
    ],
  },
});

