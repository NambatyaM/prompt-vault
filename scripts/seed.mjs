/**
 * PromptVault Seed Script
 *
 * Creates sample users and prompts so the platform doesn't look empty.
 *
 * Usage:
 *   1. Set up your .env.local with Supabase keys
 *   2. Run: node scripts/seed.mjs
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, "..", ".env.local")
  let content
  try {
    content = readFileSync(envPath, "utf-8")
  } catch {
    console.error("❌ .env.local not found. Copy .env.example to .env.local and fill in your keys.")
    process.exit(1)
  }

  const env = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local")
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Users ──────────────────────────────────────────

const USERS = [
  {
    email: "sarah@example.com",
    password: "DemoPassword123!",
    username: "sarahchen",
    bio: "AI product photographer. Turned Etsy store around with Midjourney.",
  },
  {
    email: "marcus@example.com",
    password: "DemoPassword123!",
    username: "marcusdev",
    bio: "Full-stack dev who codes 3x faster with AI. Sharing what works.",
  },
]

async function createUser({ email, password, username, bio }) {
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1)

  if (existing?.[0]) {
    console.log(`  ↻ User "${username}" already exists, skipping`)
    return existing[0].id
  }

  const { data: userData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (signUpError) {
    console.error(`  ✗ Failed to create user "${username}": ${signUpError.message}`)
    return null
  }

  const userId = userData.user.id

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    username,
    bio,
  })

  if (profileError) {
    console.error(`  ✗ Failed to create profile for "${username}": ${profileError.message}`)
    return null
  }

  console.log(`  ✓ Created user "${username}" (${email})`)
  return userId
}

// ── Prompts ────────────────────────────────────────

const PROMPTS = [
  {
    user: "sarahchen",
    title: "Midjourney Product Photography That Converts",
    prompt_text:
      "A [product] on a minimalist [color] background with soft studio lighting from the top left, shallow depth of field, subtle shadows, commercial product photography style, 8K detail --ar 4:5 --v 6.1 --s 250",
    tool_used: "Midjourney",
    category: "image",
    description:
      "A product photography prompt that consistently produces e-commerce-ready images. I used this for my Etsy store and my conversion rate doubled within two weeks.",
    proof_link: "https://etsy.com/shop/example",
    outcome_text: "Doubled Etsy conversion rate in 2 weeks",
    ai_model_version: "Midjourney v6.1",
    license_type: "commercial",
    is_premium: true,
    price: 499,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Consistent Character Sheet for Midjourney",
    prompt_text:
      "Character design sheet for [character description], multiple poses: front view, side view, 3/4 view, action pose. Same character in all frames, consistent [clothing style] outfit, clean white background, character concept art style, uniform lighting across all panels --ar 16:9 --v 6.1 --s 50 --cw 100",
    tool_used: "Midjourney",
    category: "image",
    description:
      "Solves Midjourney's biggest problem: character consistency. I used this to create a consistent cast for a webcomic pilot that got picked up by a publisher.",
    proof_link: "https://twitter.com/sarahchen/status/example",
    outcome_text: "Webcomic pilot got picked up by a publisher",
    ai_model_version: "Midjourney v6.1",
    license_type: "personal",
    is_premium: false,
    price: null,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Full Next.js CRUD API Route Generator",
    prompt_text:
      "Generate a Next.js App Router API route at [path] that handles [method] requests for [resource]. Include:\n- Zod validation for the request body\n- Proper HTTP status codes (200, 201, 400, 404, 500)\n- TypeScript types for request/response\n- Error handling with try/catch\n- Rate limiting comment placeholder\n\nGenerate the full file contents only, no explanation.",
    tool_used: "Claude",
    category: "code",
    description:
      "I scaffolded 12 API routes in a single afternoon with this prompt. Saved at least 3 full days of boilerplate work on a SaaS I was building.",
    proof_link: "https://github.com/marcusdev/saas-scaffold",
    outcome_text: "Saved 3 days of boilerplate work",
    ai_model_version: "Claude Sonnet 4.6",
    license_type: "commercial",
    is_premium: true,
    price: 799,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "PostgreSQL Query Optimizer Prompt",
    prompt_text:
      "Analyze this PostgreSQL query and suggest optimizations:\n\n```sql\n[query]\n```\n\nFor each suggestion, explain:\n1. Why the current approach is slow\n2. The optimized query\n3. What indexes would help (with CREATE INDEX statements)\n4. Expected performance improvement (estimated)\n\nFocus on: index usage, JOIN strategies, subquery elimination, and EXPLAIN ANALYZE interpretation.",
    tool_used: "ChatGPT",
    category: "code",
    description:
      "Used this with a slow admin dashboard query that was timing out at 30 seconds. The optimized version ran in 200ms. Applied to 5 other queries with similar results.",
    proof_link: "https://marcusdev.dev/blog/query-optimization",
    outcome_text: "Cut query time from 30s to 200ms",
    is_premium: false,
    price: null,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "SaaS Cold Email That Got 40% Open Rate",
    prompt_text:
      "Write a cold email for [product] aimed at [target audience]. Use this structure:\n\nSubject: [problem] for [audience role]?\n\nLine 1: Mention something specific about their company or work.\nLine 2: State the problem they're likely feeling.\nLine 3: Present [product] as the solution in one sentence.\nLine 4: Social proof — one specific result.\nLine 5: Single CTA (book a 15-min call).\n\nKeep it under 120 words. No jargon. No fluff.",
    tool_used: "ChatGPT",
    category: "copywriting",
    description:
      "Generated cold emails for a B2B SaaS launch. Hand-written emails by our best copywriter got 28% open rate. This template got 40%. We used it for all 3,000 outbound emails.",
    proof_link: "https://twitter.com/marcusdev/status/example",
    outcome_text: "40% open rate, 12% reply rate vs 28%/6% control",
    is_premium: true,
    price: 1299,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Viral TikTok Hook Generator",
    prompt_text:
      "Generate 10 TikTok hook ideas for a video about [topic] targeting [audience].\n\nFor each hook, provide:\n1. The hook text (max 10 words, must grab attention in first 2 seconds)\n2. Hook type (curiosity gap / controversy / pattern-interrupt / direct benefit)\n3. Why it works psychologically\n\nRank them by predicted hook rate (higher = more people watch past 3 seconds).",
    tool_used: "ChatGPT",
    category: "copywriting",
    description:
      "Used this to generate hooks for a client's TikTok account. Grew from 2k to 45k followers in 3 months. The 'curiosity gap' hooks consistently outperformed everything else.",
    proof_link: "https://tiktok.com/@sarahchen",
    outcome_text: "Grew from 2k to 45k followers in 3 months",
    is_premium: false,
    price: null,
    moderated: true,
  },

  // ── AI Agent & MCP Prompts ──────────────────────

  {
    user: "marcusdev",
    title: "Full MCP Server Scaffold Generator",
    prompt_text:
      "Generate a Model Context Protocol (MCP) server in [language] that exposes [tool/list] tools. Follow the MCP specification: include proper JSON-RPC 2.0 message formatting, tool discovery via 'listTools', tool execution via 'callTool', error handling with error codes, and logging. Structure the project with: src/index.ts (entry point), src/tools/ (one file per tool), src/types.ts (shared types), tests/. Add a README with install/run/usage instructions. Use [framework] for the transport layer.",
    tool_used: "Claude",
    category: "code",
    description:
      "Used this to scaffold MCP servers for 5 different AI assistant integrations. The generated structure follows the spec perfectly and saved weeks of reading protocol docs. Deployed one as a VS Code extension for internal team use.",
    proof_link: "https://github.com/marcusdev/mcp-servers",
    outcome_text: "Shipped 5 MCP servers in 2 weeks instead of 3 months",
    is_premium: true,
    price: 1499,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Agentic RAG Pipeline Builder",
    prompt_text:
      "Design and implement an agentic RAG (Retrieval-Augmented Generation) pipeline with the following components:\n\n1. Document ingestion: support PDF, HTML, Markdown, code files\n2. Chunking strategy: semantic chunking with overlap, configurable chunk size\n3. Embedding: use [model] via [provider], with caching layer\n4. Vector storage: [vector_db] with hybrid search (dense + sparse)\n5. Agent layer: ReAct agent that can:\n   - Decompose complex queries into sub-queries\n   - Decide when to retrieve vs. use internal knowledge\n   - Filter/rerank results before answering\n   - Cite sources with page/section references\n6. Query router: classify intent and route to appropriate retriever\n\nOutput full TypeScript implementation with LangGraph or similar framework.",
    tool_used: "Claude",
    category: "code",
    description:
      "Built the retrieval backbone for a legal document analysis SaaS. The agentic approach cut hallucination rate by 80% compared to naive RAG. Scaled to 50k+ documents in production.",
    proof_link: "https://marcusdev.dev/blog/agentic-rag",
    outcome_text: "80% fewer hallucinations, production-ready at 50k docs",
    is_premium: true,
    price: 2499,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Multi-Agent Orchestration Framework",
    prompt_text:
      "Design a multi-agent orchestration system with the following architecture:\n\n- Supervisor agent: receives user request, decomposes into subtasks, assigns to specialist agents\n- Specialist agents: [code_agent, research_agent, review_agent, deploy_agent]\n- Each specialist has: system prompt, available tools, output schema, max iterations\n- Handoff protocol: agents pass context via structured messages with confidence scores\n- Memory: shared working memory (ephemeral) + long-term memory (persistent via vector store)\n- Human-in-the-loop: supervisor pauses for approval on high-stakes decisions\n- Observability: each agent step is logged with token usage, latency, decision trace\n\nGenerate the full system in Python using LangGraph or CrewAI style patterns. Include Docker compose for local dev.",
    tool_used: "ChatGPT",
    category: "code",
    description:
      "Used this architecture for an automated code review and deployment pipeline. The multi-agent system now handles 200+ PRs per week across 15 repos. Cut review cycle from 2 days to 4 hours.",
    proof_link: "https://github.com/marcusdev/agent-orchestrator",
    outcome_text: "Automated 200+ PR reviews/week, review cycle down 4x",
    is_premium: true,
    price: 2999,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "AI Agent Function-Calling SDK Generator",
    prompt_text:
      "Generate a function-calling SDK for AI agents in TypeScript. Include:\n\n1. Tool definition schema (name, description, parameters using JSON Schema)\n2. Function registry with validation and error handling\n3. Type-safe wrapper generators for:\n   - REST API calls (with auth, retry, rate limiting)\n   - Database queries (parameterized, with result mapping)\n   - File system operations (scoped to allowed directories)\n   - Shell command execution (sandboxed, with timeout)\n4. Auto-generated OpenAI/Anthropic tool format converters\n5. Built-in confirmation prompts for destructive operations\n6. Usage tracking with token cost estimation\n\nOutput as a publishable npm package with full test coverage.",
    tool_used: "Claude",
    category: "code",
    description:
      "Built the internal agent SDK for a startup's AI platform. Cut agent integration time from 3 weeks to 2 days per new tool. Open-sourced and got 600+ GitHub stars.",
    proof_link: "https://github.com/marcusdev/agent-tools-sdk",
    outcome_text: "600+ GitHub stars, integration time cut from 3 weeks to 2 days",
    is_premium: true,
    price: 1999,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Claude Computer Use Automation Script",
    prompt_text:
      "Create an automation script using Claude's computer use capability to:\n\nTask: [describe the UI automation task]\n\nStructure the script as:\n1. Screenshot current state\n2. Analyze UI elements using vision\n3. Plan steps (up to [N] steps)\n4. Execute actions: mouse_move, click, type, scroll, key_press\n5. Verify result with screenshot comparison\n6. Handle errors with retry (max 3) or graceful failure\n\nInclude: coordinate normalization for different screen sizes, wait-for-element logic, and a dry-run mode that logs planned actions without executing. Output in Python.",
    tool_used: "Claude",
    category: "code",
    description:
      "Used this to automate a repetitive data entry workflow across 3 legacy systems. The computer use agent now processes 500 records per day that previously required a full-time employee.",
    proof_link: "https://sarahchen.dev/blog/automation",
    outcome_text: "Replaced 1 FTE, 500 records/day automated",
    is_premium: true,
    price: 1799,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "End-to-End SaaS Codebase Generator",
    prompt_text:
      "Generate a complete SaaS starter codebase with the following stack preferences:\n\nFrontend: [framework: Next.js/React/Vue] with TypeScript\nBackend: [language/framework] with REST + GraphQL API\nDatabase: [PostgreSQL/MongoDB] with ORM [Prisma/Drizzle/TypeORM]\nAuth: [JWT/Session/OAuth] with email/password + Google OAuth\nPayments: [Stripe/LemonSqueezy] subscription and one-time billing\nEmail: [Resend/SendGrid/Postmark] for transactional + marketing\nDeployment: Docker compose + [Vercel/Railway/AWS] configs\n\nGenerate the full project structure including:\n- Monorepo setup with Turborepo or Nx\n- Shared types package\n- API client SDK (auto-generated from types)\n- Admin dashboard with user management\n- Webhook handler framework\n- Background job queue setup\n- Testing setup (unit, integration, e2e)\n- CI/CD pipelines (GitHub Actions)\n- Environment variable validation\n- Error tracking and monitoring setup\n- Seed scripts for demo data\n\nAll code must be production-ready with proper error handling, logging, and security best practices.",
    tool_used: "Claude",
    category: "code",
    description:
      "Generated the initial codebase for a SaaS I co-founded. What would have taken 2 months to scaffold was ready in 3 days. The generated auth and payment flows needed zero changes before launch.",
    proof_link: "https://saas-starter.marcusdev.dev",
    outcome_text: "2 months of work done in 3 days, shipped to beta in 2 weeks",
    is_premium: true,
    price: 4999,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Automated Code Audit & Security Scanner",
    prompt_text:
      "Act as a senior security engineer. Audit the following codebase for:\n\n1. OWASP Top 10 vulnerabilities (injection, broken auth, XSS, insecure deserialization, etc.)\n2. Supply chain risks (outdated deps with known CVEs, malicious packages)\n3. Secrets exposure (hardcoded keys, tokens in comments, .env in repo)\n4. Authentication flaws (session management, password policies, MFA gaps)\n5. Authorization issues (IDOR, privilege escalation, missing access controls)\n6. Data validation gaps (missing input sanitization, unsafe deserialization)\n7. Rate limiting and abuse prevention gaps\n8. Logging and monitoring gaps (missing audit trails)\n9. Dependency vulnerabilities with suggested fixes\n10. Compliance gaps (GDPR, SOC2, HIPAA relevant requirements)\n\nFor each finding:\n- Severity (Critical/High/Medium/Low)\n- File & line number reference\n- Exploit scenario\n- Remediation code (exact fix)\n- CVE/CWE reference if applicable\n\nGenerate a full audit report in markdown with executive summary, findings table, and remediation roadmap.",
    tool_used: "ChatGPT",
    category: "code",
    description:
      "Ran this prompt against our production codebase before a SOC2 audit. It found 23 vulnerabilities including a critical IDOR bug our manual review missed. The generated report was good enough to share with auditors directly.",
    proof_link: "https://marcusdev.dev/blog/security-audit",
    outcome_text: "Found 23 vulns including critical IDOR, passed SOC2 audit first try",
    is_premium: true,
    price: 3499,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Test Suite Generator with Property-Based Testing",
    prompt_text:
      "Generate a comprehensive test suite for the following module:\n\nModule: [paste code or describe module]\n\nGenerate tests covering:\n1. Unit tests (all public functions, edge cases, error paths)\n2. Integration tests (database, API, external service interactions)\n3. Property-based tests using fast-check or similar:\n   - Invariants that should always hold\n   - Idempotency checks\n   - Round-trip (serialize/deserialize) tests\n   - Bounds/limit testing for numeric inputs\n   - Malformed input fuzzing\n4. Contract tests for API endpoints (request/response shape validation)\n5. Performance baseline tests (response times, memory usage)\n6. Concurrent access tests (race conditions, deadlocks)\n\nUse [Vitest/Jest/Mocha] with [testing-library/supertest/cypress].\n\nOrganize output as: test files with imports ready, mock fixtures, CI config that runs tests in parallel.",
    tool_used: "Claude",
    category: "code",
    description:
      "Used this to generate test suites for a microservices migration. Achieved 94% code coverage across 12 services. Property-based tests caught 3 edge cases that manual tests missed.",
    proof_link: "https://github.com/marcusdev/test-gen-demo",
    outcome_text: "94% coverage across 12 microservices, 3 edge-case bugs found",
    is_premium: true,
    price: 1999,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "AI-Powered Database Migration Generator",
    prompt_text:
      "Generate a safe database migration plan and code for migrating from [source_db] to [target_db].\n\nRequirements:\n1. Schema mapping: analyze source schema, generate equivalent target schema\n2. Data type mapping table with edge cases for each type\n3. Migration strategies based on downtime tolerance:\n   - Option A: Zero-downtime (dual-write + backfill)\n   - Option B: Offline migration (fastest)\n   - Option C: Hybrid with feature flags\n4. Generate the actual migration scripts with:\n   - Schema creation (idempotent)\n   - Data transformation logic\n   - Batch processing with checkpoint/resume\n   - Validation queries (row counts, checksums, sample spot-checks)\n5. Rollback plan: generate reverse migration scripts\n6. Performance impact analysis: expected migration time, IOPS, storage\n7. Testing strategy: dry-run mode, staging migration, canary deployment\n\nOutput as executable migration scripts with monitoring checkpoints and alert thresholds.",
    tool_used: "Claude",
    category: "code",
    description:
      "Used this to migrate a production PostgreSQL database (2TB, 200+ tables) to a new schema design. The generated migration ran for 14 hours with zero data loss and only 47 seconds of read-only downtime.",
    proof_link: "https://marcusdev.dev/blog/db-migration",
    outcome_text: "2TB database migrated with zero data loss, 47s downtime",
    is_premium: true,
    price: 3999,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Production Incident Response Runbook Generator",
    prompt_text:
      "Generate a comprehensive incident response runbook for the following system:\n\nArchitecture: [describe system architecture]\nStack: [languages, frameworks, infrastructure]\n\nCreate runbooks for these incident types:\n\n1. High CPU/Memory: how to identify the process, sample thread dumps, analyze heap, mitigation steps\n2. Database contention: identify slow queries, blocking chains, deadlocks, connection pool exhaustion\n3. API degradation: rate limiting, upstream dependency failures, gradual vs. sudden degradation\n4. Deployment failure: rollback procedure, feature flag toggling, canary analysis\n5. Security incident: account compromise, data breach (with legal hold instructions), DDoS\n6. Certificate expiration: renewal steps, automated rotation setup\n7. Storage filling up: identify largest consumers, cleanup strategies, retention policy enforcement\n\nEach runbook must include:\n- Detection (alerts, dashboards, logs to check)\n- Triage (severity classification matrix)\n- Response (step-by-step with exact commands/URLs)\n- Communication template (status page update, stakeholder email)\n- Post-mortem template\n- Automation opportunities (what to script for next time)",
    tool_used: "ChatGPT",
    category: "copywriting",
    description:
      "Generated runbooks for our platform after an on-call rotation from hell. We went from 2-hour MTTR to 25 minutes. The runbooks now serve as our primary incident response docs.",
    proof_link: "https://sarahchen.dev/blog/incident-response",
    outcome_text: "MTTR dropped from 2 hours to 25 minutes",
    is_premium: true,
    price: 1299,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Kubernetes Microservice Scaffolder",
    prompt_text:
      "Generate a complete Kubernetes microservice template with:\n\nService name: [name]\nLanguage: [Go/Python/Node/Java]\nPort: [port]\n\nOutput:\n\n1. Dockerfile (multi-stage build, distroless target, security scan)\n2. Kubernetes manifests:\n   - Deployment (resource limits, probes, pod disruption budget, topology spread)\n   - Service (with headless option for stateful workloads)\n   - ConfigMap + Secret templates\n   - HorizontalPodAutoscaler (CPU/memory + custom metrics)\n   - PodDisruptionBudget\n   - NetworkPolicy (least privilege)\n   - ServiceMonitor (Prometheus operator)\n3. Helm chart with values.yaml (dev/staging/prod defaults)\n4. Skaffold config for local dev\n5. CI pipeline: build → test → scan → push → deploy (GitHub Actions)\n6. Health check endpoint implementation in [language]\n7. Structured logging setup (JSON output, correlation IDs)\n8. OpenTelemetry instrumentation (traces + metrics)\n9. Graceful shutdown handling\n\nAll manifests must pass kubeconform validation and kubesec security scoring.",
    tool_used: "Claude",
    category: "code",
    description:
      "Used this to standardize 25 microservices across 4 engineering teams. Cut new service setup from 2 weeks to 4 hours. All services now pass SOC2 security requirements out of the box.",
    proof_link: "https://github.com/marcusdev/k8s-template",
    outcome_text: "New service setup: 2 weeks → 4 hours, standardized 25 services",
    is_premium: true,
    price: 2999,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Comprehensive CI/CD Pipeline Generator",
    prompt_text:
      "Design and generate a CI/CD pipeline for a [monorepo/microservices/monolith] project using [GitHub Actions/GitLab CI/CircleCI].\n\nThe pipeline must include these stages:\n\n1. Lint & Format: ESLint, Prettier, commit message lint\n2. Type Check: TypeScript strict mode\n3. Unit Tests: run in parallel with coverage thresholds\n4. Integration Tests: with service containers (DB, Redis, etc.)\n5. Build: Docker image with SBOM generation and vulnerability scan\n6. Security Scan: SAST (Semgrep/CodeQL), SCA (Dependabot/Renovate), secret detection\n7. E2E Tests: Playwright/Cypress with test retry and video on failure\n8. Deploy:\n   - Dev: auto-deploy on PR\n   - Staging: auto-deploy on main merge with smoke tests\n   - Production: manual approval gate with canary (10% → 50% → 100%)\n9. Post-deploy:\n   - Synthetic monitoring checks\n   - Performance regression comparison\n   - Error rate monitoring (auto-rollback if >1% error rate)\n\nInclude: caching strategy, parallelism config, artifact retention policy, notification config (Slack/Discord), and a badge template for README.",
    tool_used: "ChatGPT",
    category: "code",
    description:
      "Standardized CI/CD across my agency's 8 client projects. Deployment failures dropped by 90% and we went from manual Friday-afternoon deploys to multiple deploys per day with zero anxiety.",
    proof_link: "https://sarahchen.dev/blog/ci-cd",
    outcome_text: "90% fewer deployment failures, 8 clients standardized",
    is_premium: true,
    price: 1499,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "AI Chatbot with Tool-Using Agent (Full Stack)",
    prompt_text:
      "Build a full-stack AI chatbot with tool-using capabilities:\n\nFrontend: React/Next.js chat UI with streaming responses, markdown rendering, tool call visualization (expandable cards showing what tools were called and their results), conversation history sidebar, code syntax highlighting, file upload for context\n\nBackend: API route that:\n1. Accepts user message + conversation history\n2. Routes through a ReAct agent loop:\n   - Think: determine if tools are needed\n   - Act: call relevant tools (web search, calculator, database query, code execution sandbox)\n   - Observe: process tool results\n   - Respond: generate final answer with citations\n3. Streams response via Server-Sent Events\n4. Stores conversations in [PostgreSQL/MongoDB] with vector embeddings for retrieval\n\nTools to implement:\n- Web search with result summarization\n- Calculator with step-by-step reasoning\n- Code execution in sandboxed environment\n- Knowledge base RAG (index uploaded docs)\n- Image generation (DALL-E/Stable Diffusion)\n- Data visualization (generate charts from data)\n- Calendar scheduling\n\nTypeScript/Next.js full implementation.",
    tool_used: "Claude",
    category: "code",
    description:
      "Built this for a legal tech startup. The tool-using chatbot replaced their team of 3 paralegals for initial case research. Streaming responses and tool call visualization made it trusted by lawyers who were skeptical of AI.",
    proof_link: "https://github.com/marcusdev/agent-chat",
    outcome_text: "Replaced 3 paralegals, 94% user satisfaction among lawyers",
    is_premium: true,
    price: 4499,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "API Contract & Documentation Generator",
    prompt_text:
      "Generate OpenAPI 3.1 documentation and type-safe API client for the following:\n\nSource: [paste endpoint definitions, code, or Postman collection]\n\nOutput:\n\n1. OpenAPI 3.1 spec (YAML + JSON): complete with schemas, endpoints, auth, rate limits, examples\n2. TypeScript/React Query hooks (or equivalent): typed hooks for every endpoint with:\n   - Proper error types\n   - Optimistic updates for mutations\n   - Infinite query support for paginated endpoints\n   - Request cancellation\n   - Retry logic with exponential backoff\n3. API client SDK: fully typed fetch/axios wrapper with:\n   - Base URL configuration\n   - Auth token management (with refresh logic)\n   - Request/response interceptors\n   - Rate limiting awareness (retry-after handling)\n4. Generated mocks for testing: MSW handlers or similar\n5. Postman collection export\n6. API changelog generator (compare two OpenAPI specs)\n\nAll generated code must be ready to drop into a project and work immediately.",
    tool_used: "Claude",
    category: "code",
    description:
      "Generated the public API documentation for a fintech startup. The typed SDK caught 14 type mismatches before launch. The documentation passed their bank's API review on the first submission.",
    proof_link: "https://sarahchen.dev/blog/api-docs",
    outcome_text: "14 type bugs caught pre-launch, bank API review passed first try",
    is_premium: true,
    price: 999,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Performance & Load Test Suite Generator",
    prompt_text:
      "Generate a production-grade load testing suite for the following system:\n\nSystem: [describe API/application]\nEndpoints: [list critical endpoints]\nExpected traffic: [RPS, concurrent users, peak patterns]\n\nGenerate tests using [k6/artillery/locust]:\n\n1. Smoke test: 1 VU, 1 iteration — verify basic functionality\n2. Load test: expected traffic × 1.5 for 30 minutes — steady state\n3. Stress test: ramp from 0 to 5× expected traffic until failure — find breaking point\n4. Spike test: jump to 10× traffic for 30 seconds — recovery behavior\n5. Soak test: expected traffic for 8 hours — memory leaks, connection pool issues\n6. Endurance test: 70% peak traffic for 48 hours\n7. Chaos test: randomly kill containers during load (if Kubernetes)\n\nFor each test generate:\n- Script with realistic request bodies and auth tokens\n- Thresholds (p95 < 200ms, error rate < 0.1%, no failures)\n- Prometheus/Grafana dashboard JSON\n- Test report template with interpretation guide\n- CI integration (GitHub Actions step that fails on threshold breach)\n\nInclude a decision tree: which test to run based on what changed (code change, config change, infra change, dependency update).",
    tool_used: "ChatGPT",
    category: "code",
    description:
      "Ran this against our API before a Black Friday sale. The soak test revealed a memory leak in our connection pool that would have caused a 45-minute outage. Fixed it before launch. Sale ran flawlessly with 50k concurrent users.",
    proof_link: "https://marcusdev.dev/blog/load-testing",
    outcome_text: "Found memory leak during soak test, handled 50k concurrent users on Black Friday",
    is_premium: true,
    price: 2499,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Full SaaS Metrics & Analytics Dashboard Generator",
    prompt_text:
      "Generate a complete SaaS business analytics dashboard with:\n\nData source: [PostgreSQL/BigQuery/Snowflake]\n\nDashboard sections:\n\n1. Revenue:\n   - MRR/ARR chart with trendline\n   - Revenue by plan tier\n   - Churn rate (logo + revenue)\n   - LTV/CAC ratio\n   - Expansion revenue (upsells)\n   - Refund rate\n\n2. User Analytics:\n   - Signups by source (organic, referral, paid, direct)\n   - Activation rate (users who reached key action within 7 days)\n   - DAU/MAU with stickiness ratio\n   - Cohort retention (weekly, monthly, by signup cohort)\n   - Feature adoption heatmap\n   - NPS score trend\n\n3. Product:\n   - API usage (requests, latency, error rates by endpoint)\n   - Feature usage (events per user per day)\n   - A/B test results with significance calculator\n   - Funnel analysis (signup → activation → purchase)\n\n4. Operations:\n   - Infrastructure cost by service\n   - Support ticket volume and resolution time\n   - Uptime SLA with incident timeline\n\n5. Forecasting:\n   - Revenue projection (linear + seasonal models)\n   - Churn prediction (users at risk list)\n   - Capacity planning (storage, compute, bandwidth)\n\nImplementation: Next.js dashboard with Server Components, SQL-powered (no ORM for analytics queries), with chart library [Recharts/Chart.js], CSV export for every chart, and scheduled PDF report email.\n\nGenerate all SQL queries optimized for analytics workloads (materialized views, window functions, pre-aggregated tables).",
    tool_used: "Claude",
    category: "code",
    description:
      "Built the investor-facing analytics dashboard for my SaaS. The cohort retention chart and churn prediction model were the key reasons we closed our Series A. The automated weekly report saves 6 hours of manual work.",
    proof_link: "https://marcusdev.dev/blog/analytics-dashboard",
    outcome_text: "Helped close Series A, saves 6 hours/week on reporting",
    is_premium: true,
    price: 3999,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Prompt Chaining & Workflow Engine for LLMs",
    prompt_text:
      "Design and implement a prompt chaining engine that lets users compose multi-step LLM workflows:\n\nArchitecture:\n1. Node types:\n   - PromptNode: sends a prompt to an LLM with configurable model, temperature, max tokens\n   - MapNode: applies a sub-chain to each item in a list\n   - FilterNode: filters results based on a condition prompt\n   - ReduceNode: aggregates multiple results into one\n   - CodeNode: runs custom JavaScript to transform data\n   - ConditionNode: branches workflow based on LLM decision\n   - ToolNode: calls an external API/tool\n   - RouterNode: routes to different branches based on content classification\n\n2. Execution engine:\n   - DAG-based execution with topological ordering\n   - Parallel execution of independent branches\n   - Caching at each node (TTL-based)\n   - Retry with backoff for LLM calls\n   - Streaming intermediate results\n   - Checkpoint/resume for long-running chains\n   - Token usage tracking per node\n\n3. Visual editor: React flow-based drag-and-drop builder\n4. Export/import as JSON workflow definitions\n5. Template marketplace: pre-built workflows for common patterns\n\nImplement in TypeScript with a Python runtime option for heavy processing.",
    tool_used: "Claude",
    category: "code",
    description:
      "Built an internal workflow engine that automated our content production pipeline. 200+ prompts composed into chains that generate, review, and publish blog posts end-to-end. Cut content production time by 85%.",
    proof_link: "https://sarahchen.dev/blog/prompt-chaining",
    outcome_text: "200+ prompt workflows, 85% faster content production",
    is_premium: true,
    price: 3499,
    moderated: true,
  },
  {
    user: "sarahchen",
    title: "Terraform Infrastructure as Code Generator",
    prompt_text:
      "Generate Terraform infrastructure as code for deploying the following:\n\nArchitecture: [describe application architecture]\nCloud: [AWS/GCP/Azure]\nBudget: [monthly budget]\n\nGenerate complete Terraform configuration including:\n\n1. Network layer:\n   - VPC with public/private/isolated subnets across 3 AZs\n   - NAT gateways, Internet gateway, VPC endpoints\n   - Network ACLs and security groups with least-privilege rules\n   - Transit gateway for multi-account setup (if applicable)\n\n2. Compute:\n   - EKS/GKE/AKS cluster with node groups (spot + on-demand mix)\n   - Fargate/Cloud Run for serverless workloads\n   - Auto-scaling configuration with scheduled scaling\n\n3. Data layer:\n   - RDS/Cloud SQL with Multi-AZ, automated backups, read replicas\n   - ElastiCache/Memorystore Redis cluster\n   - S3/GCS buckets with lifecycle policies\n   - DocumentDB/CosmosDB for document workloads\n\n4. Security:\n   - KMS/Cloud KMS for encryption\n   - Secrets Manager for secrets\n   - IAM roles with least-privilege policies\n   - WAF/Cloud Armor rules\n   - GuardDuty/Security Command Center\n\n5. Observability:\n   - CloudWatch/Stackdriver dashboards and alarms\n   - Prometheus + Grafana via helm\n   - Centralized logging (ELK/Loki)\n\n6. CI/CD:\n   - Terraform Cloud/Spacelift setup\n   - Remote state with locking\n   - Workspace strategy (dev/staging/prod)\n\nOutput organized as: modules/ (reusable), environments/ (dev/staging/prod), terragrunt.hcl if using Terragrunt. Include cost estimation comments for each major resource.",
    tool_used: "ChatGPT",
    category: "code",
    description:
      "Used this to migrate a startup from Heroku to AWS. The generated Terraform configuration passed our security review with zero changes needed. Monthly infra cost dropped from $4k to $1.2k with better performance.",
    proof_link: "https://sarahchen.dev/blog/terraform-migration",
    outcome_text: "Heroku → AWS migration, infra cost $4k → $1.2k/month",
    is_premium: true,
    price: 4499,
    moderated: true,
  },
  {
    user: "marcusdev",
    title: "Codebase Refactoring & Modernization Plan",
    prompt_text:
      "Analyze the following codebase and generate a comprehensive refactoring plan:\n\nCodebase: [paste code or describe]\nCurrent stack: [describe current tech stack]\nTarget stack: [describe target tech stack]\nConstraints: [time, team size, can't break existing features]\n\nGenerate:\n\n1. Current state analysis:\n   - Architecture diagram (component relationships, data flow)\n   - Technical debt inventory (anti-patterns, dead code, duplication)\n   - Code quality metrics (cyclomatic complexity, coupling, cohesion)\n   - Test coverage gaps\n   - Performance bottlenecks\n\n2. Migration strategy (Strangler Fig pattern):\n   - Phase 1: Foundation (extract shared libraries, add integration tests)\n   - Phase 2: Strangler (route traffic to new modules incrementally)\n   - Phase 3: Removal (delete old code, clean up)\n   - Phase 4: Optimization (performance tuning, tech debt cleanup)\n\n3. For each module to refactor:\n   - Current implementation summary\n   - Target implementation approach\n   - Breaking changes (with mitigation)\n   - Estimated effort in story points\n   - Dependency order (what must be done first)\n   - Rollback strategy\n\n4. Testing strategy during migration:\n   - Characterization tests for existing behavior\n   - Integration tests for new implementations\n   - Canary testing for risky changes\n   - Chaos engineering experiments\n\n5. Risk register: top 10 risks with probability × impact score and mitigation\n\nOutput as a structured engineering design doc.",
    tool_used: "Claude",
    category: "code",
    description:
      "Used this to plan a PHP monolith to Go microservices migration for a fintech. The phased strangler pattern meant we never had to pause feature development. Migration completed 3 weeks early with zero production incidents.",
    proof_link: "https://marcusdev.dev/blog/refactoring-plan",
    outcome_text: "PHP → Go migration completed 3 weeks early, zero incidents",
    is_premium: true,
    price: 2999,
    moderated: true,
  },
]

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function seed() {
  console.log("\n🌱 PromptVault Seed Script\n")
  console.log("Creating users...")

  const userIds = {}
  for (const user of USERS) {
    const id = await createUser(user)
    if (id) userIds[user.username] = id
  }

  if (Object.keys(userIds).length === 0) {
    console.error("❌ No users could be created. Aborting.")
    process.exit(1)
  }

  console.log("\nCreating prompts...")

  let created = 0
  for (const p of PROMPTS) {
    const userId = userIds[p.user]
    if (!userId) {
      console.log(`  ✗ Skipping "${p.title}" — user "${p.user}" not found`)
      continue
    }

    const slug = slugify(p.title)

    const { data: existing } = await admin
      .from("prompts")
      .select("id, slug")
      .eq("slug", slug)
      .limit(1)

    if (existing?.[0]) {
      console.log(`  ↻ "${p.title}" already exists, skipping`)
      created++
      continue
    }

    const { error } = await admin.from("prompts").insert({
      user_id: userId,
      title: p.title,
      slug,
      prompt_text: p.prompt_text,
      tool_used: p.tool_used,
      ai_model_version: p.ai_model_version || null,
      category: p.category,
      license_type: p.license_type || "personal",
      description: p.description,
      proof_link: p.proof_link,
      outcome_text: p.outcome_text,
      is_premium: p.is_premium,
      price: p.price,
      moderated: p.moderated,
    })

    if (error) {
      console.error(`  ✗ Failed to create "${p.title}": ${error.message}`)
    } else {
      console.log(`  ✓ "${p.title}"`)
      created++
    }
  }

  console.log(`\n✅ Done! Created ${created}/${PROMPTS.length} prompts.\n`)
  console.log("Demo accounts:")
  for (const user of USERS) {
    console.log(`  ${user.email} / ${user.password}`)
  }
  console.log("")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
