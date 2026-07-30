# TCS NQT Technical Interview Preparation Guide
## Section 1: Project-Based & Architecture Questions (Tailored for MockMate)

This guide provides answers to the project-based and architecture questions in the TCS NQT guide, fully customized and grounded in the actual codebase, architecture, and technology choices of **MockMate**.

---

### Q1. Project Overview: Walk me through your final year project. What was the core problem statement, and how did your solution address it?
* **Answer:**  
  **MockMate** is an AI-powered career optimization and interview preparation platform designed as a "deterministic laboratory" for engineers to perfect their career development.  
  * **Core Problem Statement:** Job seekers face a highly competitive market without objective, data-backed feedback on their resume impact, a lack of realistic, high-pressure environments to practice coding and technical communication, and fragmented platforms for maintaining technical mastery.  
  * **Our Solution:** MockMate bridges this gap through a unified suite of tools:
    1. **AI Interview Simulator:** A multi-modal simulator integrating Azure Speech (voice-to-text and text-to-speech) and video input to mimic real-world interview conditions.
    2. **ATS Scoring Engine & Resume Roaster:** Extracts data from resumes (using Azure Form Recognizer OCR and `pdf-parse`) and scores it against corporate standards using metric density detection and keyword matching.
    3. **The Arena & Certification Hub:** A gamified track enabling users to compete in live, ranked technical battles or simulate industry-standard exam suites (AWS, Azure, PCAP Python, MongoDB).
    4. **Project Mode (DevCube):** An in-browser IDE utilizing CodeSandbox Sandpack for multi-file code editing, analysis, and vulnerability scans.

---

### Q2. Architecture Design: Draw a high-level architectural diagram of your project textually. Why did you choose this particular architecture (e.g., Monolithic vs. Microservices vs. 3-Tier)?
* **Answer:**  
  We chose a **Next.js Full-Stack App Router architecture**, representing a modern serverless monolith.
  ```text
  ┌─────────────────────────────────────────────────────────────┐
  │                     Client (Frontend)                       │
  │  React Components, Framer Motion, Monaco Editor, Sandpack   │
  │  State: TanStack React Query & Local React Hooks            │
  └───────────────┬───────────────────────────────▲─────────────┘
                  │ HTTP Request / SSE            │ SSE Streams / JSON
                  ▼                               │
  ┌─────────────────────────────────────────────────────────────┐
  │                 Next.js App Router Backend                 │
  │   - Server Actions (Business logic / database operations)    │
  │   - Route Groups: (main) Dashboard, (immersive) Battle/Quiz   │
  │   - Middleware (Routing Protection & Upstash Rate Limiting)  │
  └───────────────┬───────────────────────────────▲─────────────┘
                  │ Read/Write                    │ Auth & Data
                  ▼                               │
  ┌─────────────────────────────────────────────────────────────┐
  │                      Services Layer                         │
  │  - Upstash Redis (Caching, Rate Limiting, Temp Session State)│
  │  - Supabase (PostgreSQL Database, Auth, RLS Policies)       │
  │  - Azure Services (Form Recognizer OCR, Blob Storage, Speech)│
  │  - AI Engines (Groq/Llama-3, Google Gemini, OpenAI via VAI)  │
  └─────────────────────────────────────────────────────────────┘
  ```
  * **Why this architecture?** Next.js App Router allows us to maintain a cohesive codebase where frontend components and backend logic (via Server Actions) coexist. It is highly cost-effective and scales dynamically in a serverless environment (hosted on Vercel). Instead of managing complex independent microservices, we offload heavy services (Speech, OCR, AI inference) to specialized third-party APIs (Azure and AI providers) while keeping our core application light and maintainable.

---

### Q3. Tech Stack Selection: What factors influenced your choice of technology stack for your main project? Why choose Python/Node.js over Java, or vice versa?
* **Answer:**  
  Our core stack consists of **Next.js (React/TypeScript)** for the application layer, **Supabase (PostgreSQL)** for the data layer, and **Upstash Redis** for caching.
  * **Factors Influencing Selection:**
    1. **Language Unification:** Using TypeScript across both the frontend and backend (Server Actions) ensures end-to-end type safety, making changes robust and reducing cognitive load.
    2. **Rich Ecosystem for Developer Tooling:** The Next.js ecosystem allowed us to easily embed complex interfaces like Monaco Editor and CodeSandbox Sandpack using React components.
    3. **AI Integration:** Next.js natively handles streaming data (Server-Sent Events), which is essential for real-time AI conversation pipelines.
  * **Why Node.js/TypeScript over Java?** Node.js is lightweight, event-driven, and optimized for I/O-heavy operations like forwarding AI streams, communicating with external cloud APIs, and reading file uploads. Java (Spring Boot) is great for CPU-bound monolithic operations but introduces significant boilerplate, slower startup times (cold-start latency on serverless edge functions), and lacks the rapid-prototyping velocity crucial for this project.

