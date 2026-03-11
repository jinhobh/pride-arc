# Python translation of data/plan.js
# All task, checkpoint, habit, and chapter reward data for the 6-month plan.

# ── Level thresholds ──────────────────────────────────────────────────────────

# Cumulative XP required to reach each skill level (index 0 = level 1)
SKILL_LEVEL_THRESHOLDS: list[int] = [0, 25, 75, 150, 250, 375, 525, 700, 900, 1150]

# Cumulative XP required to reach each character level (index 0 = level 1)
CHAR_LEVEL_THRESHOLDS: list[int] = [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000,
    3800, 4700, 5700, 6800, 8000, 9300, 10700,
]


def calc_skill_level(xp: int) -> int:
    level = 1
    for i, threshold in enumerate(SKILL_LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
    return level


def calc_char_level(total_xp: int) -> int:
    level = 1
    for i, threshold in enumerate(CHAR_LEVEL_THRESHOLDS):
        if total_xp >= threshold:
            level = i + 1
    return level


# ── Initial stats ─────────────────────────────────────────────────────────────

INITIAL_STATS: dict[str, dict] = {
    "dsa":           {"label": "DSA",          "level": 1, "xp": 0, "icon": "⚔️"},
    "ml":            {"label": "ML / AI",      "level": 2, "xp": 0, "icon": "🧠"},
    "backend":       {"label": "Backend",      "level": 1, "xp": 0, "icon": "🔧"},
    "devops":        {"label": "DevOps",       "level": 1, "xp": 0, "icon": "🐳"},
    "cloud":         {"label": "Cloud",        "level": 1, "xp": 0, "icon": "☁️"},
    "system_design": {"label": "Sys Design",   "level": 1, "xp": 0, "icon": "🏗️"},
    "project":       {"label": "Project",      "level": 1, "xp": 0, "icon": "🚀"},
    "networking":    {"label": "Networking",   "level": 1, "xp": 0, "icon": "🤝"},
    "interviewing":  {"label": "Interviewing", "level": 1, "xp": 0, "icon": "🎯"},
    "career":        {"label": "Career",       "level": 1, "xp": 0, "icon": "💼"},
}

# ── Tasks ─────────────────────────────────────────────────────────────────────
# Fields: id, skill_type, frequency ("once"|"daily"|"weekly"), xp, month_number, title

TASKS: dict[str, dict] = {
    # ── Month 1 ──────────────────────────────────────────────────────────────
    "m1_dsa_1":       {"id": "m1_dsa_1",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 1, "title": "Complete Arrays & Strings on Neetcode 150"},
    "m1_dsa_2":       {"id": "m1_dsa_2",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 1, "title": "Complete HashMaps & Sets section"},
    "m1_dsa_3":       {"id": "m1_dsa_3",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 1, "title": "Complete Two Pointers section"},
    "m1_dsa_4":       {"id": "m1_dsa_4",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 1, "title": "Complete Sliding Window section"},
    "m1_dsa_5":       {"id": "m1_dsa_5",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 1, "title": "Complete Stacks & Queues section"},
    "m1_dsa_daily":   {"id": "m1_dsa_daily",   "skill_type": "dsa",     "frequency": "daily",  "xp": 10, "month_number": 1, "title": "Solve 2 LeetCode problems (Easy)"},
    "m1_backend_1":   {"id": "m1_backend_1",   "skill_type": "backend", "frequency": "once",   "xp": 25, "month_number": 1, "title": "Build a FastAPI app with GET and POST endpoints"},
    "m1_backend_2":   {"id": "m1_backend_2",   "skill_type": "backend", "frequency": "once",   "xp": 25, "month_number": 1, "title": "Learn SQL fundamentals"},
    "m1_backend_3":   {"id": "m1_backend_3",   "skill_type": "backend", "frequency": "once",   "xp": 25, "month_number": 1, "title": "Connect PostgreSQL to your FastAPI app"},
    "m1_project_1":   {"id": "m1_project_1",   "skill_type": "project", "frequency": "once",   "xp": 10, "month_number": 1, "title": "Create GitHub repo and push initial project scaffold"},
    "m1_project_2":   {"id": "m1_project_2",   "skill_type": "project", "frequency": "once",   "xp": 25, "month_number": 1, "title": "Connect PostgreSQL to project and run first DB query"},
    "m1_project_daily":{"id": "m1_project_daily","skill_type": "project","frequency": "daily",  "xp":  5, "month_number": 1, "title": "Push at least one commit to GitHub"},

    # ── Month 2 ──────────────────────────────────────────────────────────────
    "m2_dsa_1":       {"id": "m2_dsa_1",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 2, "title": "Complete Linked Lists section on Neetcode 150"},
    "m2_dsa_2":       {"id": "m2_dsa_2",       "skill_type": "dsa",     "frequency": "once",   "xp": 25, "month_number": 2, "title": "Complete Binary Search section"},
    "m2_dsa_3":       {"id": "m2_dsa_3",       "skill_type": "dsa",     "frequency": "once",   "xp": 50, "month_number": 2, "title": "Complete Trees (BFS + DFS) section"},
    "m2_dsa_4":       {"id": "m2_dsa_4",       "skill_type": "dsa",     "frequency": "once",   "xp": 50, "month_number": 2, "title": "Complete Basic Recursion & Backtracking section"},
    "m2_dsa_daily":   {"id": "m2_dsa_daily",   "skill_type": "dsa",     "frequency": "daily",  "xp": 15, "month_number": 2, "title": "Solve 3 LeetCode problems (Easy/Medium mix)"},
    "m2_devops_1":    {"id": "m2_devops_1",    "skill_type": "devops",  "frequency": "once",   "xp": 25, "month_number": 2, "title": "Write a Dockerfile for your FastAPI app"},
    "m2_devops_2":    {"id": "m2_devops_2",    "skill_type": "devops",  "frequency": "once",   "xp": 25, "month_number": 2, "title": "Set up docker-compose with app + PostgreSQL"},
    "m2_devops_3":    {"id": "m2_devops_3",    "skill_type": "devops",  "frequency": "once",   "xp": 10, "month_number": 2, "title": "Learn Linux CLI fundamentals"},
    "m2_devops_4":    {"id": "m2_devops_4",    "skill_type": "devops",  "frequency": "once",   "xp": 10, "month_number": 2, "title": "Practice Git branching and pull request workflow"},
    "m2_ml_1":        {"id": "m2_ml_1",        "skill_type": "ml",      "frequency": "once",   "xp": 25, "month_number": 2, "title": "Complete PyTorch fundamentals (tensors, autograd)"},
    "m2_ml_2":        {"id": "m2_ml_2",        "skill_type": "ml",      "frequency": "once",   "xp": 50, "month_number": 2, "title": "Build a neural network from scratch in PyTorch"},
    "m2_ml_3":        {"id": "m2_ml_3",        "skill_type": "ml",      "frequency": "once",   "xp": 50, "month_number": 2, "title": "Build a simple image or text classifier with PyTorch"},
    "m2_project_1":   {"id": "m2_project_1",   "skill_type": "project", "frequency": "once",   "xp": 50, "month_number": 2, "title": "Integrate PyTorch model into FastAPI backend"},
    "m2_project_2":   {"id": "m2_project_2",   "skill_type": "project", "frequency": "once",   "xp": 25, "month_number": 2, "title": "Add /predict endpoint that returns model output"},
    "m2_project_3":   {"id": "m2_project_3",   "skill_type": "project", "frequency": "once",   "xp": 25, "month_number": 2, "title": "Write basic pytest tests for your API"},

    # ── Month 3 ──────────────────────────────────────────────────────────────
    "m3_dsa_1":       {"id": "m3_dsa_1",       "skill_type": "dsa",     "frequency": "once",   "xp":  50, "month_number": 3, "title": "Complete Graphs section"},
    "m3_dsa_2":       {"id": "m3_dsa_2",       "skill_type": "dsa",     "frequency": "once",   "xp":  50, "month_number": 3, "title": "Complete Backtracking section"},
    "m3_dsa_3":       {"id": "m3_dsa_3",       "skill_type": "dsa",     "frequency": "once",   "xp":  50, "month_number": 3, "title": "Complete Heaps / Priority Queues section"},
    "m3_dsa_4":       {"id": "m3_dsa_4",       "skill_type": "dsa",     "frequency": "once",   "xp":  50, "month_number": 3, "title": "Participate in first LeetCode Weekly Contest"},
    "m3_dsa_daily":   {"id": "m3_dsa_daily",   "skill_type": "dsa",     "frequency": "daily",  "xp":  20, "month_number": 3, "title": "Solve 4 LeetCode problems (mostly Mediums)"},
    "m3_cloud_1":     {"id": "m3_cloud_1",     "skill_type": "cloud",   "frequency": "once",   "xp":  10, "month_number": 3, "title": "Create AWS Free Tier account"},
    "m3_cloud_2":     {"id": "m3_cloud_2",     "skill_type": "cloud",   "frequency": "once",   "xp":  25, "month_number": 3, "title": "Spin up an EC2 instance and SSH into it"},
    "m3_cloud_3":     {"id": "m3_cloud_3",     "skill_type": "cloud",   "frequency": "once",   "xp":  25, "month_number": 3, "title": "Store and retrieve files with S3"},
    "m3_cloud_4":     {"id": "m3_cloud_4",     "skill_type": "cloud",   "frequency": "once",   "xp":  25, "month_number": 3, "title": "Learn AWS Lambda basics — deploy a serverless function"},
    "m3_ml_1":        {"id": "m3_ml_1",        "skill_type": "ml",      "frequency": "once",   "xp":  25, "month_number": 3, "title": "Learn HuggingFace ecosystem"},
    "m3_ml_2":        {"id": "m3_ml_2",        "skill_type": "ml",      "frequency": "once",   "xp": 100, "month_number": 3, "title": "Fine-tune a pre-trained model (BERT or DistilBERT)"},
    "m3_ml_3":        {"id": "m3_ml_3",        "skill_type": "ml",      "frequency": "once",   "xp":  25, "month_number": 3, "title": "Explain: embeddings, attention, tokenization"},
    "m3_project_1":   {"id": "m3_project_1",   "skill_type": "project", "frequency": "once",   "xp": 100, "month_number": 3, "title": "Deploy FastAPI + ML app on AWS EC2 or Railway"},
    "m3_project_2":   {"id": "m3_project_2",   "skill_type": "project", "frequency": "once",   "xp":  10, "month_number": 3, "title": "Write a proper README"},
    "m3_project_3":   {"id": "m3_project_3",   "skill_type": "project", "frequency": "once",   "xp":  10, "month_number": 3, "title": "Add live URL to GitHub profile and LinkedIn"},

    # ── Month 4 ──────────────────────────────────────────────────────────────
    "m4_dsa_1":       {"id": "m4_dsa_1",       "skill_type": "dsa",           "frequency": "once",   "xp":  50, "month_number": 4, "title": "Complete Dynamic Programming section (1D DP)"},
    "m4_dsa_2":       {"id": "m4_dsa_2",       "skill_type": "dsa",           "frequency": "once",   "xp":  50, "month_number": 4, "title": "Complete Dynamic Programming section (2D DP)"},
    "m4_dsa_3":       {"id": "m4_dsa_3",       "skill_type": "dsa",           "frequency": "once",   "xp":  25, "month_number": 4, "title": "Complete Tries section"},
    "m4_dsa_4":       {"id": "m4_dsa_4",       "skill_type": "dsa",           "frequency": "once",   "xp":  50, "month_number": 4, "title": "Complete Advanced Graphs (Dijkstra, Topological Sort)"},
    "m4_dsa_5":       {"id": "m4_dsa_5",       "skill_type": "dsa",           "frequency": "once",   "xp":  10, "month_number": 4, "title": "Start keeping an error log"},
    "m4_dsa_daily":   {"id": "m4_dsa_daily",   "skill_type": "dsa",           "frequency": "daily",  "xp":  25, "month_number": 4, "title": "Solve 4–5 LeetCode problems (Mediums + some Hards)"},
    "m4_sd_1":        {"id": "m4_sd_1",        "skill_type": "system_design", "frequency": "weekly", "xp":  10, "month_number": 4, "title": "Watch 4 ByteByteGo videos (1/week)"},
    "m4_sd_2":        {"id": "m4_sd_2",        "skill_type": "system_design", "frequency": "once",   "xp":  10, "month_number": 4, "title": "Study load balancers"},
    "m4_sd_3":        {"id": "m4_sd_3",        "skill_type": "system_design", "frequency": "once",   "xp":  10, "month_number": 4, "title": "Study databases vs caches (Redis)"},
    "m4_sd_4":        {"id": "m4_sd_4",        "skill_type": "system_design", "frequency": "once",   "xp":  10, "month_number": 4, "title": "Study REST APIs vs GraphQL"},
    "m4_sd_5":        {"id": "m4_sd_5",        "skill_type": "system_design", "frequency": "once",   "xp":  25, "month_number": 4, "title": "Study CDNs, scaling, CAP theorem basics"},
    "m4_career_1":    {"id": "m4_career_1",    "skill_type": "career",        "frequency": "once",   "xp":  25, "month_number": 4, "title": "Build your 1-page resume"},
    "m4_career_2":    {"id": "m4_career_2",    "skill_type": "career",        "frequency": "once",   "xp":  10, "month_number": 4, "title": "Get resume reviewed"},
    "m4_career_3":    {"id": "m4_career_3",    "skill_type": "career",        "frequency": "once",   "xp":  25, "month_number": 4, "title": "Apply to Google STEP Internship"},
    "m4_career_4":    {"id": "m4_career_4",    "skill_type": "career",        "frequency": "once",   "xp":  25, "month_number": 4, "title": "Apply to Microsoft Explore"},
    "m4_career_5":    {"id": "m4_career_5",    "skill_type": "career",        "frequency": "once",   "xp":  25, "month_number": 4, "title": "Apply to Meta University"},
    "m4_career_6":    {"id": "m4_career_6",    "skill_type": "career",        "frequency": "once",   "xp":  25, "month_number": 4, "title": "Apply to Amazon Future Engineer"},
    "m4_project_1":   {"id": "m4_project_1",   "skill_type": "project",       "frequency": "once",   "xp":  50, "month_number": 4, "title": "Add JWT authentication to your FastAPI app"},
    "m4_project_2":   {"id": "m4_project_2",   "skill_type": "project",       "frequency": "once",   "xp":  25, "month_number": 4, "title": "Add Redis caching to the /predict endpoint"},
    "m4_project_3":   {"id": "m4_project_3",   "skill_type": "networking",    "frequency": "once",   "xp":  25, "month_number": 4, "title": "Write a LinkedIn post or blog about what you built"},

    # ── Month 5 ──────────────────────────────────────────────────────────────
    "m5_dsa_1":       {"id": "m5_dsa_1",       "skill_type": "dsa",          "frequency": "once",   "xp": 100, "month_number": 5, "title": "Complete the Neetcode 150 (all remaining problems)"},
    "m5_dsa_2":       {"id": "m5_dsa_2",       "skill_type": "dsa",          "frequency": "once",   "xp":  50, "month_number": 5, "title": "Do 4 full 90-minute timed simulation sessions"},
    "m5_dsa_weekly":  {"id": "m5_dsa_weekly",  "skill_type": "dsa",          "frequency": "weekly", "xp":  50, "month_number": 5, "title": "LeetCode Weekly Contest every Sunday"},
    "m5_mock_1":      {"id": "m5_mock_1",      "skill_type": "interviewing", "frequency": "once",   "xp":  50, "month_number": 5, "title": "Complete 4 mock interviews on Pramp"},
    "m5_mock_2":      {"id": "m5_mock_2",      "skill_type": "interviewing", "frequency": "once",   "xp":  50, "month_number": 5, "title": "Complete 4 mock interviews on interviewing.io"},
    "m5_mock_weekly": {"id": "m5_mock_weekly", "skill_type": "interviewing", "frequency": "weekly", "xp":  50, "month_number": 5, "title": "2 mock interviews per week"},
    "m5_beh_1":       {"id": "m5_beh_1",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Write your 'Overcoming a challenge' STAR story"},
    "m5_beh_2":       {"id": "m5_beh_2",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Write your 'Teamwork' STAR story"},
    "m5_beh_3":       {"id": "m5_beh_3",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Write your 'Failure / learning' STAR story"},
    "m5_beh_4":       {"id": "m5_beh_4",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Write your 'Technical decision I made' STAR story"},
    "m5_beh_5":       {"id": "m5_beh_5",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Write your 'Impact I created' STAR story"},
    "m5_beh_6":       {"id": "m5_beh_6",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Write your 'Why this company' answer for top 3 targets"},
    "m5_beh_7":       {"id": "m5_beh_7",       "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 5, "title": "Practice all 6 STAR stories out loud without notes"},
    "m5_net_1":       {"id": "m5_net_1",       "skill_type": "networking",   "frequency": "once",   "xp":  25, "month_number": 5, "title": "Request 5+ referrals from LinkedIn connections"},
    "m5_net_2":       {"id": "m5_net_2",       "skill_type": "career",       "frequency": "once",   "xp":  50, "month_number": 5, "title": "Apply to 30+ companies total"},
    "m5_net_3":       {"id": "m5_net_3",       "skill_type": "career",       "frequency": "once",   "xp":  10, "month_number": 5, "title": "Set up Simplify.jobs to track all applications"},

    # ── Month 6 ──────────────────────────────────────────────────────────────
    "m6_dsa_1":       {"id": "m6_dsa_1",       "skill_type": "dsa",          "frequency": "once",   "xp":  50, "month_number": 6, "title": "Review entire error log — redo every problem you got wrong"},
    "m6_dsa_2":       {"id": "m6_dsa_2",       "skill_type": "dsa",          "frequency": "once",   "xp":  50, "month_number": 6, "title": "Complete 2 full LeetCode Virtual Contests (timed)"},
    "m6_dsa_daily":   {"id": "m6_dsa_daily",   "skill_type": "dsa",          "frequency": "daily",  "xp":  15, "month_number": 6, "title": "Solve 2–3 LeetCode problems (review and reinforce)"},
    "m6_dsa_weekly":  {"id": "m6_dsa_weekly",  "skill_type": "dsa",          "frequency": "weekly", "xp":  50, "month_number": 6, "title": "LeetCode Weekly Contest every Sunday"},
    "m6_mock_weekly": {"id": "m6_mock_weekly", "skill_type": "interviewing", "frequency": "weekly", "xp":  75, "month_number": 6, "title": "3 mock interviews per week (coding + behavioral)"},
    "m6_mock_1":      {"id": "m6_mock_1",      "skill_type": "interviewing", "frequency": "once",   "xp":  25, "month_number": 6, "title": "Record a mock interview on Zoom and watch it back"},
    "m6_mock_2":      {"id": "m6_mock_2",      "skill_type": "interviewing", "frequency": "once",   "xp":  10, "month_number": 6, "title": "Practice with a timer visible on screen for every session"},
    "m6_project_1":   {"id": "m6_project_1",   "skill_type": "project",       "frequency": "once",   "xp":  25, "month_number": 6, "title": "Clean up codebase — remove dead code, add comments"},
    "m6_project_2":   {"id": "m6_project_2",   "skill_type": "project",       "frequency": "once",   "xp":  25, "month_number": 6, "title": "Record a 2-minute demo video of your project"},
    "m6_project_3":   {"id": "m6_project_3",   "skill_type": "system_design", "frequency": "once",   "xp":  50, "month_number": 6, "title": "Prepare architecture explanation — what would you change at scale?"},
    "m6_career_1":    {"id": "m6_career_1",    "skill_type": "career",        "frequency": "once",   "xp":  50, "month_number": 6, "title": "Apply to remaining targets — total 50+ companies"},
    "m6_career_2":    {"id": "m6_career_2",    "skill_type": "career",        "frequency": "once",   "xp":  10, "month_number": 6, "title": "Follow up on all pending applications"},
    "m6_career_3":    {"id": "m6_career_3",    "skill_type": "career",        "frequency": "once",   "xp":  25, "month_number": 6, "title": "Prepare company-specific notes for top 5 interview targets"},
}

# ── Checkpoints ───────────────────────────────────────────────────────────────
# Fields: id, skill_type, xp_reward, month_number, title

CHECKPOINTS: dict[str, dict] = {
    # Month 1
    "m1_cp_1": {"id": "m1_cp_1", "skill_type": "dsa",     "xp_reward":  50, "month_number": 1, "title": "Arrays, HashMaps, Two Pointers, Stacks complete"},
    "m1_cp_2": {"id": "m1_cp_2", "skill_type": "backend", "xp_reward":  50, "month_number": 1, "title": "FastAPI — build and run a REST API locally"},
    "m1_cp_3": {"id": "m1_cp_3", "skill_type": "backend", "xp_reward":  50, "month_number": 1, "title": "PostgreSQL — basic CRUD queries working"},
    "m1_cp_4": {"id": "m1_cp_4", "skill_type": "project", "xp_reward":  25, "month_number": 1, "title": "GitHub — public repo with daily commits and README"},
    "m1_cp_5": {"id": "m1_cp_5", "skill_type": "dsa",     "xp_reward":  75, "month_number": 1, "title": "Neetcode 150 — Arrays section complete"},

    # Month 2
    "m2_cp_1": {"id": "m2_cp_1", "skill_type": "devops",  "xp_reward":  50, "month_number": 2, "title": "Docker — app containerized with docker-compose"},
    "m2_cp_2": {"id": "m2_cp_2", "skill_type": "devops",  "xp_reward":  25, "month_number": 2, "title": "Linux CLI — comfortable with basic commands"},
    "m2_cp_3": {"id": "m2_cp_3", "skill_type": "dsa",     "xp_reward":  50, "month_number": 2, "title": "Trees BFS/DFS — 10+ problems solved"},
    "m2_cp_4": {"id": "m2_cp_4", "skill_type": "ml",      "xp_reward":  75, "month_number": 2, "title": "PyTorch — trained a basic neural network"},
    "m2_cp_5": {"id": "m2_cp_5", "skill_type": "project", "xp_reward":  75, "month_number": 2, "title": "Project — /predict endpoint live and tested"},
    "m2_cp_6": {"id": "m2_cp_6", "skill_type": "dsa",     "xp_reward":  50, "month_number": 2, "title": "Neetcode 150 — 60+ problems total"},

    # Month 3
    "m3_cp_1": {"id": "m3_cp_1", "skill_type": "project", "xp_reward": 150, "month_number": 3, "title": "Project deployed — live URL accessible to anyone"},
    "m3_cp_2": {"id": "m3_cp_2", "skill_type": "cloud",   "xp_reward":  75, "month_number": 3, "title": "AWS EC2 + S3 — hands-on done"},
    "m3_cp_3": {"id": "m3_cp_3", "skill_type": "dsa",     "xp_reward":  75, "month_number": 3, "title": "Graph traversal — 15+ graph problems solved"},
    "m3_cp_4": {"id": "m3_cp_4", "skill_type": "ml",      "xp_reward": 100, "month_number": 3, "title": "HuggingFace — fine-tuned a transformer model"},
    "m3_cp_5": {"id": "m3_cp_5", "skill_type": "dsa",     "xp_reward":  75, "month_number": 3, "title": "LeetCode Weekly Contest — attempted 2+ contests"},
    "m3_cp_6": {"id": "m3_cp_6", "skill_type": "dsa",     "xp_reward":  75, "month_number": 3, "title": "Neetcode 150 — 90+ problems total"},

    # Month 4
    "m4_cp_1": {"id": "m4_cp_1", "skill_type": "dsa",           "xp_reward": 100, "month_number": 4, "title": "DP — 15+ problems solved (1D and 2D)"},
    "m4_cp_2": {"id": "m4_cp_2", "skill_type": "system_design", "xp_reward":  75, "month_number": 4, "title": "System design vocab — explain 5 core concepts fluently"},
    "m4_cp_3": {"id": "m4_cp_3", "skill_type": "career",        "xp_reward": 100, "month_number": 4, "title": "Resume — 1-page, reviewed, polished"},
    "m4_cp_4": {"id": "m4_cp_4", "skill_type": "career",        "xp_reward": 100, "month_number": 4, "title": "Applied to all 4 freshman programs"},
    "m4_cp_5": {"id": "m4_cp_5", "skill_type": "project",       "xp_reward":  75, "month_number": 4, "title": "Project — auth + caching added"},
    "m4_cp_6": {"id": "m4_cp_6", "skill_type": "dsa",           "xp_reward":  75, "month_number": 4, "title": "Neetcode 150 — 120+ problems total"},

    # Month 5
    "m5_cp_1": {"id": "m5_cp_1", "skill_type": "dsa",          "xp_reward": 200, "month_number": 5, "title": "Neetcode 150 — fully complete"},
    "m5_cp_2": {"id": "m5_cp_2", "skill_type": "interviewing", "xp_reward": 150, "month_number": 5, "title": "8+ mock interviews completed"},
    "m5_cp_3": {"id": "m5_cp_3", "skill_type": "interviewing", "xp_reward": 100, "month_number": 5, "title": "6 STAR behavioral stories — ready from memory"},
    "m5_cp_4": {"id": "m5_cp_4", "skill_type": "career",       "xp_reward": 100, "month_number": 5, "title": "30+ applications sent"},
    "m5_cp_5": {"id": "m5_cp_5", "skill_type": "networking",   "xp_reward":  75, "month_number": 5, "title": "5+ referrals requested from network"},
    "m5_cp_6": {"id": "m5_cp_6", "skill_type": "dsa",          "xp_reward": 100, "month_number": 5, "title": "LeetCode contest — finished in top 50%"},

    # Month 6
    "m6_cp_1": {"id": "m6_cp_1", "skill_type": "dsa",          "xp_reward": 200, "month_number": 6, "title": "Solve any LeetCode Medium in under 30 minutes consistently"},
    "m6_cp_2": {"id": "m6_cp_2", "skill_type": "project",      "xp_reward": 100, "month_number": 6, "title": "Explain your project architecture end-to-end fluently"},
    "m6_cp_3": {"id": "m6_cp_3", "skill_type": "interviewing", "xp_reward": 100, "month_number": 6, "title": "Answer all 6 STAR behavioral stories from memory"},
    "m6_cp_4": {"id": "m6_cp_4", "skill_type": "system_design","xp_reward": 100, "month_number": 6, "title": "Explain 5 system design concepts clearly without notes"},
    "m6_cp_5": {"id": "m6_cp_5", "skill_type": "career",       "xp_reward": 150, "month_number": 6, "title": "Total applications sent — 50+ companies"},
    "m6_cp_6": {"id": "m6_cp_6", "skill_type": "interviewing", "xp_reward": 150, "month_number": 6, "title": "20+ total mock interviews completed"},
    "m6_cp_7": {"id": "m6_cp_7", "skill_type": "project",      "xp_reward": 100, "month_number": 6, "title": "Project live + demo video posted on LinkedIn"},
}

# Checkpoint IDs grouped by month (for chapter-unlock checks)
CHECKPOINTS_BY_MONTH: dict[int, list[str]] = {
    1: ["m1_cp_1", "m1_cp_2", "m1_cp_3", "m1_cp_4", "m1_cp_5"],
    2: ["m2_cp_1", "m2_cp_2", "m2_cp_3", "m2_cp_4", "m2_cp_5", "m2_cp_6"],
    3: ["m3_cp_1", "m3_cp_2", "m3_cp_3", "m3_cp_4", "m3_cp_5", "m3_cp_6"],
    4: ["m4_cp_1", "m4_cp_2", "m4_cp_3", "m4_cp_4", "m4_cp_5", "m4_cp_6"],
    5: ["m5_cp_1", "m5_cp_2", "m5_cp_3", "m5_cp_4", "m5_cp_5", "m5_cp_6"],
    6: ["m6_cp_1", "m6_cp_2", "m6_cp_3", "m6_cp_4", "m6_cp_5", "m6_cp_6", "m6_cp_7"],
}

# ── Habits ────────────────────────────────────────────────────────────────────

HABITS: dict[str, dict] = {
    "habit_leetcode":  {"id": "habit_leetcode",  "skill_type": "dsa",          "xp_per_completion": 15, "title": "LeetCode problems",                      "starts_at_month": None},
    "habit_project":   {"id": "habit_project",   "skill_type": "project",      "xp_per_completion": 25, "title": "Work on your project",                   "starts_at_month": None},
    "habit_reading":   {"id": "habit_reading",   "skill_type": "system_design","xp_per_completion": 10, "title": "Read one tech article or blog",           "starts_at_month": None},
    "habit_networking":{"id": "habit_networking","skill_type": "networking",   "xp_per_completion": 15, "title": "Network — LinkedIn DM or coffee chat",    "starts_at_month": None},
    "habit_mock":      {"id": "habit_mock",      "skill_type": "interviewing", "xp_per_completion": 50, "title": "Mock interview",                          "starts_at_month": 5},
}

# ── Chapter rewards ───────────────────────────────────────────────────────────

CHAPTER_REWARDS: dict[int, dict] = {
    1: {"badge_id": "month_1_complete", "title": "Backend Initiate",     "icon": "🛠️", "xp_bonus": 200,  "description": "You shipped your first API and started the grind. The journey begins."},
    2: {"badge_id": "month_2_complete", "title": "ML Engineer Initiate", "icon": "🧠", "xp_bonus": 300,  "description": "Your model is live in an API and your app runs in Docker. You're shipping real software."},
    3: {"badge_id": "month_3_complete", "title": "Cloud Deployer",       "icon": "🚀", "xp_bonus": 400,  "description": "Your ML app is live on the internet. Anyone can use what you built. That's real."},
    4: {"badge_id": "month_4_complete", "title": "Recruiter Ready",      "icon": "📋", "xp_bonus": 400,  "description": "Resume sent, freshman programs applied, and your system design vocab is growing. You're in the fight."},
    5: {"badge_id": "month_5_complete", "title": "Interview Warrior",    "icon": "⚔️", "xp_bonus": 500,  "description": "You've simulated the gauntlet, know your stories cold, and have 30+ applications out. Now you sharpen."},
    6: {"badge_id": "month_6_complete", "title": "Boss Fight Ready",     "icon": "👑", "xp_bonus": 1000, "description": "Six months of grinding. You're not hoping to do well anymore — you're expecting it. Go get your offer."},
}

# ── Derived lookups ───────────────────────────────────────────────────────────

# All task IDs that belong to each month
TASKS_BY_MONTH: dict[int, list[str]] = {}
for _task in TASKS.values():
    _m = _task["month_number"]
    TASKS_BY_MONTH.setdefault(_m, []).append(_task["id"])
