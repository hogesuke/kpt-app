const baseUrls = ['http://localhost:4173/', 'http://localhost:4173/demo', 'http://localhost:4173/login', 'http://localhost:4173/not-found'];

/** @type {import('@lhci/cli').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm preview',
      startServerReadyPattern: 'Local:',
      // 認証不要のページのみ対象
      url: [...baseUrls, ...baseUrls.map((url) => `${url}#dark`)],
      numberOfRuns: 1,
      settings: [
        // ライトモード
        {
          preset: 'desktop',
          matchingUrlPattern: '.*(?<!#dark)$',
        },
        // ダークモード
        {
          preset: 'desktop',
          matchingUrlPattern: '.*#dark$',
          emulatedMediaFeatures: [{ name: 'prefers-color-scheme', value: 'dark' }],
        },
      ],
    },
    assert: {
      assertions: {
        // noindexページのSEO警告を無視
        'is-crawlable': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
  },
};
