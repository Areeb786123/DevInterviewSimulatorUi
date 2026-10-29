import type { ComponentKnowledge } from './types'

export const CDN_KNOWLEDGE: ComponentKnowledge = {
  id: 'cdn',
  name: 'CDN',
  category: 'cdn',
  iconUrl: '/assets/sysdesign/cdn.svg',
  shortDescription:
    'Edge cache network that serves static and cacheable content close to users, offloading origin.',
  beginnerExplanation:
    'A CDN (Content Delivery Network) copies cacheable files — images, JS, CSS, videos — onto servers around the world. When a user in Tokyo opens your app, they fetch the logo from a nearby edge node instead of your origin in Virginia. Pages feel faster; your origin sees fewer hits. CDNs shine for static and cacheable content. They do not replace your database or magically cache personalized private HTML without careful design. Cache invalidation remains a famous hard problem.',
  technicalExplanation:
    'Clients resolve CDN hostnames to nearby POPs; edges cache based on Cache-Control/TTL, vary headers, and sometimes surrogate keys. Misses fetch from origin (object store or app). Features include TLS termination, compression, HTTP/2/3, WAF, and signed URLs. For dynamic APIs, CDNs help less unless responses are explicitly cacheable. Purge APIs and versioned asset filenames (content hashes) beat emergency wildcards. Origin shield layers reduce thundering herds to origin. CDN is a performance and shield layer, not durable SoT.',
  purpose:
    'Reduce latency and origin load for static/cacheable assets by serving from geographically distributed edge caches.',
  problemBefore:
    'Every global user pulls heavy assets from a single-region origin; TTFB suffers; bandwidth bills and origin CPU spike on launches.',
  whatChanges:
    'Most asset reads hit edges; origin focuses on API/dynamic work; global UX improves when TTLs and cache keys are correct.',
  optionalNote:
    'Hashed filenames (app.abc123.js) make long TTLs safe — prefer cache-busting via new URLs over constant purges.',
  howItWorks: [
    'Browser requests https://cdn.example.com/asset; DNS sends it to a nearby POP.',
    'On hit, edge returns cached bytes with appropriate cache headers.',
    'On miss, edge fetches origin (object store/app), stores per TTL, then responds.',
    'Subsequent nearby users reuse the cached object until expiry or purge.',
    'For private content, signed cookies/URLs enforce auth at the edge or via origin check.',
  ],
  architectureExamples: [
    {
      title: 'Static SPA + media',
      path: 'Client → CDN (JS/CSS/images) → Object Store origin; APIs bypass to LB/App',
      explanation:
        'Assets are globally fast; personalized API data still hits app servers. Clear split prevents caching private JSON by accident.',
    },
    {
      title: 'Versioned releases',
      path: 'Build emits hashed assets → upload Object Store → CDN long TTL',
      explanation:
        'New deploy = new filenames, so caches need no urgent purge for static assets; HTML may stay short TTL.',
    },
  ],
  useCases: [
    'JavaScript, CSS, fonts, and static marketing pages',
    'User media and thumbnails with public or signed URLs',
    'Video segment delivery for streaming',
    'Software download mirrors and large artifacts',
    'Shielding origin from bots/scrapers on static paths (with WAF features)',
  ],
  whenNotToUse: [
    'Do not expect a CDN to fix uncached, highly personalized API latency without a caching strategy.',
    'Avoid caching authenticated private responses globally without signed URLs or vary-by-auth design.',
    'Skip as the only copy of irreplaceable data — durable origin (object store) must exist.',
  ],
  advantages: [
    {
      point: 'Lower latency worldwide',
      detail:
        'Edge proximity cuts RTT for large assets that dominate page weight.',
    },
    {
      point: 'Origin offload',
      detail:
        'High hit ratios absorb launch spikes and reduce object-store/app egress.',
    },
    {
      point: 'Built-in TLS and modern HTTP',
      detail:
        'Managed edges handle certificates, compression, and protocol upgrades at scale.',
    },
    {
      point: 'Security add-ons',
      detail:
        'Many CDNs offer WAF, DDoS absorption, and bot management in front of origin.',
    },
  ],
  disadvantages: [
    {
      point: 'Cache invalidation complexity',
      detail:
        'Stale assets confuse users after deploys if URLs are not versioned and purges lag.',
    },
    {
      point: 'Debugging opacity',
      detail:
        'Hits/misses, regional variance, and header interactions take skill to reason about.',
    },
    {
      point: 'Cost at high egress',
      detail:
        'CDN bandwidth is priced; still usually cheaper than saturating origin, but not free.',
    },
    {
      point: 'Limited help for uncacheable dynamic APIs',
      detail:
        'If every response is private and unique, the CDN becomes mostly a reverse proxy hop.',
    },
  ],
  alternatives: [
    {
      name: 'Regional app/object caches only',
      when: 'Single-region users and modest asset weight — simpler ops, worse global latency.',
    },
    {
      name: 'Browser cache alone',
      when: 'Tiny sites; no edge sharing across users on first fetch.',
    },
    {
      name: 'Multi-region active origins',
      when: 'Dynamic data must be local; still often combine with CDN for static.',
    },
    {
      name: 'Peer-to-peer / client mesh',
      when: 'Niche distribution problems — rarely a CDN replacement in interviews.',
    },
  ],
  scaling:
    'CDNs scale reads geographically by design. Your job is high cache hit ratio: long TTL + fingerprinting, sensible cache keys, origin shield, and compressing assets. Watch purge storms and cookie-based cache fragmentation. For media, pair with object storage; for apps, separate static hostnames from API hostnames.',
  failureScenarios: [
    'Bad deploy cached globally with long TTL and no hash change: users stuck on broken JS until purge/TTL.',
    'Origin outage with empty edge cache in a region: misses fail even if other regions are warm.',
    'Mis-set Cache-Control on private API responses: sensitive data served to wrong users.',
    'Thundering herd to origin when a popular object expires everywhere at once — mitigate with shield/stagger.',
  ],
  interviewQuestions: [
    {
      question: 'What does a CDN improve in a system design?',
      testing: 'Basic CDN value proposition.',
      keyConcepts: ['edge cache', 'latency', 'origin offload'],
      sampleAnswer:
        'It serves cacheable content from locations near users, cutting latency and reducing load on origin storage/servers for static assets and some cacheable responses.',
      commonMistakes: [
        'Saying CDN replaces the database',
        'Caching all API traffic blindly',
      ],
      level: 'beginner',
    },
    {
      question: 'How do you safely cache static assets across deploys?',
      testing: 'Cache busting strategy.',
      keyConcepts: ['content hash', 'TTL', 'purge'],
      sampleAnswer:
        'Emit fingerprinted filenames and set long TTLs. HTML references new names on deploy. Purge becomes rare. Short-TTL HTML can point at long-TTL assets.',
      commonMistakes: [
        'Same filename forever with long TTL and manual purge only',
        'No cache headers at all',
      ],
      level: 'beginner',
    },
    {
      question: 'When can a CDN cache API responses?',
      testing: 'Dynamic content caching judgment.',
      keyConcepts: ['Cache-Control', 'authorization', 'vary'],
      sampleAnswer:
        'When responses are identical for many users (public product pages) and headers correctly mark cacheability. Personalized or auth-sensitive responses need signed URLs, private caches, or no shared caching.',
      commonMistakes: [
        'Caching Authorization-varying responses in shared edge without care',
        'Never considering public GETs that could be cached',
      ],
      level: 'intermediate',
    },
    {
      question: 'CDN vs Redis cache — how do you choose?',
      testing: 'Edge vs application cache.',
      keyConcepts: ['HTTP edge', 'application keys', 'personalization'],
      sampleAnswer:
        'CDN caches HTTP responses/assets near users. Redis caches application data structures inside your VPC for personalized hot keys and rate limits. Many systems use both for different layers.',
      commonMistakes: [
        'Treating them as interchangeable',
        'Putting private per-user JSON on a public CDN hostname',
      ],
      level: 'intermediate',
    },
    {
      question: 'Design origin protection for a viral media object.',
      testing: 'Hit ratio and herd control.',
      keyConcepts: ['origin shield', 'TTL jitter', 'request collapsing'],
      sampleAnswer:
        'Use CDN with high TTL/immutable URL, enable origin shield or request collapsing so one miss fills many edges, and ensure object store can handle residual miss traffic. Monitor hit ratio during campaigns.',
      commonMistakes: [
        'Short TTL on immutable media',
        'No plan for synchronized expiry',
      ],
      level: 'advanced',
    },
  ],
  keyTakeaways: [
    'CDNs accelerate and offload cacheable content at the edge — they are not your SoT.',
    'Versioned URLs make long TTLs safe; invalidation is harder without them.',
    'Separate static/CDN hostnames from dynamic APIs to avoid caching mistakes.',
  ],
  biggestTradeOff:
    'Global speed and origin offload versus stale-content risk and careful cache-key/header design.',
  interviewTip:
    'Mention fingerprinted assets + long TTL unprompted. It signals you have shipped frontends, not just drawn boxes.',
  relatedComponents: ['object-store', 'client', 'server', 'load-balancer'],
}
