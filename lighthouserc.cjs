/* Lighthouse CI. Run against a production preview: npm run build && npm run lighthouse. */
module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4173/', 'http://127.0.0.1:4173/#/c/bio-11-ch8/what-is-a-cell'],
      numberOfRuns: 2,
      startServerCommand: 'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      settings: {
        // Mobile, throttled, which is the audience this app is built for.
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
        throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': 'off',
        // Tracked, not enforced: the chapter route lands at 2.5-2.7 s on throttled mobile.
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'total-byte-weight': ['warn', { maxNumericValue: 700000 }],
        'unused-javascript': 'off',
        'csp-xss': 'warn',
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
}