---

### Q4. Describe the database schema of your project. How many tables/collections did you use, and how are they related?
* **Answer:**  
  We used **Supabase PostgreSQL** as our relational database, containing 8 primary tables:
  1. `profiles`: Relates to Supabase Auth (`auth.users`) via a One-to-One foreign key (`id`). Stores user metadata and aggregated stats (`xp`, `level`, `streak`, `elo`).
  2. `quizzes`: Stores pre-configured certification and custom quizzes using `JSONB` for flexible question schemas.
  3. `quiz_results`: Stores logs of completed quizzes. References `auth.users(id)` via a Many-to-One relation, supporting guest users using a `session_id`.
  4. `career_paths`: Stores results from the AI Career Matcher. References `auth.users(id)`.
  5. `interview_sessions`: Stores mock interview data, transcripts, and stats. References `auth.users(id)` with a `ON DELETE CASCADE` rule.
  6. `system_designs`: Stores user architectures built in the design canvas. References `auth.users(id)`.
  7. `career_ops`: Tracks job applications in the user's career pipeline. References `auth.users(id)`.
  8. `feedback`: Relates user bug reports/suggestions to `auth.users(id)` or allows guest emails.
  * **Relationships:** Tables are highly normalized around the central `auth.users` entity, utilizing cascading deletions to ensure database cleanup when accounts are removed.

---

### Q5. Normalization Challenge: Did you normalize your database? Up to what normal form? Did you encounter any scenario where you had to intentionally denormalize?
* **Answer:**  
  Yes, the schema is normalized up to **3NF (Third Normal Form)**. Non-prime attributes are fully functionally dependent only on the primary key, and transitive dependencies are eliminated.
  * **Denormalization Scenario:** We intentionally denormalized the `profiles` table by storing aggregated statistics like `xp`, `level`, `streak`, and `elo`.
  * **Why?** Calculating a user's current ELO rating, level, or daily streak would normally require performing complex aggregates (`COUNT`, `SUM`, date math) across hundreds of rows in `quiz_results` and `interview_sessions` every time the user loads their dashboard. By storing these running totals directly on the `profiles` row, dashboard loads take <10ms. We maintain consistency by updating these values within PostgreSQL transactions when recording new activity.

---

### Q6. Authentication Mechanism: How did you secure user authentication and authorization in your project? Explain the role of JWT or OAuth if used.
* **Answer:**  
  * **Authentication:** We offload authentication to **Supabase Auth**, which issues secure, signed JSON Web Tokens (JWTs) representing the user session. The client stores the session cookie securely.
  * **Authorization:**
    1. **Route Middleware:** Next.js `middleware.ts` intercepts requests, parses the session cookie, and validates the JWT. If the session is invalid or expired, the user is redirected to the login page.
    2. **Row-Level Security (RLS):** Enabled at the database level. Each table has policies, e.g., `CREATE POLICY "Users can view own interview sessions" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);` ensuring a user cannot query another user's session even if they bypass the client.
    3. **Role-Based Policies (RBAC):** Admin features check a user's role: `role = 'admin'` in `profiles` is checked before performing deletions.

---

### Q7. API Design: Describe the API endpoints you designed. What HTTP methods did you use, and how did you handle error status codes?
* **Answer:**  
  We used **Next.js Server Actions** for RPC-like client-to-server operations and **HTTP Route Handlers** for standard integrations:
  * **Key Endpoints:**
    * `POST /api/ocr`: Takes a PDF file and uses Azure Form Recognizer to extract text.
    * `POST /api/chat`: Streams responses from Groq (Llama-3) or Gemini using Server-Sent Events (SSE).
    * `GET /api/cron/liveness`: Verifies database and AI provider connectivity.
  * **Error Handling:** Standard HTTP Status Codes are returned:
    * `400 Bad Request` — Handled using **Zod** schema validations on payload shapes.
    * `401 Unauthorized` — Token validation in middleware failed.
    * `429 Too Many Requests` — Upstash Rate Limiter triggered by high IP traffic.
    * `500 Internal Server Error` — Caught system exceptions, logged server-side, with safe messages returned to the client.

