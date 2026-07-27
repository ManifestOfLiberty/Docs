import { defineConfig } from 'vitepress'
import timeline from "vitepress-markdown-timeline";
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import { GitChangelog, GitChangelogMarkdownSection } from '@nolebase/vitepress-plugin-git-changelog/vite'
import { PageProperties } from '@nolebase/vitepress-plugin-page-properties/vite'

export default defineConfig({
  vite: {
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-highlight-targeted-heading',
        '@nolebase/vitepress-plugin-inline-link-preview',
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/vitepress-plugin-git-changelog',
        '@nolebase/vitepress-plugin-page-properties',
        '@nolebase/ui',
        'vue-toastification',
      ],
    },
    plugins: [
      GitChangelog({
        repoURL: () => 'https://github.com/ManifestOfLiberty/Docs',
      }) as any,
      GitChangelogMarkdownSection({
        sections: {
          disableChangelog: false,
          disableContributors: true,
        },
      }) as any,
      PageProperties(),
    ],
  },

  title: "Manifest of Liberty",
  description: "Technical reference for Steam's SteamPipe CDN network, covering depots, manifests, depot keys, MRC mirrors, download pipelines, and Lua configs.",
  lang: 'en-US',
  base: '/Docs/',
  cleanUrls: true,
  appearance: 'force-dark',
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/assets/images/logo.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap', rel: 'stylesheet' }],
    ['meta', { name: 'theme-color', content: '#9333ea' }],
    ['meta', { name: 'og:title', content: 'Manifest of Liberty' }],
    ['meta', { name: 'og:description', content: 'Technical reference for Steam SteamPipe, manifests, depot keys, MRCs, and CDN download pipelines.' }],
    ['meta', { name: 'og:image', content: '/assets/images/logo.png' }],
  ],

  themeConfig: {
    logo: '/assets/images/logo.png',
    siteTitle: 'Manifest of Liberty',

    nav: [
      { text: 'Overview',       link: '/intro/overview' },
      { text: 'Download Flow',  link: '/download/download-flow' },
      { text: 'Depot Keys',     link: '/auth/depot-keys' },
      {
        text: 'Reference',
        items: [
          { text: 'OpenSteamTool',      link: '/reference/opensteamtool' },
          { text: 'CDNClient API',      link: '/reference/cdn-client' },
          { text: 'Gotchas',            link: '/reference/gotchas' },
          { text: 'Glossary',           link: '/intro/glossary' },
        ]
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: 'Overview',              link: '/intro/overview' },
          { text: 'Glossary',              link: '/intro/glossary' },
          { text: 'CM vs CDN Architecture',link: '/intro/architecture' },
        ]
      },
      {
        text: 'Core Concepts',
        collapsed: false,
        items: [
          { text: 'App Info & Product Info', link: '/core/app-info' },
          { text: 'Depots',                  link: '/core/depots' },
          { text: 'Manifests',               link: '/core/manifests' },
          { text: 'Manifest GID',            link: '/core/manifest-gid' },
          { text: 'Chunks',                  link: '/core/chunks' },
          { text: 'Workshop & UGC Depots',   link: '/core/workshop' },
        ]
      },
      {
        text: 'Authentication',
        collapsed: false,
        items: [
          { text: 'Anonymous vs Full Login', link: '/auth/login' },
          { text: 'App Access Tokens',       link: '/auth/app-access-tokens' },
          { text: 'Manifest Request Code',   link: '/auth/mrc' },
          { text: 'MRC Mirror Services',     link: '/auth/mrc-mirrors' },
          { text: 'Depot Keys',              link: '/auth/depot-keys' },
          { text: 'CDN Auth Tokens',         link: '/auth/cdn-auth' },
        ]
      },
      {
        text: 'Downloading',
        collapsed: false,
        items: [
          { text: 'Content Servers',      link: '/download/cdn-servers' },
          { text: 'CDN URL Anatomy',      link: '/download/cdn-url' },
          { text: 'Full Download Flow',   link: '/download/download-flow' },
          { text: 'Decrypting Manifests', link: '/download/decrypt' },
        ]
      },
      {
        text: 'Output',
        collapsed: false,
        items: [
          { text: 'Lua Config File',      link: '/output/lua-config' },
          { text: 'Branches & Beta Keys', link: '/output/branches' },
          { text: 'DLC & Shared Depots',  link: '/output/dlc' },
        ]
      },
      {
        text: 'Reference',
        collapsed: false,
        items: [
          { text: 'OpenSteamTool',     link: '/reference/opensteamtool' },
          { text: 'CDNClient API',     link: '/reference/cdn-client' },
          { text: 'Gotchas & Edge Cases', link: '/reference/gotchas' },
        ]
      },
    ],

    outline: 'deep',

    footer: {
      message: "Technical reference provided for educational and research purposes only. Not affiliated with Valve Corporation.",
      copyright: `© ${new Date().getFullYear()} Manifest of Liberty`,
    },

    docFooter: {
      prev: 'Prev',
      next: 'Next',
    },

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ManifestOfLiberty/Docs', ariaLabel: 'GitHub Repository' }
    ],

    externalLinkIcon: false,

    editLink: {
      pattern: 'https://github.com/ManifestOfLiberty/Docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Last Updated',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
  },

  markdown: {
    lineNumbers: false,
    theme: 'one-dark-pro',
    languages: [],
    config: (md) => {
      md.use(timeline as any);
      md.use(BiDirectionalLinks() as any);
      md.use(InlineLinkPreviewElementTransform as any);
    },
    image: {
      lazyLoading: true
    },
    linkify: true,
    breaks: true
  }
})
