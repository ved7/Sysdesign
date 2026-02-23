export const questions = [
  {
    id: 'design-uber',
    title: 'Design Uber/Lyft',
    difficulty: 'Hard',
    summary: 'Design a real-time ride-sharing service with location tracking and matching.',
    requirements: [
      'Drivers report location every 4 seconds.',
      'Riders can see nearby drivers on a map.',
      'Match riders and drivers with high concurrency.',
      'Estimate ETA and fare in near real-time.',
      'Highly available and fault tolerant.'
    ],
    solution: `
      <h3>1. Capacity Estimation</h3>
      <p>Start with city-level traffic assumptions, update frequency, and peak-region multipliers. This is primarily a write-heavy location ingestion problem.</p>

      <h3>2. High-Level Architecture</h3>
      <ul>
        <li><strong>Location Service:</strong> Ingests updates and keeps latest location in Redis geo index.</li>
        <li><strong>Dispatch Service:</strong> Finds nearby drivers and performs matching.</li>
        <li><strong>Trip Service:</strong> Persists trip lifecycle in SQL or a transactional store.</li>
        <li><strong>Pricing/ETA Service:</strong> Uses map data, traffic, and demand multipliers.</li>
      </ul>

      <h3>3. Key Trade-offs</h3>
      <p>Favor availability for map updates, but preserve stronger guarantees for trip state transitions and payment-critical paths.</p>
    `
  },
  {
    id: 'design-url-shortener',
    title: 'Design URL Shortener',
    difficulty: 'Easy',
    summary: 'Design a scalable system like TinyURL or Bitly.',
    requirements: [
      'Return a unique short URL for any long URL.',
      'Redirect from short URL to original URL quickly.',
      'Support custom aliases and expiration.',
      'Track click analytics.'
    ],
    solution: `
      <h3>1. Core Idea</h3>
      <p>Generate a unique ID, encode it in Base62, and map short code to long URL.</p>

      <h3>2. Data and API</h3>
      <ul>
        <li><code>POST /shorten</code> -> create short link.</li>
        <li><code>GET /:code</code> -> resolve and redirect.</li>
      </ul>

      <h3>3. Scaling</h3>
      <p>Use cache for hot keys, CDN for redirect edge acceleration, and partition storage by code prefix for horizontal growth.</p>
    `
  },
  {
    id: 'design-instagram',
    title: 'Design Instagram Feed',
    difficulty: 'Hard',
    summary: 'Design a photo-sharing platform with feed generation at scale.',
    requirements: [
      'Users upload and view media.',
      'Users follow others.',
      'Generate low-latency personalized feeds.',
      'Support very high fan-out accounts.'
    ],
    solution: `
      <h3>1. Services</h3>
      <p>Separate User, Follow Graph, Media, Feed, and Notification services.</p>

      <h3>2. Feed Model</h3>
      <ul>
        <li><strong>Fan-out on write:</strong> Fast reads, expensive for celebrity posts.</li>
        <li><strong>Fan-out on read:</strong> Cheaper writes, slower reads.</li>
        <li><strong>Hybrid model:</strong> Push for normal users, pull for high-fanout accounts.</li>
      </ul>

      <h3>3. Storage</h3>
      <p>Store media in object storage + CDN, metadata in SQL/NoSQL depending on access patterns.</p>
    `
  },
  {
    id: 'design-notification-service',
    title: 'Design Notification Service',
    difficulty: 'Medium',
    summary: 'Design multi-channel notifications (push, email, SMS) with retries and preferences.',
    requirements: [
      'Support user preferences and opt-outs.',
      'Fan out to mobile push, email, and SMS providers.',
      'Guarantee at-least-once delivery with idempotency.',
      'Handle provider outages gracefully.'
    ],
    solution: `
      <h3>1. Event-Driven Flow</h3>
      <p>Publish notification events to a durable queue; workers process by channel.</p>

      <h3>2. Routing + Templates</h3>
      <ul>
        <li>Preference service decides eligible channels.</li>
        <li>Template service renders localized payloads.</li>
        <li>Channel workers integrate with external providers.</li>
      </ul>

      <h3>3. Reliability</h3>
      <p>Use dead-letter queues, exponential backoff, and provider health scoring to reroute traffic.</p>
    `
  },
  {
    id: 'design-whatsapp',
    title: 'Design WhatsApp Chat',
    difficulty: 'Hard',
    summary: 'Design low-latency, reliable one-to-one and group messaging.',
    requirements: [
      'Near real-time message delivery.',
      'Message ordering guarantees per conversation.',
      'Store chat history and media.',
      'Handle offline users and retries.'
    ],
    solution: `
      <h3>1. Transport</h3>
      <p>Use persistent connections (WebSocket/TCP) via gateway servers for low-latency messaging.</p>

      <h3>2. Message Pipeline</h3>
      <ul>
        <li>Message ingress -> queue -> conversation service -> fanout service.</li>
        <li>Store message metadata in distributed DB and media in object store.</li>
        <li>Deliver acknowledgments and retries for offline clients.</li>
      </ul>

      <h3>3. Consistency</h3>
      <p>Guarantee ordering within a conversation using partition keys and sequence IDs.</p>
    `
  },
  {
    id: 'design-youtube',
    title: 'Design YouTube',
    difficulty: 'Hard',
    summary: 'Design large-scale video upload, transcoding, and streaming delivery.',
    requirements: [
      'Upload and store very large video files.',
      'Transcode into multiple formats/bitrates.',
      'Serve global video playback with low startup latency.',
      'Support comments, likes, and recommendations.'
    ],
    solution: `
      <h3>1. Ingestion</h3>
      <p>Upload to object storage through resumable multipart uploads and metadata tracking.</p>

      <h3>2. Processing</h3>
      <ul>
        <li>Publish upload events to task queues.</li>
        <li>Transcode workers generate multiple bitrates and thumbnails.</li>
        <li>Store manifests for adaptive bitrate streaming.</li>
      </ul>

      <h3>3. Delivery</h3>
      <p>Distribute assets through CDN; cache hot videos aggressively and pre-warm regional edges for trends.</p>
    `
  },
  {
    id: 'design-rate-limiter',
    title: 'Design Rate Limiter',
    difficulty: 'Medium',
    summary: 'Design a distributed rate limiter for APIs with per-user and per-key limits.',
    requirements: [
      'Support global and per-tenant quotas.',
      'Return decisions at very low latency.',
      'Handle bursts and sustained traffic.',
      'Expose metrics and debugging visibility.'
    ],
    solution: `
      <h3>1. Algorithms</h3>
      <ul>
        <li>Token bucket for burst tolerance.</li>
        <li>Leaky bucket for smooth outflow.</li>
        <li>Fixed/sliding window for policy simplicity.</li>
      </ul>

      <h3>2. Storage</h3>
      <p>Use Redis for counters and TTL-based windows; partition keys by tenant and endpoint.</p>

      <h3>3. Deployment</h3>
      <p>Enforce at API gateway and service level for defense in depth.</p>
    `
  },
  {
    id: 'design-search-autocomplete',
    title: 'Design Search Autocomplete',
    difficulty: 'Medium',
    summary: 'Design low-latency query suggestion for type-ahead search.',
    requirements: [
      'Return top suggestions under 100ms.',
      'Support frequent updates from trending queries.',
      'Rank by popularity and personalization.',
      'Scale read traffic globally.'
    ],
    solution: `
      <h3>1. Data Structures</h3>
      <p>Use trie/prefix index with frequency counters and periodic compaction.</p>

      <h3>2. Ranking</h3>
      <ul>
        <li>Base score: historical popularity by prefix.</li>
        <li>Boosts: freshness, geo relevance, and user context.</li>
      </ul>

      <h3>3. Serving Path</h3>
      <p>Keep hot prefix trees in memory, replicate read nodes, and use asynchronous pipeline for ranking updates.</p>
    `
  }
];
