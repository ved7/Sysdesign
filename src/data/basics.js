const card = (id, title, description, content) => ({ id, title, description, content });

const section = (id, title, cards) => ({ id, title, cards });

export const basicsSections = [

  section('foundations-mindset', '0. System Design Mindset (Must Master)', [
    card(
      'how-to-think',
      'How to Think in System Design',
      'Think in flows, bottlenecks, and trade-offs.',
      '<p>Think in terms of data flow. Where does a request start? Which components process it? Where can it fail? Visualize the journey: client → DNS → load balancer → API gateway → microservice → cache → database → response.</p><p>Strong candidates focus on scale, failures, and trade-offs instead of implementation details. Ask yourself: "What happens when this component dies?" and "How does this behave at 10x scale?"</p><p><strong>Interview Tip:</strong> Always narrate your thought process. Interviewers want to see how you reason, not just your final answer.</p>'
    ),
    card(
      'golden-rule',
      'The Golden Rule',
      'Start simple. Scale only when needed.',
      '<p>Do not over-engineer early. Design a working system first, then scale it step by step. Premature optimization is the root of all evil in system design interviews.</p><p>Begin with a single server (monolith), single database. Identify the bottleneck (usually database reads), then add caching. When writes become the bottleneck, shard the database. When a single service becomes too large, decompose into microservices.</p><p><strong>Pattern:</strong> Vertical scaling → Horizontal scaling → Caching → Database partitioning → Async processing → Microservices</p>'
    ),
    card(
      'three-core-questions',
      '3 Core Questions',
      'Answer these in every design.',
      '<p>1. <strong>How does data flow?</strong> Trace every request from client to persistence layer. Map the network hops, serialization points, and state transitions.</p><p>2. <strong>Where will it break?</strong> Identify single points of failure, resource limits (CPU, memory, connections), and concurrency issues. Consider thundering herd, cascading failures, and retry storms.</p><p>3. <strong>How will you fix it?</strong> Have mitigation strategies ready: circuit breakers, bulkheads, rate limiting, graceful degradation, and auto-scaling policies.</p>'
    ),
    card(
      'interviewer-expectation',
      'What Interviewers Evaluate',
      'Decision-making over knowledge.',
      '<p>They evaluate clarity, trade-offs, and structured thinking. Tools matter less than reasoning. You can mention Redis, but explaining WHY you need a cache and WHAT eviction policy you will use shows mastery.</p><p><strong>Evaluation Rubric:</strong></p><ul><li><strong>Problem-solving:</strong> Can you break down ambiguous requirements?</li><li><strong>Trade-off analysis:</strong> Do you understand CAP theorem implications?</li><li><strong>Depth vs Breadth:</strong> Can you go deep on one component when asked?</li><li><strong>Communication:</strong> Do you check for understanding and collaborate?</li></ul>'
    ),
  ]),

  section('fundamentals', '1. Fundamentals', [
    card(
      'what-is-system-design',
      'What is System Design',
      'Designing systems that survive real-world scale.',
      '<p>System design is about building systems that handle millions of users, failures, and real-world constraints. It is the bridge between "it works on my machine" and "it works for everyone, always."</p><p>It answers one key question: will the system still work under stress? This includes handling traffic spikes (viral content), hardware failures (disk crashes), network partitions (data center outages), and software bugs (memory leaks).</p><p><strong>Key Dimensions:</strong> Scalability, Reliability, Availability, Maintainability, and Cost-efficiency. You cannot maximize all; you must balance them based on business requirements.</p>'
    ),
    card(
      'functional-vs-non-functional',
      'Functional vs Non-Functional Requirements',
      'What the system does vs how well it performs.',
      '<p><strong>Functional</strong> defines features: "Users can post tweets," "Users can follow others," "Users see a timeline." These are the visible behaviors.</p><p><strong>Non-functional</strong> defines performance such as latency (p99 < 200ms), scalability (handle 10M DAU), availability (99.99% uptime), durability (zero data loss), and security (end-to-end encryption). Architecture is driven by non-functional needs.</p><p><strong>Example:</strong> Twitter\'s functional requirement is "post tweet." The non-functional requirement "timeline must load in < 100ms" led to the fan-out-on-write architecture.</p>'
    ),
    card(
      'scalability-vs-performance',
      'Scalability vs Performance',
      'Fast now vs fast at scale.',
      '<p><strong>Performance</strong> is current speed: response time, throughput under normal load. A performant system handles 1000 QPS with 50ms latency.</p><p><strong>Scalability</strong> is maintaining speed as load grows. Can the system handle 10,000 QPS with 60ms latency? Horizontal scaling (adding servers) vs vertical scaling (bigger servers).</p><p><strong>Law of Diminishing Returns:</strong> A single beefy server (vertical) is simpler but hits limits. Distributed systems (horizontal) scale infinitely but introduce network latency and coordination overhead. Always design for growth.</p>'
    ),
    card(
      'latency-vs-throughput',
      'Latency vs Throughput',
      'User experience vs system capacity.',
      '<p><strong>Latency</strong> is response time: the delay between request and response. Measured in percentiles (p50, p95, p99). Users perceive p99, not average. 100ms feels instant; 1 second feels slow.</p><p><strong>Throughput</strong> is requests per second (RPS/QPS): total capacity of the system. A database might handle 10k writes/sec (throughput) but each write takes 5ms (latency).</p><p><strong>Relationship:</strong> Often inverse. Optimizing for low latency (caching) might reduce throughput (cache misses). Optimizing for throughput (batching) increases latency. Good systems balance both based on use case: trading needs low latency; analytics needs high throughput.</p>'
    ),
    card(
      'cap-theorem',
      'CAP Theorem',
      'Trade-offs during failures.',
      '<p>In distributed systems, you choose between Consistency and Availability during network Partitions. You cannot have all three simultaneously when nodes cannot communicate.</p><p><strong>CP (Consistency + Partition tolerance):</strong> Sacrifice availability. The system returns errors or timeouts rather than stale data. Used in banking, inventory systems. Example: HBase, MongoDB (configured), ZooKeeper.</p><p><strong>AP (Availability + Partition tolerance):</strong> Sacrifice strong consistency. The system continues operating with potentially stale data. Used in social media, analytics. Example: Cassandra, DynamoDB, Couchbase.</p><p><strong>Real-world:</strong> Most systems choose AP with eventual consistency, using conflict resolution (vector clocks, last-write-wins) or strong consistency only for critical operations (saga pattern).</p>'
    ),
    card(
      'consistency-models',
      'Consistency Models',
      'Strong vs eventual consistency.',
      '<p><strong>Strong Consistency:</strong> After a write, all subsequent reads return the latest value. Achieved via distributed locking (expensive), consensus protocols (Paxos/Raft), or single-leader replication. Guarantees correctness but sacrifices availability and latency.</p><p><strong>Eventual Consistency:</strong> Reads may return stale data temporarily, but all replicas converge to the same value eventually. Better availability and partition tolerance. Used in DNS, Amazon Dynamo, Cassandra.</p><p><strong>Read-Your-Own-Writes:</strong> A session guarantees seeing its own updates immediately, but other sessions may see stale data. Hybrid approach used in many social platforms.</p><p><strong>Causal Consistency:</strong> Preserves ordering of related operations. If A causes B, everyone sees A before B. Unrelated operations may be seen in different orders.</p>'
    ),
    card(
      'availability-reliability',
      'Availability and Reliability',
      'Uptime vs correctness.',
      '<p><strong>Availability</strong> measures uptime: the percentage of time the system is operational. "Five nines" = 99.999% uptime = 5 minutes downtime/year. Calculated as: MTBF / (MTBF + MTTR) where MTBF is Mean Time Between Failures and MTTR is Mean Time To Repair.</p><p><strong>Reliability</strong> ensures correct behavior: the system does what it promises, even under faults. A system can be available (returns HTTP 200) but unreliable (returns wrong data).</p><p><strong>Strategies:</strong> Redundancy (active-active, active-passive), automated failover, health checks, chaos engineering (Netflix Simian Army), graceful degradation (read-only mode during outages).</p>'
    ),
    card(
      'fault-tolerance-redundancy',
      'Fault Tolerance and Redundancy',
      'Systems must survive failures.',
      '<p><strong>Fault Tolerance:</strong> The system continues operating when components fail. No single point of failure (SPOF). Techniques include replication, circuit breakers, bulkheads (isolate failures), and automatic retries with exponential backoff.</p><p><strong>Redundancy Types:</strong></p><ul><li><strong>Active-Active:</strong> Multiple nodes handling traffic simultaneously. Fast failover but complex consistency.</li><li><strong>Active-Passive:</strong> Standby nodes take over on failure. Simpler but slower failover (minutes).</li><li><strong>N+1 Redundancy:</strong> One extra component for every N active ones.</li></ul><p><strong>Failure Modes:</strong> Hardware (disks, RAM), Network (partitions, latency), Software (bugs, memory leaks), Human (configuration errors). Design for each.</p>'
    ),
  ]),

  section('intuition-builders', '2. Intuition Builders', [
    card(
      'single-server-thinking',
      'Start with One Server',
      'Always begin simple.',
      '<p>Design a single-server system first. Then scale by identifying bottlenecks step by step. This demonstrates structured thinking and prevents over-engineering.</p><p><strong>Single Server Architecture:</strong> Client → Web Server (NGINX/Apache) → Application (Node/Java/Go) → Database (PostgreSQL/MySQL) → Disk (files/images).</p><p><strong>First Bottleneck:</strong> Usually database connections or disk I/O. Solution: Add caching (Redis/Memcached). Second bottleneck: CPU on web server. Solution: Load balancer + multiple app servers. Third: Database writes. Solution: Primary-replica replication, then sharding.</p><p><strong>Rule of Thumb:</strong> Each layer should handle 10x the traffic of the layer below it. If you expect 1M users, design the app layer for 10M and the data layer for 100M.</p>'
    ),
    card(
      'bottleneck-thinking',
      'Bottleneck Thinking',
      'Fix the weakest link.',
      '<p>Every system fails at a bottleneck such as DB, CPU, network, or memory. Amdahl\'s Law: speedup is limited by the sequential portion. Optimize only what breaks first.</p><p><strong>Identification:</strong> Use profiling (CPU cycles), monitoring (p99 latency spikes), and load testing (find breaking point). Common bottlenecks:</p><ul><li><strong>Database:</strong> Connection pool exhaustion, slow queries (missing indexes), lock contention</li><li><strong>Network:</strong> Bandwidth saturation, serialization overhead, chatty APIs (N+1 queries)</li><li><strong>Memory:</strong> Garbage collection pauses, memory leaks, cache thrashing</li><li><strong>Disk:</strong> Random I/O on HDDs (use SSDs), fsync latency for WAL</li></ul><p><strong>Solution Patterns:</strong> Caching (reduce load), Connection pooling (reuse), Async processing (decouple), CDN (edge caching).</p>'
    ),
    card(
      'read-vs-write-heavy',
      'Read vs Write Heavy',
      'Design depends on usage.',
      '<p><strong>Read-Heavy Systems (90%+ reads):</strong> News sites, product catalogs, social media feeds. Strategies: Aggressive caching (CDN, Redis), database replicas for read scaling, materialized views, and search indexes (Elasticsearch).</p><p><strong>Write-Heavy Systems:</strong> Logging, IoT telemetry, financial transactions. Strategies: Write-ahead logging (WAL), message queues (Kafka) for buffering, batch writes, LSM-tree databases (Cassandra, RocksDB), and columnar storage for analytics.</p><p><strong>Mixed Workloads:</strong> Use Command Query Responsibility Segregation (CQRS). Separate read models (optimized for queries) from write models (optimized for transactions). Event sourcing: store events, project read models asynchronously.</p>'
    ),
    card(
      'fanout-problem',
      'Fan-out Problem',
      'Scaling distribution.',
      '<p>Sending data to millions of users is expensive. Fan-out is the process of distributing one event to many recipients. Complexity: O(N) where N is follower count.</p><p><strong>Fan-out on Write (Push):</strong> When user posts, push to all followers\' feeds immediately. Pros: Read is O(1) fast. Cons: Write is O(N) slow; celebrities (10M followers) cause write amplification.</p><p><strong>Fan-out on Read (Pull):</strong> When user opens app, pull from all followed users and merge. Pros: Write is O(1) fast. Cons: Read is O(N) slow; high latency for users following many accounts.</p><p><strong>Hybrid Approach (Twitter model):</strong> Fan-out on write for normal users (< 1000 followers), fan-out on read for celebrities. Use separate ingestion pipelines.</p>'
    ),
    card(
      'hotspot-problem',
      'Hotspot Problem',
      'Uneven load kills systems.',
      '<p>Popular data can overload one shard. Examples: Celebrity tweets (same row updated millions of times), Black Friday product page, viral content.</p><p><strong>Causes:</strong> Poor partitioning (hash of user_id clusters popular users), temporal locality (everyone checks weather at 8 AM), and geographic concentration (local events).</p><p><strong>Solutions:</strong></p><ul><li><strong>Caching:</strong> L1 (in-app), L2 (Redis), L3 (CDN). Cache the hot data everywhere.</li><li><strong>Replication:</strong> Read replicas for the hot shard. Write scaling requires sharding the hot data further (e.g., shard by tweet_id + timestamp).</li><li><strong>Load shedding:</strong> Drop non-critical requests during peaks (return cached stale data).</li><li><strong>Partitioning strategy:</strong> Use composite keys (user_id + date) to spread writes.</li></ul>'
    ),
  ]),

  section('interview-approach', '3. Interview Approach (FAANG Level)', [
    card(
      'step-1',
      'Step 1: Clarify Requirements',
      'Never assume.',
      '<p>Ask about scale, users, latency, and constraints before designing. A system for 1000 users differs radically from one for 100 million.</p><p><strong>Questions to Ask:</strong></p><ul><li>What is the daily active user (DAU) count?</li><li>What is the read-to-write ratio?</li><li>What is the acceptable latency for reads vs writes?</li><li>Are there geographic constraints (data residency)?</li><li>What is the budget for infrastructure?</li><li>Is consistency or availability more critical?</li></ul><p><strong>Example:</strong> "Design Twitter" - clarify: Is it just tweeting, or also DMs, Spaces, and video? Global or regional? Real-time or near real-time?</p>'
    ),
    card(
      'step-2',
      'Step 2: Estimation',
      'Think in numbers.',
      '<p>Estimate users, QPS, and storage. This drives architecture decisions and shows engineering maturity.</p><p><strong>Back-of-Envelope Calculations:</strong></p><ul><li><strong>QPS:</strong> 100M DAU × 10 requests/day ÷ 86400 seconds ≈ 12,000 QPS average. Peak = 5× average = 60,000 QPS.</li><li><strong>Storage:</strong> 1M tweets/day × 280 bytes × 5 years = 511 GB text. Media: 1M images × 2MB = 2TB/day.</li><li><strong>Bandwidth:</strong> 2TB/day ÷ 86400 ≈ 24MB/sec incoming. Outgoing (100M views) = 2.4GB/sec.</li></ul><p><strong>Rule of 3:</strong> Estimate best case, expected case, worst case. Design for expected, have capacity for worst.</p>'
    ),
    card(
      'step-3',
      'Step 3: High-Level Design',
      'Start simple.',
      '<p>Design basic flow: client, server, database, cache. Draw boxes and arrows. Keep it abstract - no class diagrams yet.</p><p><strong>Components to Include:</strong></p><ul><li><strong>Client:</strong> Mobile apps, web, third-party APIs</li><li><strong>DNS/CDN:</strong> Route users to nearest data center, cache static assets</li><strong>Load Balancer:</strong> Distribute traffic (round-robin, least connections)</li><li><strong>API Gateway:</strong> Authentication, rate limiting, request routing</li><li><strong>Application Services:</strong> User service, feed service, post service (microservices or monolith)</li><li><strong>Data Layer:</strong> SQL for structured data, NoSQL for flexible schema, Cache for speed, Object storage for media</li></ul><p><strong>Check:</strong> Can you explain the data flow end-to-end in 2 minutes?</p>'
    ),
    card(
      'step-4',
      'Step 4: Identify Bottlenecks',
      'What breaks first?',
      '<p>Scale the weakest component using caching, load balancing, or partitioning. Walk through your high-level design with your QPS estimates.</p><p><strong>Bottleneck Analysis:</strong></p><ul><li>Single database? → Connection limits (typically 100-1000), disk IOPS</li><li>Single API server? → CPU saturation, memory limits</li><li>No caching? → Database overload on popular content</li><li>Synchronous processing? → Request queuing, timeouts</li></ul><p><strong>Scaling Strategies:</strong></p><ul><li>Vertical scaling: Bigger instance (temporary fix)</li><li>Horizontal scaling: More instances behind load balancer</li><li>Caching: Redis/Memcached for hot data</li><li>CDNs: CloudFlare/AWS CloudFront for static content</li><li>Database sharding: Partition by user_id or region</li></ul>'
    ),
    card(
      'step-5',
      'Step 5: Deep Dive',
      'Go deeper when asked.',
      '<p>Discuss database schema, APIs, and scaling strategies. The interviewer will probe specific areas. Be ready to go deep on any component.</p><p><strong>Database Schema:</strong> Design tables, indexes, and relationships. Normalize vs denormalize. Explain why you chose PostgreSQL over MongoDB (or vice versa).</p><p><strong>API Design:</strong> REST vs GraphQL vs gRPC. Define endpoints: POST /api/v1/tweets, GET /api/v1/feed. Request/response formats, pagination (cursor vs offset), idempotency keys.</p><p><strong>Advanced Topics:</strong> Distributed transactions (Saga pattern), consensus algorithms (Raft), consistent hashing, gossip protocols, CRDTs for collaborative editing.</p>'
    ),
    card(
      'step-6',
      'Step 6: Trade-offs',
      'Explain your decisions.',
      '<p>Discuss why you chose consistency vs availability, cost vs performance. Every decision has a cost. Acknowledge it and justify your choice based on requirements.</p><p><strong>Common Trade-offs:</strong></p><ul><li><strong>SQL vs NoSQL:</strong> ACID vs scalability, structured vs flexible schema</li><li><strong>Microservices vs Monolith:</strong> Independent deployment vs operational complexity</li><li><strong>Synchronous vs Asynchronous:</strong> Simplicity vs resilience, latency vs throughput</li><li><strong>Strong consistency vs Eventual consistency:</strong> Correctness vs availability</li><li><strong>Client-side rendering vs Server-side:</strong> Interactivity vs SEO, initial load time</li></ul><p><strong>Framework:</strong> "I chose X because [requirement]. The trade-off is [cost]. To mitigate, I would [strategy]."</p>'
    ),
  ]),

];

export const getAllBasicsCards = () =>
  basicsSections.flatMap((s) => s.cards.map((c) => ({ ...c, sectionId: s.id, sectionTitle: s.title })));

export const getBasicById = (id) => getAllBasicsCards().find((c) => c.id === id);