---

### Q8. State Management: If your project had a frontend component, how did you manage state globally across different modules or components?
* **Answer:**  
  We separated state into two categories:
  1. **Server State:** Managed using **TanStack React Query**. React Query handles fetching, caching, query deduplication, background refetching, and cache invalidation (e.g., refetching profile statistics when a quiz ends).
  2. **UI/Client State:** Managed locally using standard React state hooks:
     * `useState` / `useReducer`: To handle state machines inside immersive elements like the Quiz Runtime or Arena battles.
     * `useContext`: To distribute global UI options (such as dark/light mode via `next-themes`).
     * **Why?** Offloading data caching and sync to React Query removes the need for large Redux boilerplate, keeping components decoupled and easy to test.

---

### Q9. Performance Bottleneck: What was the biggest performance bottleneck you faced during the testing of your project, and how did you resolve it?
* **Answer:**  
  * **Bottleneck:** Parsing PDF resumes and generating AI "roasts" or ATS scores was taking up to 15 seconds. This exceeded Vercel's Serverless Timeout limit (10 seconds for free tier) and caused gateway errors.
  * **Resolution:**
    1. **Offloading Extraction:** We replaced heavy local parsing with **Azure AI Form Recognizer** which optimized document structure extraction.
    2. **AI Streaming:** Instead of waiting for a complete JSON document from the AI, we implemented streaming responses using Server-Sent Events (SSE) via the Vercel AI SDK. The UI renders findings as they are generated.
    3. **Redis Caching:** We cached compiled quiz questions in Upstash Redis, bypassing PostgreSQL queries for active exam sessions and reducing response times to ~10ms.

---

### Q10. Concurrency Issues: Did you encounter any race conditions or concurrency issues when multiple users interacted with your application simultaneously?
* **Answer:**  
  * **Issue:** Concurrent updates to user XP and ELO ratings. If a user finished two quizzes simultaneously (or double-clicked submit), parallel processes read the same starting XP, incremented it, and wrote back, resulting in a lost update.
  * **Resolution:**
    1. **Atomic DB Operations:** We eliminated read-then-write logic by using atomic SQL updates: `UPDATE profiles SET xp = xp + :gained_xp WHERE id = :user_id;`.
    2. **Matchmaking Locks:** For "The Arena" matchmaking, we used **Upstash Redis** atomic operations (`SET NX PX`) to create a distributed lock, preventing two players from being paired with different lobbies simultaneously.
    3. **UI Mutex:** Disabled quiz/battle submission buttons on the UI as soon as the submit action was triggered.

---

### Q11. Data Validation: How did you handle server-side vs. client-side data validation to maintain data integrity and security?
* **Answer:**  
  * **Client-Side:** Implemented using **React Hook Form** paired with **Zod** schemas. This validates emails, checks file sizes/extensions, and ensures required fields are filled out before hitting the API, optimizing UX.
  * **Server-Side (Critical):** Every single Server Action and REST endpoint parses incoming parameters using a server-side Zod Schema. If a payload contains invalid types or malicious strings, validation fails, throwing an error. This ensures that even if client-side validation is bypassed, the database remains protected.

---

### Q12. Third-Party APIs: Did your project integrate any third-party APIs (like payment gateways, maps, or SMS)? How did you handle failure scenarios or rate limiting?
* **Answer:**  
  MockMate integrated with Google Gemini/Groq APIs, Azure Speech SDK, Azure Form Recognizer, and Resend.
  * **Failure Mitigation:**
    * **Multi-Provider Fallback:** We implemented the *Strategy Pattern* under `lib/ai/providers/`. If the primary LLM provider (Groq) throws an error or hits a rate limit, the service instantly falls back to Google Gemini.
    * **Retry Logic:** Implemented a custom retry wrapper (`lib/retry.ts`) utilizing exponential backoff for network-related errors.
    * **Rate Limiting:** Managed locally using **Upstash Rate Limiting** to protect down-stream APIs from hitting user quotas.

---

### Q13. Version Control Strategy: How did your team utilize Git during collaboration? Explain your branch management and merge conflict resolution strategy.
* **Answer:**  
  We used **Git Flow** with strict branch protection rules:
  * `main` was the production branch (direct push blocked).
  * `dev` was the integration branch.
  * Features were created on branches named `feature/name` or `bugfix/name`.
  * **Merge & Conflict Resolution:** Pull Requests (PRs) required passing lint rules and unit tests (via GitHub Actions CI). If conflicts occurred, the author merged `dev` into their local feature branch, resolved the conflicts locally in VS Code, ran `npm run build` and tests to verify everything compiled, and then updated the PR.

