// Full plan data for frontend use — mirrors data/plan.js
// Structure: MONTHS[0..5], each with sections[], checkpoints[], chapterReward

export const MONTHS = [
  // ─────────────────────────────────────────────────────────
  // MONTH 1 — Foundations & Gaps
  // ─────────────────────────────────────────────────────────
  {
    monthNumber: 1,
    subtitle: 'Build the missing web/backend fundamentals. Start the DSA grind.',
    sections: [
      {
        id: 'm1_dsa',
        title: 'DSA — Daily Grind',
        skillType: 'dsa',
        tasks: [
          { id: 'm1_dsa_1',     title: 'Complete Arrays & Strings on Neetcode 150',   description: 'Solve all Array and String problems in the Neetcode 150 roadmap', frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm1_dsa_2',     title: 'Complete HashMaps & Sets section',             description: 'Solve all HashMap problems in Neetcode 150',                      frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm1_dsa_3',     title: 'Complete Two Pointers section',                                                                                                frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm1_dsa_4',     title: 'Complete Sliding Window section',                                                                                              frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm1_dsa_5',     title: 'Complete Stacks & Queues section',                                                                                             frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm1_dsa_daily', title: 'Solve 2 LeetCode problems (Easy)',             description: 'Daily habit — 2 Easy problems per day. Build pattern recognition.', frequency: 'daily', xp: 10, difficulty: 'easy',   resource: 'https://leetcode.com' },
        ],
      },
      {
        id: 'm1_backend',
        title: 'Tech Stack — FastAPI & PostgreSQL',
        skillType: 'backend',
        tasks: [
          { id: 'm1_backend_1', title: 'Build a FastAPI app with GET and POST endpoints', description: 'Learn request/response cycle, HTTP methods, and status codes', frequency: 'once', xp: 25, difficulty: 'medium', resource: 'https://fastapi.tiangolo.com' },
          { id: 'm1_backend_2', title: 'Learn SQL fundamentals (SELECT, INSERT, UPDATE, DELETE, JOINs)',                                                               frequency: 'once', xp: 25, difficulty: 'medium', resource: 'https://sqlzoo.net' },
          { id: 'm1_backend_3', title: 'Connect PostgreSQL to your FastAPI app',        description: 'Set up a local Postgres DB and query it from your API',          frequency: 'once', xp: 25, difficulty: 'medium' },
        ],
      },
      {
        id: 'm1_project',
        title: 'Project — Scaffold It',
        skillType: 'project',
        tasks: [
          { id: 'm1_project_1',     title: 'Create GitHub repo and push initial project scaffold', description: 'FastAPI backend + at least one working endpoint. Commit daily from now on.', frequency: 'once',  xp: 10, difficulty: 'easy' },
          { id: 'm1_project_2',     title: 'Connect PostgreSQL to project and run first DB query',                                                                                             frequency: 'once',  xp: 25, difficulty: 'medium' },
          { id: 'm1_project_daily', title: 'Push at least one commit to GitHub',                   description: 'Daily habit — keep your contribution graph green.',                           frequency: 'daily', xp:  5, difficulty: 'easy' },
        ],
      },
    ],
    checkpoints: [
      { id: 'm1_cp_1', title: 'Arrays, HashMaps, Two Pointers, Stacks complete', target: '25+ LeetCode problems solved',     skillType: 'dsa',     xpReward:  50 },
      { id: 'm1_cp_2', title: 'FastAPI — build and run a REST API locally',      target: 'Working endpoint that returns data', skillType: 'backend', xpReward:  50 },
      { id: 'm1_cp_3', title: 'PostgreSQL — basic CRUD queries working',          target: 'Connected to your project',         skillType: 'backend', xpReward:  50 },
      { id: 'm1_cp_4', title: 'GitHub — public repo with daily commits and README', target: 'Public repo live',               skillType: 'project', xpReward:  25 },
      { id: 'm1_cp_5', title: 'Neetcode 150 — Arrays section complete',           target: '~30 problems done total',           skillType: 'dsa',     xpReward:  75 },
    ],
    chapterReward: { title: 'Backend Initiate',     description: "You shipped your first API and started the grind. The journey begins.",                                                         badgeIcon: '🛠️', xpBonus: 200 },
  },

  // ─────────────────────────────────────────────────────────
  // MONTH 2 — DevOps Basics & ML Sharpening
  // ─────────────────────────────────────────────────────────
  {
    monthNumber: 2,
    subtitle: 'Docker, cloud intro, and level up your ML depth with PyTorch.',
    sections: [
      {
        id: 'm2_dsa',
        title: 'DSA — Ramp Up',
        skillType: 'dsa',
        tasks: [
          { id: 'm2_dsa_1',     title: 'Complete Linked Lists section on Neetcode 150',     frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm2_dsa_2',     title: 'Complete Binary Search section',                    frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm2_dsa_3',     title: 'Complete Trees (BFS + DFS) section',               frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm2_dsa_4',     title: 'Complete Basic Recursion & Backtracking section',  frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm2_dsa_daily', title: 'Solve 3 LeetCode problems (Easy/Medium mix)',       description: 'Increase volume. Start timing yourself — 25 min per problem max.', frequency: 'daily', xp: 15, difficulty: 'easy', resource: 'https://leetcode.com' },
        ],
      },
      {
        id: 'm2_devops',
        title: 'Tech Stack — Docker & Linux',
        skillType: 'devops',
        tasks: [
          { id: 'm2_devops_1', title: 'Write a Dockerfile for your FastAPI app',               description: 'Understand containers vs VMs. Build and run your app in a container.', frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm2_devops_2', title: 'Set up docker-compose with app + PostgreSQL',           description: 'One command to spin up your full stack locally',                      frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm2_devops_3', title: 'Learn Linux CLI fundamentals',                          description: 'Navigation, file permissions, processes, piping, grep, curl — use terminal daily', frequency: 'once', xp: 10, difficulty: 'easy' },
          { id: 'm2_devops_4', title: 'Practice Git branching and pull request workflow',      description: 'Create branches, open PRs, simulate merge conflicts and resolve them', frequency: 'once', xp: 10, difficulty: 'easy' },
        ],
      },
      {
        id: 'm2_ml',
        title: 'ML Depth — PyTorch',
        skillType: 'ml',
        tasks: [
          { id: 'm2_ml_1', title: 'Complete PyTorch fundamentals (tensors, autograd)',           description: 'Understand the core building blocks of PyTorch',                                       frequency: 'once', xp:  25, difficulty: 'medium', resource: 'https://pytorch.org/tutorials' },
          { id: 'm2_ml_2', title: 'Build a neural network from scratch in PyTorch',             description: 'No sklearn shortcuts — implement forward pass, loss, backprop manually',               frequency: 'once', xp:  50, difficulty: 'hard',   resource: 'https://fast.ai' },
          { id: 'm2_ml_3', title: 'Build a simple image or text classifier with PyTorch',                                                                                                            frequency: 'once', xp:  50, difficulty: 'hard' },
        ],
      },
      {
        id: 'm2_project',
        title: 'Project — Add ML Endpoint',
        skillType: 'project',
        tasks: [
          { id: 'm2_project_1', title: 'Integrate PyTorch model into FastAPI backend',     description: 'Load a trained model and call it inside a route handler',           frequency: 'once', xp: 50, difficulty: 'hard' },
          { id: 'm2_project_2', title: 'Add /predict endpoint that returns model output',                                                                                   frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm2_project_3', title: 'Write basic pytest tests for your API',            description: 'At least 3 tests — this separates you from most freshmen',          frequency: 'once', xp: 25, difficulty: 'medium' },
        ],
      },
    ],
    checkpoints: [
      { id: 'm2_cp_1', title: 'Docker — app containerized with docker-compose',    target: 'App runs with one command',          skillType: 'devops',  xpReward:  50 },
      { id: 'm2_cp_2', title: 'Linux CLI — comfortable with basic commands',        target: 'Using terminal daily',               skillType: 'devops',  xpReward:  25 },
      { id: 'm2_cp_3', title: 'Trees BFS/DFS — 10+ problems solved',               target: '10+ tree problems done',             skillType: 'dsa',     xpReward:  50 },
      { id: 'm2_cp_4', title: 'PyTorch — trained a basic neural network',           target: 'Working model with train/eval loop', skillType: 'ml',      xpReward:  75 },
      { id: 'm2_cp_5', title: 'Project — /predict endpoint live and tested',        target: 'API returns model predictions',      skillType: 'project', xpReward:  75 },
      { id: 'm2_cp_6', title: 'Neetcode 150 — 60+ problems total',                 target: '~60 problems done',                  skillType: 'dsa',     xpReward:  50 },
    ],
    chapterReward: { title: 'ML Engineer Initiate',  description: "Your model is live in an API and your app runs in Docker. You're shipping real software.",                                       badgeIcon: '🧠', xpBonus: 300 },
  },

  // ─────────────────────────────────────────────────────────
  // MONTH 3 — Cloud Deployment & Go Deeper on ML
  // ─────────────────────────────────────────────────────────
  {
    monthNumber: 3,
    subtitle: 'Deploy your project live. HuggingFace transformers. Graphs and DP.',
    sections: [
      {
        id: 'm3_dsa',
        title: 'DSA — Go Hard',
        skillType: 'dsa',
        tasks: [
          { id: 'm3_dsa_1',     title: 'Complete Graphs section (BFS/DFS traversal, cycle detection)', frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm3_dsa_2',     title: 'Complete Backtracking section',                                frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm3_dsa_3',     title: 'Complete Heaps / Priority Queues section',                    frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm3_dsa_4',     title: 'Participate in first LeetCode Weekly Contest',                description: 'Treat it like a real interview. Time pressure is the point.', frequency: 'once', xp: 50, difficulty: 'hard', resource: 'https://leetcode.com/contest' },
          { id: 'm3_dsa_daily', title: 'Solve 4 LeetCode problems (mostly Mediums)',                  frequency: 'daily', xp: 20, difficulty: 'medium', resource: 'https://leetcode.com' },
        ],
      },
      {
        id: 'm3_cloud',
        title: 'Tech Stack — AWS Cloud',
        skillType: 'cloud',
        tasks: [
          { id: 'm3_cloud_1', title: 'Create AWS Free Tier account',                                                                                                               frequency: 'once', xp: 10, difficulty: 'easy',   resource: 'https://aws.amazon.com/free' },
          { id: 'm3_cloud_2', title: 'Spin up an EC2 instance and SSH into it',         description: 'Deploy a Linux server, configure security groups, connect via SSH',          frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm3_cloud_3', title: 'Store and retrieve files with S3',                description: 'Upload model weights or user uploads to an S3 bucket',                      frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm3_cloud_4', title: 'Learn AWS Lambda basics — deploy a serverless function',                                                                                     frequency: 'once', xp: 25, difficulty: 'medium' },
        ],
      },
      {
        id: 'm3_ml',
        title: 'ML Depth — HuggingFace & Transformers',
        skillType: 'ml',
        tasks: [
          { id: 'm3_ml_1', title: 'Learn HuggingFace ecosystem (transformers, datasets, tokenizers)',                                                                                                              frequency: 'once', xp:  25, difficulty: 'medium', resource: 'https://huggingface.co/docs' },
          { id: 'm3_ml_2', title: 'Fine-tune a pre-trained model (BERT or DistilBERT) on a custom task', description: 'Use HuggingFace Trainer API on a text classification task',                               frequency: 'once', xp: 100, difficulty: 'epic',   resource: 'https://huggingface.co/docs/transformers/training' },
          { id: 'm3_ml_3', title: 'Be able to explain: embeddings, attention, tokenization',             description: 'Study these concepts until you can explain them without notes',                            frequency: 'once', xp:  25, difficulty: 'medium' },
        ],
      },
      {
        id: 'm3_project',
        title: 'Project — Deploy It Live',
        skillType: 'project',
        tasks: [
          { id: 'm3_project_1', title: 'Deploy FastAPI + ML app on AWS EC2 or Railway', description: 'Your app must be accessible at a real public URL',    frequency: 'once', xp: 100, difficulty: 'epic',   resource: 'https://railway.app' },
          { id: 'm3_project_2', title: 'Write a proper README (what, why, how, stack, live URL)',                                                           frequency: 'once', xp:  10, difficulty: 'easy' },
          { id: 'm3_project_3', title: 'Add live URL to GitHub profile and LinkedIn',                                                                       frequency: 'once', xp:  10, difficulty: 'easy' },
        ],
      },
    ],
    checkpoints: [
      { id: 'm3_cp_1', title: 'Project deployed — live URL accessible to anyone', target: 'Live on the internet',            skillType: 'project', xpReward: 150 },
      { id: 'm3_cp_2', title: 'AWS EC2 + S3 — hands-on done',                    target: 'Files stored and retrieved from S3', skillType: 'cloud',   xpReward:  75 },
      { id: 'm3_cp_3', title: 'Graph traversal — 15+ graph problems solved',      target: 'BFS, DFS, cycle detection',       skillType: 'dsa',     xpReward:  75 },
      { id: 'm3_cp_4', title: 'HuggingFace — fine-tuned a transformer model',     target: 'Model trained on custom data',    skillType: 'ml',      xpReward: 100 },
      { id: 'm3_cp_5', title: 'LeetCode Weekly Contest — attempted 2+ contests',  target: '2 contests completed',            skillType: 'dsa',     xpReward:  75 },
      { id: 'm3_cp_6', title: 'Neetcode 150 — 90+ problems total',               target: '~90 problems done',               skillType: 'dsa',     xpReward:  75 },
    ],
    chapterReward: { title: 'Cloud Deployer',         description: "Your ML app is live on the internet. Anyone can use what you built. That's real.",                                                            badgeIcon: '🚀', xpBonus: 400 },
  },

  // ─────────────────────────────────────────────────────────
  // MONTH 4 — System Design & Resume
  // ─────────────────────────────────────────────────────────
  {
    monthNumber: 4,
    subtitle: 'Intro system design, polish your project, build your resume.',
    sections: [
      {
        id: 'm4_dsa',
        title: 'DSA — Hard Push',
        skillType: 'dsa',
        tasks: [
          { id: 'm4_dsa_1',     title: 'Complete Dynamic Programming section (1D DP)',      description: 'Climbing stairs, house robber, coin change — top-down and bottom-up', frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm4_dsa_2',     title: 'Complete Dynamic Programming section (2D DP)',      description: 'Unique paths, longest common subsequence, knapsack',                 frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm4_dsa_3',     title: 'Complete Tries section',                                                                                                                frequency: 'once',  xp: 25, difficulty: 'medium', resource: 'https://neetcode.io' },
          { id: 'm4_dsa_4',     title: 'Complete Advanced Graphs (Dijkstra, Topological Sort)',                                                                                 frequency: 'once',  xp: 50, difficulty: 'hard',   resource: 'https://neetcode.io' },
          { id: 'm4_dsa_5',     title: 'Start keeping an error log — write WHY you missed each problem', description: 'Track your mistakes. Review weekly. This accelerates improvement faster than more reps.', frequency: 'once', xp: 10, difficulty: 'easy' },
          { id: 'm4_dsa_daily', title: 'Solve 4–5 LeetCode problems (Mediums + some Hards)',              frequency: 'daily', xp: 25, difficulty: 'medium', resource: 'https://leetcode.com' },
        ],
      },
      {
        id: 'm4_sysdesign',
        title: 'System Design — Intro Level',
        skillType: 'system_design',
        tasks: [
          { id: 'm4_sd_1', title: 'Watch 4 ByteByteGo videos (1/week)',                 description: 'Subscribe and watch one per week — focus on concepts not memorization', frequency: 'weekly', xp: 10, difficulty: 'easy',   resource: 'https://www.youtube.com/@ByteByteGo' },
          { id: 'm4_sd_2', title: 'Study load balancers — be able to explain what they do and why',                                                                              frequency: 'once',  xp: 10, difficulty: 'easy' },
          { id: 'm4_sd_3', title: 'Study databases vs caches (Redis) — when to use each',                                                                                        frequency: 'once',  xp: 10, difficulty: 'easy' },
          { id: 'm4_sd_4', title: 'Study REST APIs vs GraphQL — understand the tradeoffs',                                                                                       frequency: 'once',  xp: 10, difficulty: 'easy' },
          { id: 'm4_sd_5', title: 'Study CDNs, horizontal vs vertical scaling, CAP theorem basics',                                                                              frequency: 'once',  xp: 25, difficulty: 'medium' },
        ],
      },
      {
        id: 'm4_career',
        title: 'Career — Resume & Applications',
        skillType: 'career',
        tasks: [
          { id: 'm4_career_1', title: 'Build your 1-page resume',                   description: 'Education → Skills → Projects → Experience. Use action verbs. Quantify everything.', frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm4_career_2', title: 'Get resume reviewed',                         description: 'Career center, Reddit, or upperclassman',                                             frequency: 'once', xp: 10, difficulty: 'easy',   resource: 'https://reddit.com/r/cscareerquestions' },
          { id: 'm4_career_3', title: 'Apply to Google STEP Internship',                                                                                                                  frequency: 'once', xp: 25, difficulty: 'medium', resource: 'https://buildyourfuture.withgoogle.com/programs/step' },
          { id: 'm4_career_4', title: 'Apply to Microsoft Explore',                                                                                                                       frequency: 'once', xp: 25, difficulty: 'medium', resource: 'https://careers.microsoft.com' },
          { id: 'm4_career_5', title: 'Apply to Meta University',                                                                                                                         frequency: 'once', xp: 25, difficulty: 'medium', resource: 'https://www.metacareers.com' },
          { id: 'm4_career_6', title: 'Apply to Amazon Future Engineer',                                                                                                                  frequency: 'once', xp: 25, difficulty: 'medium', resource: 'https://www.amazonfutureengineer.com' },
        ],
      },
      {
        id: 'm4_project',
        title: 'Project — Add Depth',
        skillType: 'project',
        tasks: [
          { id: 'm4_project_1', title: 'Add JWT authentication to your FastAPI app',  description: 'Implement login, protected routes, and token refresh',                   frequency: 'once', xp: 50, difficulty: 'hard' },
          { id: 'm4_project_2', title: 'Add Redis caching to the /predict endpoint',                                                                                          frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm4_project_3', title: 'Write a LinkedIn post or blog about what you built', description: 'Explain the problem, your stack, and what you learned.',           frequency: 'once', xp: 25, difficulty: 'medium' },
        ],
      },
    ],
    checkpoints: [
      { id: 'm4_cp_1', title: 'DP — 15+ problems solved (1D and 2D)',               target: '15+ DP problems done',            skillType: 'dsa',           xpReward: 100 },
      { id: 'm4_cp_2', title: 'System design vocab — explain 5 core concepts fluently', target: 'No notes needed',             skillType: 'system_design', xpReward:  75 },
      { id: 'm4_cp_3', title: 'Resume — 1-page, reviewed, polished',                target: 'Ready to send to recruiters',     skillType: 'career',        xpReward: 100 },
      { id: 'm4_cp_4', title: 'Applied to all 4 freshman programs',                 target: 'STEP, Explore, Meta U, Amazon FE', skillType: 'career',       xpReward: 100 },
      { id: 'm4_cp_5', title: 'Project — auth + caching added',                     target: '2 new production-grade features', skillType: 'project',       xpReward:  75 },
      { id: 'm4_cp_6', title: 'Neetcode 150 — 120+ problems total',                target: '~120 problems done',               skillType: 'dsa',           xpReward:  75 },
    ],
    chapterReward: { title: 'Recruiter Ready',       description: "Resume sent, freshman programs applied, and your system design vocab is growing. You're in the fight.",                         badgeIcon: '📋', xpBonus: 400 },
  },

  // ─────────────────────────────────────────────────────────
  // MONTH 5 — Mock Interviews & Full Application Push
  // ─────────────────────────────────────────────────────────
  {
    monthNumber: 5,
    subtitle: 'Simulate real interviews. Expand applications. Behavioral prep.',
    sections: [
      {
        id: 'm5_dsa',
        title: 'DSA — Interview Simulation Mode',
        skillType: 'dsa',
        tasks: [
          { id: 'm5_dsa_1',      title: 'Complete the Neetcode 150 (all remaining problems)',                                                                        frequency: 'once',   xp: 100, difficulty: 'epic',   resource: 'https://neetcode.io' },
          { id: 'm5_dsa_2',      title: 'Do 4 full 90-minute timed simulation sessions',         description: '2 random Mediums per session, timer visible, talk out loud while solving', frequency: 'once', xp: 50, difficulty: 'hard' },
          { id: 'm5_dsa_weekly', title: 'LeetCode Weekly Contest every Sunday',                  description: 'Attempt all problems. Review solutions after.',        frequency: 'weekly', xp:  50, difficulty: 'hard',   resource: 'https://leetcode.com/contest' },
        ],
      },
      {
        id: 'm5_interview',
        title: 'Mock Interviews',
        skillType: 'interviewing',
        tasks: [
          { id: 'm5_mock_1',      title: 'Complete 4 mock interviews on Pramp',          description: '2x per week for 2 weeks. Write debrief after each one.', frequency: 'once',   xp: 50, difficulty: 'hard', resource: 'https://pramp.com' },
          { id: 'm5_mock_2',      title: 'Complete 4 mock interviews on interviewing.io',                                                                        frequency: 'once',   xp: 50, difficulty: 'hard', resource: 'https://interviewing.io' },
          { id: 'm5_mock_weekly', title: '2 mock interviews per week',                   description: 'Alternate between coding and behavioral mocks',            frequency: 'weekly', xp: 50, difficulty: 'hard' },
        ],
      },
      {
        id: 'm5_behavioral',
        title: 'Behavioral Interview Prep',
        skillType: 'interviewing',
        tasks: [
          { id: 'm5_beh_1', title: "Write your 'Overcoming a challenge' STAR story",      frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_beh_2', title: "Write your 'Teamwork' STAR story",                   frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_beh_3', title: "Write your 'Failure / learning' STAR story",         frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_beh_4', title: "Write your 'Technical decision I made' STAR story",  frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_beh_5', title: "Write your 'Impact I created' STAR story",           frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_beh_6', title: "Write your 'Why this company' answer for top 3 targets", frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_beh_7', title: 'Practice all 6 STAR stories out loud without notes', frequency: 'once', xp: 25, difficulty: 'medium' },
        ],
      },
      {
        id: 'm5_networking',
        title: 'Networking & Applications',
        skillType: 'networking',
        tasks: [
          { id: 'm5_net_1', title: 'Request 5+ referrals from LinkedIn connections', description: 'Message directly: ask if they can refer you for internship roles', frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm5_net_2', title: 'Apply to 30+ companies total (including mid-size tech)', description: 'Stripe, Cloudflare, Figma, Notion, Databricks, Scale AI — don\'t just aim at FAANG', frequency: 'once', xp: 50, difficulty: 'medium', resource: 'https://simplify.jobs' },
          { id: 'm5_net_3', title: 'Set up Simplify.jobs to track all applications',                                                                                  frequency: 'once', xp: 10, difficulty: 'easy',   resource: 'https://simplify.jobs' },
        ],
      },
    ],
    checkpoints: [
      { id: 'm5_cp_1', title: 'Neetcode 150 — fully complete',                        target: '150/150 problems done',               skillType: 'dsa',          xpReward: 200 },
      { id: 'm5_cp_2', title: '8+ mock interviews completed',                          target: 'Mix of coding and behavioral',         skillType: 'interviewing', xpReward: 150 },
      { id: 'm5_cp_3', title: '6 STAR behavioral stories — ready from memory',         target: 'All 6 practiced out loud',            skillType: 'interviewing', xpReward: 100 },
      { id: 'm5_cp_4', title: '30+ applications sent',                                 target: 'Applications out the door',           skillType: 'career',       xpReward: 100 },
      { id: 'm5_cp_5', title: '5+ referrals requested from network',                   target: 'Asked directly and followed up',      skillType: 'networking',   xpReward:  75 },
      { id: 'm5_cp_6', title: 'LeetCode contest — finished in top 50% on at least one contest', target: 'Top 50%',                   skillType: 'dsa',          xpReward: 100 },
    ],
    chapterReward: { title: 'Interview Warrior',     description: "You've simulated the gauntlet, know your stories cold, and have 30+ applications out. Now you sharpen.",                       badgeIcon: '⚔️', xpBonus: 500 },
  },

  // ─────────────────────────────────────────────────────────
  // MONTH 6 — Polish, Practice, Peak
  // ─────────────────────────────────────────────────────────
  {
    monthNumber: 6,
    subtitle: 'Sharpen every edge. You are ready. Now perform.',
    sections: [
      {
        id: 'm6_dsa',
        title: 'DSA — Maintain the Peak',
        skillType: 'dsa',
        tasks: [
          { id: 'm6_dsa_1',      title: 'Review your entire error log — redo every problem you got wrong', description: "Don't learn new patterns. Reinforce what you know.", frequency: 'once',   xp: 50, difficulty: 'hard' },
          { id: 'm6_dsa_2',      title: 'Complete 2 full LeetCode Virtual Contests (timed)',                                                                                   frequency: 'once',   xp: 50, difficulty: 'hard',   resource: 'https://leetcode.com/contest' },
          { id: 'm6_dsa_daily',  title: 'Solve 2–3 LeetCode problems (review and reinforce)',                                                                                  frequency: 'daily',  xp: 15, difficulty: 'medium', resource: 'https://leetcode.com' },
          { id: 'm6_dsa_weekly', title: 'LeetCode Weekly Contest every Sunday',                                                                                                frequency: 'weekly', xp: 50, difficulty: 'hard',   resource: 'https://leetcode.com/contest' },
        ],
      },
      {
        id: 'm6_interview',
        title: 'Interview Prep — Full Simulation',
        skillType: 'interviewing',
        tasks: [
          { id: 'm6_mock_weekly', title: '3 mock interviews per week (coding + behavioral)', description: 'Record yourself on Zoom. Watch it back. Identify weak spots.', frequency: 'weekly', xp: 75, difficulty: 'hard' },
          { id: 'm6_mock_1',      title: 'Record a mock interview on Zoom and watch it back', description: 'Self-critique: filler words, pacing, thinking out loud, confidence', frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm6_mock_2',      title: 'Practice with a timer visible on screen for every session', description: 'Simulate real pressure — the clock changes everything', frequency: 'once', xp: 10, difficulty: 'easy' },
        ],
      },
      {
        id: 'm6_project',
        title: 'Project — Final Polish',
        skillType: 'project',
        tasks: [
          { id: 'm6_project_1', title: 'Clean up codebase — remove dead code, add comments, improve error handling',                                                                                                       frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm6_project_2', title: 'Record a 2-minute demo video of your project',   description: 'Post it on LinkedIn. Walking through your project on video is extremely compelling.', frequency: 'once', xp: 25, difficulty: 'medium' },
          { id: 'm6_project_3', title: 'Prepare architecture explanation — what would you change at scale?', description: 'Be ready to discuss bottlenecks, tradeoffs, and what you\'d do differently', frequency: 'once', xp: 50, difficulty: 'hard' },
        ],
      },
      {
        id: 'm6_career',
        title: 'Final Push — Applications & Company Prep',
        skillType: 'career',
        tasks: [
          { id: 'm6_career_1', title: 'Apply to remaining targets — total 50+ companies',                                                                                      frequency: 'once', xp: 50, difficulty: 'medium', resource: 'https://simplify.jobs' },
          { id: 'm6_career_2', title: 'Follow up on all pending applications (polite 2-week follow-up)',                                                                       frequency: 'once', xp: 10, difficulty: 'easy' },
          { id: 'm6_career_3', title: 'Prepare company-specific notes for top 5 interview targets', description: 'Why this company, recent news, their tech stack, interesting engineering blog posts', frequency: 'once', xp: 25, difficulty: 'medium' },
        ],
      },
    ],
    checkpoints: [
      { id: 'm6_cp_1', title: 'Solve any LeetCode Medium in under 30 minutes consistently', target: '3+ consecutive successes',    skillType: 'dsa',          xpReward: 200 },
      { id: 'm6_cp_2', title: 'Explain your project architecture end-to-end fluently',      target: 'Under 5 minutes without notes', skillType: 'project',    xpReward: 100 },
      { id: 'm6_cp_3', title: 'Answer all 6 STAR behavioral stories from memory',           target: 'No notes, no hesitation',     skillType: 'interviewing', xpReward: 100 },
      { id: 'm6_cp_4', title: 'Explain 5 system design concepts clearly without notes',     target: 'Fluent on demand',            skillType: 'system_design', xpReward: 100 },
      { id: 'm6_cp_5', title: 'Total applications sent — 50+ companies',                    target: '50+ applications out',        skillType: 'career',       xpReward: 150 },
      { id: 'm6_cp_6', title: '20+ total mock interviews completed',                        target: 'All 6 months combined',       skillType: 'interviewing', xpReward: 150 },
      { id: 'm6_cp_7', title: 'Project live + demo video posted on LinkedIn',               target: 'Public and visible',          skillType: 'project',      xpReward: 100 },
    ],
    chapterReward: { title: 'Boss Fight Ready',      description: "Six months of grinding. You're not hoping to do well anymore — you're expecting it. Go get your offer.",                       badgeIcon: '👑', xpBonus: 1000 },
  },
]

// ── Flat task lookup map ──────────────────────────────────────────────────────
export const TASKS_MAP = {}
for (const month of MONTHS) {
  for (const section of month.sections) {
    for (const task of section.tasks) {
      TASKS_MAP[task.id] = { ...task, monthNumber: month.monthNumber, sectionId: section.id }
    }
  }
}

// ── Helper: compute month XP totals ──────────────────────────────────────────
export function getMonthXPTotals(month, completedTaskIds, completedCpIds) {
  const completedSet = new Set(completedTaskIds)
  const cpSet        = new Set(completedCpIds)

  const onceTasks = month.sections.flatMap(s => s.tasks).filter(t => t.frequency === 'once')
  const earned = onceTasks.filter(t => completedSet.has(t.id)).reduce((s, t) => s + t.xp, 0)
              + month.checkpoints.filter(c => cpSet.has(c.id)).reduce((s, c) => s + c.xpReward, 0)

  const total  = onceTasks.reduce((s, t) => s + t.xp, 0)
              + month.checkpoints.reduce((s, c) => s + c.xpReward, 0)

  return { earned, total }
}