---

### Q14. Deployment Lifecycle: Where is your project hosted? Explain the step-by-step process of how your source code moves from local development to production.
* **Answer:**  
  MockMate is hosted on **Vercel** (frontend and serverless API handlers) and **Supabase** (PostgreSQL and user auth services).
  * **Deployment Lifecycle:**
    1. **Development:** Code written locally, tested with `npm run dev`.
    2. **Pushing code:** Pushing a commit to a feature branch on GitHub triggers a **Vercel Preview Deployment** and runs unit tests.
    3. **Pull Request:** Code is merged into `dev` after manual validation.
    4. **Production Deploy:** Merging `dev` into `main` triggers the production deployment on Vercel (`mockmate-delta.vercel.app`). DB changes are handled via migration SQL files applied to Supabase.

---

### Q15. Environment Configuration: How did you securely manage environment variables, secret keys, and database credentials across development and production environments?
* **Answer:**  
  * **Development:** Keys are saved locally in `.env.local`, which is added to `.gitignore`.
  * **Production:** Stored securely within Vercel's Environment Variable storage. DB connection strings and service role keys are never exposed to the client.
  * **Exposures:** Only public vars are prefixed with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SUPABASE_URL`).
  * **Runtime Safety:** We wrote a type-safe parser (`lib/env.ts`) using Zod. When the app starts up, it validates that all expected environment variables exist, causing early failures during build time if any key is missing.

---

### Q16. Testing Framework: What methodologies did you use to test your project? Explain any unit tests, integration tests, or manual testing workflows implemented.
* **Answer:**  
  * **Unit Tests:** Built using **Vitest** to verify pure functions, such as checking calculations in the ATS engine (`lib/scoring.test.ts`) and profile status updates.
  * **Integration Tests:** Used to verify that Next.js middleware correctly restricts unauthorized URLs or mock API integrations.
  * **E2E Tests:** Configured using **Playwright** to test browser actions like loading dashboards, verifying ELO rank increments on Leaderboards, and testing focus traps in modals.
  * **Manual Testing:** Used for checking speech transcription accuracy on actual devices and auditing layout breakpoints on mobile.

---

### Q17. Error Logging: How did your system log runtime exceptions? If a system crashes in production, how would you trace the root cause?
* **Answer:**  
  * **Logger:** We built a custom logging class (`lib/logger.ts`) producing structured logs to standard out (`stdout`).
  * **Trace Routine:**
    1. If a crash occurs, we inspect **Vercel Runtime Logs** to view the stack trace and the Request ID of the failed Server Action.
    2. We trace the Request ID back to **Supabase Database Logs** to check if a Postgres constraint, transaction lock, or RLS policy triggered the crash.
    3. We check AI connection health via the `/api/cron/liveness` route logs to confirm if external APIs were unreachable.

---

### Q18. Scalability Roadmap: If your project suddenly gets 100,000 active concurrent users tomorrow, which parts of your system will fail first, and how would you scale them?
* **Answer:**  
  * **Fail Points:**
    1. **Database Connection Limits:** PostgreSQL on Supabase will run out of connection slots under concurrent serverless requests.
    2. **AI Provider Rate Limits:** Google/Groq API quotas will be exhausted immediately.
    3. **Serverless Execution Limits:** Synchronous PDF processing routes will hit 10-second limits.
  * **Scale Actions:**
    1. Enable **Supabase Connection Pooling** (Supavisor) to reuse database connections.
    2. Introduce a **Task Queue (like BullMQ on Redis)**. Resumes and speech reports will write to a queue and resolve asynchronously, replacing the blocking request/response cycle.
    3. Cache leaderboard queries and static configurations in **Upstash Redis** to bypass PostgreSQL reads.
    4. Implement regional replication for database read queries.

---

### Q19. Caching Strategy: Did you implement any caching layer (like Redis or browser local storage)? If yes, how did you handle cache invalidation?
* **Answer:**  
  * **Redis (Server):** We cached static certification questions and daily challenges in **Upstash Redis** (TTL set to 7 days for quizzes and 24 hours for daily challenges).
  * **Browser Storage (Client):** Used Local Storage to persist the client-side design canvas state, user theme settings (`next-themes`), and running quiz progress (saving incomplete questions so page refreshes don't lose data).
  * **Invalidation:** Admin panel changes trigger a write-through invalidation that programmatically purges specific keys using the Upstash Redis client.

---

### Q20. Individual Contribution: Out of the entire project, what exactly was your individual code contribution, and what modules were built by your teammates?
* **Answer:**  
  * **My Role (Bhima):**
    * Designed the database schema, initialized Supabase tables, and configured Row-Level Security (RLS) policies.
    * Engineered the **ATS Scoring Engine** and **Resume Roaster** parsing engine using Azure Form Recognizer OCR.
    * Implemented the **Multi-Provider AI Strategy** pattern ensuring Groq and Gemini failovers.
  * **Teammate's Role (Tejaswanth):**
    * Designed the responsive frontend pages, transitions, and dashboard elements using Tailwind CSS and Framer Motion.
    * Created the interactive **System Design Canvas** and integrated the CodeSandbox Sandpack engine.
    * Configured the voice processing pipeline using Azure Speech SDK.

---

### Q21. Technical Debt: If you were given two more weeks to completely rewrite your project from scratch, what architectural mistakes would you fix?
* **Answer:**  
  1. **Strict Service Layer Separation:** Separate database queries and business logic completely out of Next.js Server Actions into dedicated class-based services to improve test mock coverage.
  2. **Asynchronous Background Processing:** Shift PDF OCR parsing and interview analysis out of HTTP request threads into an asynchronous worker queue (such as BullMQ).
  3. **WebSockets for Matchmaking:** Upgrade the polling-based Redis matchmaking in "The Arena" to a persistent WebSocket architecture using Supabase Realtime for instant synchronization.

---

### Q22. Security Vulnerabilities: How did you protect your application against common web vulnerabilities like SQL Injection, Cross-Site Scripting (XSS), and CSRF?
* **Answer:**  
  * **SQL Injection:** Avoided string-interpolated SQL. We queried database operations through the Supabase SDK query builder, which utilizes parametrized inputs.
  * **XSS:** React automatically escapes values rendered in JSX. For markdown elements returned from AI, we sanitized them using verified markdown renderers to prevent script executions.
  * **CSRF:** Next.js Server Actions have built-in double-submit CSRF protections. Cookies are configured as `HttpOnly` and `SameSite=Lax`, preventing third-party script reads.
  * **Headers:** Configured CSP (Content Security Policy) and frame-ancestors headers to block clickjacking.

---

### Q23. Data Serialization: Why did you choose JSON over XML or Protocol Buffers for data exchange within your project's ecosystem?
* **Answer:**  
  * **JSON** is natively supported by TypeScript/JavaScript, eliminating conversion steps between our Next.js frontend, backend, and API calls.
  * PostgreSQL natively supports `JSONB` datatype with indexing, allowing us to store and query nested quiz questions or transcripts directly inside DB queries.
  * AI models output formatted JSON, which integrates with Zod verification.
  * *Why not others:* XML is verbose and slow to process. Protocol Buffers are efficient for gRPC services but add compile overhead and are difficult to debug compared to plain JSON.

---

### Q24. UI/UX Decisions: What guided your interface design choices, and how did you ensure the system remains accessible and responsive across mobile platforms?
* **Answer:**  
  * **Design system:** Focused on a premium dark mode layout using Google Fonts (Outfit & Inter) and subtle Framer Motion micro-interactions.
  * **Responsiveness:** Programmed using Tailwind grids and flexbox breakpoints, letting dashboard sidebars collapse into toggle menus on mobile screens.
  * **Accessibility:** Used **Headless UI** and **Radix UI** primitives for modals and tabs to guarantee screen reader support, correct ARIA attributes, and keyboard navigation.

---

### Q25. Asynchronous Processing: Did your project utilize asynchronous background tasks or message queues (like Celery or RabbitMQ)? If so, for what feature?
* **Answer:**  
  As a serverless project, we avoided running dedicated RabbitMQ or Celery brokers. Instead, we scheduled automated tasks using **Vercel Cron Jobs** to trigger routes like `/api/cron/liveness` and recalculation pipelines (updating daily streaks and calculating engagement trends). Database triggers handles automated record synchronization.

---

### Q26. Legacy Upgrade: If you had to migrate your current project tech stack to a completely new framework, what migration risks do you anticipate?
* **Answer:**  
  Migrating to Go/React or Spring Boot would introduce:
  * **Rewriting Server Actions:** Our 21 Server Actions would need to be converted to REST/GraphQL endpoints, meaning we'd have to write manual routing and validation layers.
  * **Type Duplication:** Loss of shared TypeScript definitions across frontend and backend, increasing validation errors.
  * **Auth Flow Reconfiguration:** Migrating Supabase SSR cookie-based sessions across different domain structures.

---

### Q27. Data Analytics: Did your project generate any dashboards or reports? How did you construct complex aggregate queries to fetch that specific data?
* **Answer:**  
  Yes, the main Dashboard generates stats for XP, Level, ELO, and ATS progress.
  * **Aggregations:** Written as SQL aggregates inside database-level views or triggered queries, such as:
    ```sql
    SELECT category, COUNT(id) as total_tests, AVG(score) as avg_score
    FROM quiz_results
    WHERE user_id = :userId
    GROUP BY category;
    ```
  * These aggregations are indexed (`idx_quiz_results_leaderboard` on category and score) to ensure dashboards load instantly.

---

### Q28. Real-time Features: Did your project require real-time updates (e.g., chat notifications)? How did you implement this (WebSockets, Long Polling, Server-Sent Events)?
* **Answer:**  
  * **Server-Sent Events (SSE):** Used for AI Chat streaming and Resume Roasting. Utilizing Vercel AI SDK, we stream generated chunks to the client over HTTP/2, saving resource load compared to WebSockets.
  * **Matchmaking Polling:** "The Arena" uses an optimized Redis-backed polling queue. To scale this, we would migrate to WebSockets via **Supabase Realtime**, listening to PostgreSQL row changes.

---

### Q29. Object-Relational Mapping: Did you use an ORM (like Hibernate, Sequelize, Mongoose)? What are the performance trade-offs of using an ORM vs. writing raw SQL queries?
* **Answer:**  
  We used the **Supabase JavaScript Client** which acts as a lightweight query builder over PostgREST.
  * **Trade-offs:**
    * **ORM Pros:** Improves velocity, provides automatic TypeScript schema synchronization, and safeguards against SQL injections.
    * **ORM Cons:** Adds parsing overhead and can generate complex, sub-optimal nested SQL statements.
    * **Raw SQL Pros:** We used raw SQL for migrations, trigger functions (like `handle_new_user`), and complex indexing. This allows us to write database-optimized queries that query builder frameworks cannot easily construct.

---

### Q30. File Upload Management: How does your system handle media or large file uploads? Are they stored directly in the database, local file system, or cloud buckets?
* **Answer:**  
  * **Decision:** Resumes are uploaded to **Azure Blob Storage** rather than database files (which cause bloat) or local filesystems (which are ephemeral on serverless runtimes).
  * **Workflow:**
    1. The client requests a secure Shared Access Signature (SAS) URL from our Server Action.
    2. The client uploads the file directly to Azure, keeping the load off our serverless functions.
    3. The file URI is saved to our database, and we execute OCR on the document path.

---

### Q31. CI/CD Concepts: Did you implement any continuous integration or deployment pipelines? Describe any GitHub Actions or Jenkins configuration used.
* **Answer:**  
  Yes, we configured:
  * **GitHub Actions (CI):** Triggers on PRs to `dev` and `main`. It sets up Node.js, installs dependencies (`npm ci`), runs linters (`eslint`), and executes unit tests (`vitest`).
  * **Vercel Integration (CD):** Once CI passes, Vercel builds the preview. Merges to `main` compile and deploy to production (`mockmate-delta.vercel.app`) in seconds.

---

### Q32. Team Conflict Resolution: Describe a technical disagreement you had with a team member regarding project architecture and how you reached a consensus.
* **Answer:**  
  * **Conflict:** A teammate wanted to host a separate Express WebSocket server on Heroku for "The Arena" matchmaking. I argued that this would add hosting costs and complicate deployment pipelines.
  * **Resolution:** We listed costs and maintenance overhead. I proposed starting with **Upstash Redis** (which we already used for rate-limiting) to maintain matchmaking queues and use client polling. This allowed us to keep the backend serverless on Vercel, saving costs and keeping the code unified. We agreed to move to WebSockets via Supabase Realtime only if matchmaking traffic exceeded our limits.

---

### Q33. Requirement Changes: Did your project requirements shift mid-way through development? How did you adapt your code structure to handle those sudden changes?
* **Answer:**  
  * **Change:** Initially, MockMate was just an AI quiz platform, but we decided to transform it into a complete career manager with ATS tracking and Resume Roasting.
  * **Adaptation:** Because we used Next.js **Route Groups** (`(main)`, `(immersive)`) and kept database repos separate, we could implement "Career Ops" without modifying existing quiz code. Our Strategy Pattern in the AI layer allowed us to support different providers (Groq and Gemini) for the new features without code changes in the core engine.

---

### Q34. Resource Constraints: How did you optimize memory or processing footprints if your backend server ran on a free tier instance with limited CPU/RAM?
* **Answer:**  
  Vercel and Supabase free-tiers have low execution limits.
  * **Optimization:**
    1. Offloaded PDF parsing and OCR processing to external Azure API runtimes.
    2. Streamed AI responses using Server-Sent Events (SSE) instead of waiting for full blocks, avoiding the 10-second serverless execution timeouts.
    3. Created indexes on queries (`idx_quiz_results_user_id`, etc.) to keep query executions under 10ms, conserving CPU cycles on Supabase.

---

### Q35. Project Extensibility: How easy is it to plug in a completely new feature module into your project without disrupting the existing workflows?
* **Answer:**  
  Extremely easy.
  * Adding a route (e.g., a "Mock HR Interview") is as simple as creating a folder under `app/(immersive)/hr-mock/` since Next.js uses file-based routing.
  * Adding new certification quizzes just requires registering them inside our `QuizFactory` and `quiz-registry.ts`.
  * Actions are divided into isolated domain files, keeping logic decoupled.

---

## Section 2: Coding & Implementation Snippets

This section contains code implementation snippets representing real-world architectural solutions in **MockMate**. These are designed to help you answer questions that require writing code on a whiteboard or walking through logic during the interview.

### C1. Server Actions with Zod Validation & Rate Limiting
* **Question:** "Write a server action in Next.js to handle a profile update, ensuring inputs are validated and requests are rate-limited."
* **Code:**
```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { profileService } from "@/lib/services/profile-service";

// Define schema for client-side data validation
const profileSchema = z.object({
  nickname: z.string().min(2, "Too short").max(20, "Too long"),
  avatar_icon: z.string().min(1, "Icon is required"),
});

export type ProfileState = {
  message?: string;
  error?: string;
  success?: boolean;
};

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const nickname = formData.get("nickname") as string;
  const avatar_icon = formData.get("avatar_icon") as string;

  // 1. Validate payload server-side using Zod
  const result = profileSchema.safeParse({ nickname, avatar_icon });
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // 2. Resolve Authenticated User Session
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // 3. Check Rate Limiting tier via Upstash Redis
  const rl = await rateLimit("default", user.id);
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    // 4. Update the DB via the service layer
    await profileService.updateProfile(supabase, user.id, {
      nickname: result.data.nickname,
      avatar_icon: result.data.avatar_icon,
    });
  } catch (error: any) {
    return { error: error.message || "Update failed" };
  }

  // 5. Invalidate server cache to reflect modifications immediately
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  
  return { success: true, message: "Profile updated successfully" };
}
```
* **Concepts to Explain:**
  * **`"use server"` Directive:** Marks the file functions as RPC endpoints exposed to the frontend.
  * **Next.js Cache Invalidation:** `revalidatePath` tells Next.js to purge cached routes so the client receives fresh data next time they visit `/dashboard` or `/settings`.

---

### C2. Multi-Provider AI Fallback Strategy
* **Question:** "How do you implement a robust wrapper around AI models to ensure that if a primary model provider (e.g. Groq) fails or is rate-limited, it automatically falls back to a secondary provider (e.g. Gemini)?"
* **Code:**
```typescript
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";

export async function generateText(
  prompt: string,
  systemPrompt: string,
  providerPreference: "groq" | "gemini" | "auto" = "auto"
): Promise<{ content: string; provider: "groq" | "gemini" }> {
  
  // Decide provider priority
  const providersToTry = providerPreference === "auto" 
    ? ["groq", "gemini"] 
    : [providerPreference];

  let lastError: unknown;

  for (const provider of providersToTry) {
    if (provider === "groq") {
      try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Groq API key missing");

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
        });

        const content = completion.choices[0]?.message?.content || "";
        return { content, provider: "groq" };
      } catch (err) {
        logger.warn(`⚠️ Groq API failed. Falling back...`, err);
        lastError = err;
      }
    }

    if (provider === "gemini") {
      try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("Gemini API key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          systemInstruction: systemPrompt
        });

        const result = await model.generateContent(prompt);
        const content = result.response.text();
        return { content, provider: "gemini" };
      } catch (err) {
        logger.warn(`⚠️ Gemini API failed:`, err);
        lastError = err;
      }
    }
  }

  throw new Error(`All AI services failed. Last error: ${String(lastError)}`);
}
```
* **Concepts to Explain:**
  * **Fallback Chain:** A simple iteration loop catches errors from external SDKs and transparently routes requests to secondary providers, ensuring high availability.

---

### C3. Real-time Streaming (SSE) with Mid-Stream Failover
* **Question:** "How does your chat stream responses in real-time, and how do you handle a provider disconnect in the middle of a stream?"
* **Code:**
```typescript
// Next.js Route Handler for streaming: app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, systemPrompt } = await req.json();
  const stream = await streamChat(messages, systemPrompt);
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Streaming generator with mid-stream failover in lib/ai/gateway.ts
export async function streamChat(messages: ChatMessage[], systemPrompt: string): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  let providerUsed: 'groq' | 'gemini' | null = 'groq';

  return new ReadableStream({
    async start(controller) {
      const emitText = (text: string) => {
        // Enqueue formatted event stream data block
        controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
      };

      try {
        // 1. Try streaming from Groq
        const groqStream = await createGroqStream(messages, systemPrompt, process.env.GROQ_API_KEY!);
        for await (const text of groqStream) {
          emitText(text);
        }
      } catch (error) {
        logger.error("Groq stream interrupted. Switching to Gemini...", error);
        
        // 2. Interrupted! Dynamically switch to Gemini stream
        try {
          emitText("\n\n[System] Primary stream lost. Reconnecting via Gemini...\n\n");
          const geminiStream = await createGeminiStream(messages, systemPrompt, process.env.GOOGLE_API_KEY!);
          for await (const text of geminiStream) {
            emitText(text);
          }
        } catch (geminiErr) {
          emitText("\n\n[System] Connection lost. Please try again.");
        }
      } finally {
        controller.close();
      }
    }
  });
}
```
* **Concepts to Explain:**
  * **ReadableStream Constructor:** Provides chunk-by-chunk response handling in standard browser client setups.
  * **SSE Headers:** Uses `text/event-stream` and disables cache-control/connection timeouts.

---

### C4. Atomic Stats Synchronization & Concurrency Control
* **Question:** "How do you sync user ELO and XP scores safely without introducing slow database write locks that crash under high concurrent user activity?"
* **Code:**
```typescript
// Repository data access (lib/db/profile-repository.ts)
export const profileRepository = {
  async getStats(db: SupabaseClient, userId: string) {
    const { data } = await db
      .from("profiles")
      .select("xp, level, streak, elo, last_activity_at")
      .eq("id", userId)
      .single();
    return data;
  },

  async updateStats(db: SupabaseClient, userId: string, stats: ProfileStatsData) {
    const { error } = await db
      .from("profiles")
      .update({
        xp: stats.xp,
        level: stats.level,
        streak: stats.streak,
        elo: stats.elo,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
  }
};
```
* **Alternate SQL Trigger (If asked to guarantee absolute race condition prevention):**
```sql
-- Shift math directly into the database engine for atomic updates
CREATE OR REPLACE FUNCTION increment_user_xp(user_id_uuid UUID, xp_increment INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET xp = xp + xp_increment,
      level = floor(1 + sqrt(xp + xp_increment) / 10), -- Recompute level based on new XP
      last_activity_at = NOW()
  WHERE id = user_id_uuid;
END;
$$ LANGUAGE plpgsql;
```
* **Concepts to Explain:**
  * **Database-Level Operations:** By running math directly in SQL statements (`SET xp = xp + x`) rather than doing `read-modify-write` in serverless function code, database row engines handle parallel queries atomically.

---

### C5. Upstash Redis Rate Limiting (Sliding Window)
* **Question:** "Write the rate limiting code you used with Redis to throttle endpoints."
* **Code:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Connect to Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Configure sliding window limiter: 100 requests per 24 hours
const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "86400s"),
  prefix: "mockmate:ratelimit:generate",
});

export async function checkRateLimit(userId: string) {
  const { success, remaining, reset } = await limiter.limit(`user:${userId}`);
  return { success, remaining, reset };
}
```
* **Concepts to Explain:**
  * **Sliding Window vs. Fixed Window:** Sliding Window keeps track of exact timestamps of historical requests (using Redis sorted sets) to prevent users from consuming double their rate limit at the boundary edges of standard fixed windows.
