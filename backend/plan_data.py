# Python translation of data/plan.js
# All task, checkpoint, habit, and chapter reward data for the 6-month plan.

# ── Level thresholds ──────────────────────────────────────────────────────────

# Cumulative XP required to reach each skill level (index 0 = level 1)
SKILL_LEVEL_THRESHOLDS: list[int] = [0, 25, 75, 150, 250, 375, 525, 700, 900, 1150]

# Cumulative XP required to reach each character level (index 0 = level 1)
CHAR_LEVEL_THRESHOLDS: list[int] = [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000,
    3800, 4700, 5700, 6800, 8000, 9300, 10700, 12200,
    13800, 15500, 17300, 19200, 21200, 23300, 25500, 27800
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
# Tasks prefixed with "Wk N" indicate which week of the month to tackle them.

TASKS: dict[str, dict] = {

    # ═══════════════════════════════════════════════════════════════════════════
    # ── Month 1 — Foundations & Gaps ──────────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════════════

    # ── DSA — Daily Grind ──────────────────────────────────────────────────
    "m1_dsa_daily":  {"id": "m1_dsa_daily",  "skill_type": "dsa", "frequency": "daily", "xp": 5,  "month_number": 1, "title": "Solve 2 LeetCode Easy problems"},
    "m1_dsa_w1_1":   {"id": "m1_dsa_w1_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 1, "title": "Wk 1 · Complete Arrays & Strings section (NeetCode 150)"},
    "m1_dsa_w1_2":   {"id": "m1_dsa_w1_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 1, "title": "Wk 1 · Complete HashMaps & Sets section"},
    "m1_dsa_w2_1":   {"id": "m1_dsa_w2_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 1, "title": "Wk 2 · Complete Two Pointers section"},
    "m1_dsa_w2_2":   {"id": "m1_dsa_w2_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 1, "title": "Wk 2 · Complete Sliding Window section"},
    "m1_dsa_w3_1":   {"id": "m1_dsa_w3_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 1, "title": "Wk 3 · Complete Stacks & Queues section"},
    "m1_dsa_w4_1":   {"id": "m1_dsa_w4_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 1, "title": "Wk 4 · Review all 5 patterns — redo any problem you got wrong"},

    # ── Tech Stack — FastAPI & PostgreSQL ──────────────────────────────────
    "m1_be_w1_1":    {"id": "m1_be_w1_1",   "skill_type": "backend", "frequency": "once", "xp": 10, "month_number": 1, "title": "Wk 1 · Install Python 3.11+, create venv, install FastAPI + uvicorn"},
    "m1_be_w1_2":    {"id": "m1_be_w1_2",   "skill_type": "backend", "frequency": "once", "xp": 15, "month_number": 1, "title": "Wk 1 · Build a GET endpoint that returns JSON"},
    "m1_be_w2_1":    {"id": "m1_be_w2_1",   "skill_type": "backend", "frequency": "once", "xp": 15, "month_number": 1, "title": "Wk 2 · Add a POST endpoint with Pydantic request validation"},
    "m1_be_w2_2":    {"id": "m1_be_w2_2",   "skill_type": "backend", "frequency": "once", "xp": 15, "month_number": 1, "title": "Wk 2 · Add error handling and proper HTTP status codes"},
    "m1_be_w3_1":    {"id": "m1_be_w3_1",   "skill_type": "backend", "frequency": "once", "xp": 15, "month_number": 1, "title": "Wk 3 · Complete SQLBolt tutorial (SELECT, WHERE, JOINs)"},
    "m1_be_w3_2":    {"id": "m1_be_w3_2",   "skill_type": "backend", "frequency": "once", "xp": 15, "month_number": 1, "title": "Wk 3 · Practice INSERT, UPDATE, DELETE on a local database"},
    "m1_be_w4_1":    {"id": "m1_be_w4_1",   "skill_type": "backend", "frequency": "once", "xp": 10, "month_number": 1, "title": "Wk 4 · Install PostgreSQL locally or via Docker"},
    "m1_be_w4_2":    {"id": "m1_be_w4_2",   "skill_type": "backend", "frequency": "once", "xp": 20, "month_number": 1, "title": "Wk 4 · Connect PostgreSQL to FastAPI with SQLAlchemy"},
    "m1_be_w4_3":    {"id": "m1_be_w4_3",   "skill_type": "backend", "frequency": "once", "xp": 20, "month_number": 1, "title": "Wk 4 · Build full CRUD endpoints (create, read, update, delete)"},

    # ── Project — Scaffold It ──────────────────────────────────────────────
    "m1_proj_w1_1":  {"id": "m1_proj_w1_1", "skill_type": "project", "frequency": "once",  "xp": 5,  "month_number": 1, "title": "Wk 1 · Create GitHub repo with README and .gitignore"},
    "m1_proj_w1_2":  {"id": "m1_proj_w1_2", "skill_type": "project", "frequency": "once",  "xp": 5,  "month_number": 1, "title": "Wk 1 · Set up folder structure (backend/, frontend/)"},
    "m1_proj_w2_1":  {"id": "m1_proj_w2_1", "skill_type": "project", "frequency": "once",  "xp": 10, "month_number": 1, "title": "Wk 2 · Push initial scaffold with 3+ meaningful commits"},
    "m1_proj_w3_1":  {"id": "m1_proj_w3_1", "skill_type": "project", "frequency": "once",  "xp": 10, "month_number": 1, "title": "Wk 3 · Set up PostgreSQL for your project"},
    "m1_proj_w4_1":  {"id": "m1_proj_w4_1", "skill_type": "project", "frequency": "once",  "xp": 15, "month_number": 1, "title": "Wk 4 · Write and test your first database query in the project"},

    # ── ML — Weekly Paper ──────────────────────────────────────────────────
    "m1_paper":      {"id": "m1_paper",      "skill_type": "ml", "frequency": "weekly", "xp": 25, "month_number": 1, "title": "Read 1 ML paper"},

    # ── Probability Bootcamp ────────────────────────────────────────────────
    "m1_prob_weekly": {"id": "m1_prob_weekly", "skill_type": "ml", "frequency": "weekly", "xp": 15, "month_number": 1, "title": "Watch 2 Brunton Probability Bootcamp videos (vids 1–8)"},

    # ═══════════════════════════════════════════════════════════════════════════
    # ── Month 2 — DevOps & ML Sharpening ──────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════════════

    # ── DSA — Ramp Up ──────────────────────────────────────────────────────
    "m2_dsa_daily":  {"id": "m2_dsa_daily",  "skill_type": "dsa", "frequency": "daily", "xp": 15, "month_number": 2, "title": "Solve 3 LeetCode problems (Easy/Medium mix)"},
    "m2_dsa_w1_1":   {"id": "m2_dsa_w1_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 2, "title": "Wk 1 · Complete Linked Lists section (NeetCode 150)"},
    "m2_dsa_w2_1":   {"id": "m2_dsa_w2_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 2, "title": "Wk 2 · Complete Binary Search section"},
    "m2_dsa_w3_1":   {"id": "m2_dsa_w3_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 2, "title": "Wk 3 · Complete Trees BFS section"},
    "m2_dsa_w3_2":   {"id": "m2_dsa_w3_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 2, "title": "Wk 3 · Complete Trees DFS section"},
    "m2_dsa_w4_1":   {"id": "m2_dsa_w4_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 2, "title": "Wk 4 · Complete Basic Recursion section"},
    "m2_dsa_w4_2":   {"id": "m2_dsa_w4_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 2, "title": "Wk 4 · Complete Backtracking intro problems"},

    # ── Tech Stack — Docker & Linux ────────────────────────────────────────
    "m2_devops_w1_1": {"id": "m2_devops_w1_1", "skill_type": "devops", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 1 · Install Docker Desktop and run hello-world container"},
    "m2_devops_w1_2": {"id": "m2_devops_w1_2", "skill_type": "devops", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 1 · Write a Dockerfile for your FastAPI app"},
    "m2_devops_w2_1": {"id": "m2_devops_w2_1", "skill_type": "devops", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 2 · Write docker-compose.yml with app + PostgreSQL"},
    "m2_devops_w2_2": {"id": "m2_devops_w2_2", "skill_type": "devops", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 2 · Verify your app runs end-to-end with docker-compose up"},
    "m2_devops_w3_1": {"id": "m2_devops_w3_1", "skill_type": "devops", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 3 · Learn essential Linux commands (ls, cd, grep, chmod, ssh)"},
    "m2_devops_w4_1": {"id": "m2_devops_w4_1", "skill_type": "devops", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 4 · Create a feature branch and open your first pull request"},

    # ── ML Depth — PyTorch ─────────────────────────────────────────────────
    "m2_ml_w1_1":    {"id": "m2_ml_w1_1",   "skill_type": "ml", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 1 · Install PyTorch and run basic tensor operations"},
    "m2_ml_w1_2":    {"id": "m2_ml_w1_2",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 1 · Learn autograd — build a computation graph and call .backward()"},
    "m2_ml_w2_1":    {"id": "m2_ml_w2_1",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 2 · Build a 2-layer neural network from scratch (no nn.Module)"},
    "m2_ml_w2_2":    {"id": "m2_ml_w2_2",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 2 · Rewrite using nn.Module, nn.Linear, and an optimizer"},
    "m2_ml_w3_1":    {"id": "m2_ml_w3_1",   "skill_type": "ml", "frequency": "once", "xp": 20, "month_number": 2, "title": "Wk 3 · Train an image classifier on MNIST or CIFAR-10"},
    "m2_ml_w3_2":    {"id": "m2_ml_w3_2",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 3 · Evaluate with accuracy, confusion matrix, and loss curves"},
    "m2_ml_w4_1":    {"id": "m2_ml_w4_1",   "skill_type": "ml", "frequency": "once", "xp": 20, "month_number": 2, "title": "Wk 4 · Build a text classifier with torchtext or custom dataset"},
    "m2_ml_w4_2":    {"id": "m2_ml_w4_2",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 4 · Save model with torch.save() and load it for inference"},

    # ── Probability Bootcamp ────────────────────────────────────────────────
    "m2_prob_weekly": {"id": "m2_prob_weekly", "skill_type": "ml", "frequency": "weekly", "xp": 15, "month_number": 2, "title": "Watch 2 Brunton Probability Bootcamp videos (vids 9–16)"},

    # ── Project — Add ML Endpoint ──────────────────────────────────────────
    "m2_proj_w2_1":  {"id": "m2_proj_w2_1", "skill_type": "project", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 2 · Export your trained model and load it in FastAPI"},
    "m2_proj_w2_2":  {"id": "m2_proj_w2_2", "skill_type": "project", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 2 · Create a /predict endpoint that returns model output"},
    "m2_proj_w3_1":  {"id": "m2_proj_w3_1", "skill_type": "project", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 3 · Add input validation and error handling to /predict"},
    "m2_proj_w3_2":  {"id": "m2_proj_w3_2", "skill_type": "project", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 3 · Test /predict manually with curl or Postman"},
    "m2_proj_w4_1":  {"id": "m2_proj_w4_1", "skill_type": "project", "frequency": "once", "xp": 15, "month_number": 2, "title": "Wk 4 · Write 5+ pytest tests for your API endpoints"},
    "m2_proj_w4_2":  {"id": "m2_proj_w4_2", "skill_type": "project", "frequency": "once", "xp": 10, "month_number": 2, "title": "Wk 4 · Set up pytest to run in CI or as a pre-commit check"},

    # ═══════════════════════════════════════════════════════════════════════════
    # ── Month 3 — Cloud Deployment ────────────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════════════

    # ── DSA — Go Hard ──────────────────────────────────────────────────────
    "m3_dsa_daily":  {"id": "m3_dsa_daily",  "skill_type": "dsa", "frequency": "daily", "xp": 20, "month_number": 3, "title": "Solve 4 LeetCode problems (mostly Mediums)"},
    "m3_dsa_w1_1":   {"id": "m3_dsa_w1_1",  "skill_type": "dsa", "frequency": "once",  "xp": 15, "month_number": 3, "title": "Wk 1 · Learn BFS and DFS graph traversal patterns"},
    "m3_dsa_w1_2":   {"id": "m3_dsa_w1_2",  "skill_type": "dsa", "frequency": "once",  "xp": 15, "month_number": 3, "title": "Wk 1 · Solve 5 graph problems (BFS focus)"},
    "m3_dsa_w2_1":   {"id": "m3_dsa_w2_1",  "skill_type": "dsa", "frequency": "once",  "xp": 15, "month_number": 3, "title": "Wk 2 · Solve 5 graph problems (DFS + connected components)"},
    "m3_dsa_w2_2":   {"id": "m3_dsa_w2_2",  "skill_type": "dsa", "frequency": "once",  "xp": 20, "month_number": 3, "title": "Wk 2 · Complete full Graphs section on NeetCode 150"},
    "m3_dsa_w3_1":   {"id": "m3_dsa_w3_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 3, "title": "Wk 3 · Complete Backtracking section (permutations, subsets, combos)"},
    "m3_dsa_w3_2":   {"id": "m3_dsa_w3_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 3, "title": "Wk 3 · Complete Heaps / Priority Queues section"},
    "m3_dsa_w4_1":   {"id": "m3_dsa_w4_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 3, "title": "Wk 4 · Enter your first LeetCode Weekly Contest"},
    "m3_dsa_w4_2":   {"id": "m3_dsa_w4_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 3, "title": "Wk 4 · Enter a second LeetCode Weekly Contest"},

    # ── Tech Stack — AWS Cloud ─────────────────────────────────────────────
    "m3_cloud_w1_1": {"id": "m3_cloud_w1_1", "skill_type": "cloud", "frequency": "once", "xp": 10, "month_number": 3, "title": "Wk 1 · Create AWS Free Tier account and set up IAM user"},
    "m3_cloud_w1_2": {"id": "m3_cloud_w1_2", "skill_type": "cloud", "frequency": "once", "xp": 10, "month_number": 3, "title": "Wk 1 · Launch an EC2 instance and SSH into it"},
    "m3_cloud_w2_1": {"id": "m3_cloud_w2_1", "skill_type": "cloud", "frequency": "once", "xp": 15, "month_number": 3, "title": "Wk 2 · Deploy a simple script on EC2 and keep it running"},
    "m3_cloud_w2_2": {"id": "m3_cloud_w2_2", "skill_type": "cloud", "frequency": "once", "xp": 10, "month_number": 3, "title": "Wk 2 · Create an S3 bucket, upload and download files via CLI"},
    "m3_cloud_w3_1": {"id": "m3_cloud_w3_1", "skill_type": "cloud", "frequency": "once", "xp": 15, "month_number": 3, "title": "Wk 3 · Write a Lambda function triggered by API Gateway"},
    "m3_cloud_w3_2": {"id": "m3_cloud_w3_2", "skill_type": "cloud", "frequency": "once", "xp": 10, "month_number": 3, "title": "Wk 3 · Test your Lambda with a curl request end-to-end"},

    # ── ML Depth — HuggingFace & Transformers ──────────────────────────────
    "m3_ml_w1_1":    {"id": "m3_ml_w1_1",   "skill_type": "ml", "frequency": "once", "xp": 10, "month_number": 3, "title": "Wk 1 · Install HuggingFace transformers and run a pre-trained pipeline"},
    "m3_ml_w1_2":    {"id": "m3_ml_w1_2",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 3, "title": "Wk 1 · Use a tokenizer — encode/decode text, inspect token IDs"},
    "m3_ml_w2_1":    {"id": "m3_ml_w2_1",   "skill_type": "ml", "frequency": "once", "xp": 15, "month_number": 3, "title": "Wk 2 · Explain embeddings, attention, and tokenization in your own words"},
    "m3_ml_w2_2":    {"id": "m3_ml_w2_2",   "skill_type": "ml", "frequency": "once", "xp": 25, "month_number": 3, "title": "Wk 2 · Prepare a dataset for fine-tuning (train/val split, tokenize)"},
    "m3_ml_w3_1":    {"id": "m3_ml_w3_1",   "skill_type": "ml", "frequency": "once", "xp": 50, "month_number": 3, "title": "Wk 3 · Fine-tune DistilBERT or BERT on a text classification task"},
    "m3_ml_w3_2":    {"id": "m3_ml_w3_2",   "skill_type": "ml", "frequency": "once", "xp": 25, "month_number": 3, "title": "Wk 3 · Evaluate fine-tuned model — report accuracy, F1, sample predictions"},

    # ── Probability Bootcamp ────────────────────────────────────────────────
    "m3_prob_weekly": {"id": "m3_prob_weekly", "skill_type": "ml", "frequency": "weekly", "xp": 15, "month_number": 3, "title": "Watch 2 Brunton Probability Bootcamp videos (vids 17–24)"},

    # ── Project — Deploy It Live ───────────────────────────────────────────
    "m3_proj_w3_1":  {"id": "m3_proj_w3_1", "skill_type": "project", "frequency": "once", "xp": 25, "month_number": 3, "title": "Wk 3 · Choose deployment target (EC2, Railway, or Render)"},
    "m3_proj_w3_2":  {"id": "m3_proj_w3_2", "skill_type": "project", "frequency": "once", "xp": 25, "month_number": 3, "title": "Wk 3 · Deploy your FastAPI + ML app to a live URL"},
    "m3_proj_w4_1":  {"id": "m3_proj_w4_1", "skill_type": "project", "frequency": "once", "xp": 25, "month_number": 3, "title": "Wk 4 · Verify live app works — test all endpoints from your phone"},
    "m3_proj_w4_2":  {"id": "m3_proj_w4_2", "skill_type": "project", "frequency": "once", "xp": 25, "month_number": 3, "title": "Wk 4 · Write a proper README with setup instructions and screenshots"},
    "m3_proj_w4_3":  {"id": "m3_proj_w4_3", "skill_type": "project", "frequency": "once", "xp": 10, "month_number": 3, "title": "Wk 4 · Add live URL to your GitHub profile and LinkedIn"},

    # ═══════════════════════════════════════════════════════════════════════════
    # ── Month 4 — System Design & Resume ──────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════════════

    # ── DSA — Hard Push ────────────────────────────────────────────────────
    "m4_dsa_daily":  {"id": "m4_dsa_daily",  "skill_type": "dsa", "frequency": "daily", "xp": 25, "month_number": 4, "title": "Solve 4-5 LeetCode problems (Mediums + some Hards)"},
    "m4_dsa_w1_1":   {"id": "m4_dsa_w1_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 1 · Learn 1D DP patterns (climbing stairs, house robber, coin change)"},
    "m4_dsa_w1_2":   {"id": "m4_dsa_w1_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 1 · Complete 1D Dynamic Programming section (NeetCode 150)"},
    "m4_dsa_w2_1":   {"id": "m4_dsa_w2_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 2 · Learn 2D DP patterns (grid paths, LCS, knapsack)"},
    "m4_dsa_w2_2":   {"id": "m4_dsa_w2_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 2 · Complete 2D Dynamic Programming section (NeetCode 150)"},
    "m4_dsa_w3_1":   {"id": "m4_dsa_w3_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 3 · Complete Tries section (NeetCode 150)"},
    "m4_dsa_w3_2":   {"id": "m4_dsa_w3_2",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 3 · Learn Dijkstra's algorithm and topological sort"},
    "m4_dsa_w4_1":   {"id": "m4_dsa_w4_1",  "skill_type": "dsa", "frequency": "once",  "xp": 25, "month_number": 4, "title": "Wk 4 · Complete Advanced Graphs section (NeetCode 150)"},
    "m4_dsa_w4_2":   {"id": "m4_dsa_w4_2",  "skill_type": "dsa", "frequency": "once",  "xp": 10, "month_number": 4, "title": "Wk 4 · Start an error log — write down every problem you got wrong and why"},

    # ── System Design — Intro Level ────────────────────────────────────────
    "m4_sd_weekly":  {"id": "m4_sd_weekly",  "skill_type": "system_design", "frequency": "weekly", "xp": 10, "month_number": 4, "title": "Watch 1 ByteByteGo video and write a 3-sentence summary"},
    "m4_sd_w1_1":    {"id": "m4_sd_w1_1",   "skill_type": "system_design", "frequency": "once",   "xp": 10, "month_number": 4, "title": "Wk 1 · Study load balancers — L4 vs L7, round robin, health checks"},
    "m4_sd_w2_1":    {"id": "m4_sd_w2_1",   "skill_type": "system_design", "frequency": "once",   "xp": 10, "month_number": 4, "title": "Wk 2 · Study databases vs caches — when to use Redis, cache invalidation"},
    "m4_sd_w3_1":    {"id": "m4_sd_w3_1",   "skill_type": "system_design", "frequency": "once",   "xp": 10, "month_number": 4, "title": "Wk 3 · Study REST vs GraphQL — when to use each, tradeoffs"},
    "m4_sd_w4_1":    {"id": "m4_sd_w4_1",   "skill_type": "system_design", "frequency": "once",   "xp": 10, "month_number": 4, "title": "Wk 4 · Study CDNs, horizontal scaling, and CAP theorem"},
    "m4_sd_w4_2":    {"id": "m4_sd_w4_2",   "skill_type": "system_design", "frequency": "once",   "xp": 15, "month_number": 4, "title": "Wk 4 · Write a 1-page cheat sheet of all 5 system design concepts"},

    # ── DDIA Reading ────────────────────────────────────────────────────────
    "m4_ddia_weekly": {"id": "m4_ddia_weekly", "skill_type": "system_design", "frequency": "weekly", "xp": 20, "month_number": 4, "title": "Read 1 DDIA section (sects 1–4 of 12)"},

    # ── Probability Bootcamp ────────────────────────────────────────────────
    "m4_prob_weekly": {"id": "m4_prob_weekly", "skill_type": "ml", "frequency": "weekly", "xp": 15, "month_number": 4, "title": "Watch 2 Brunton Probability Bootcamp videos (vids 25–32)"},

    # ── Career — Resume & Applications ─────────────────────────────────────
    "m4_career_w1_1": {"id": "m4_career_w1_1", "skill_type": "career", "frequency": "once", "xp": 10, "month_number": 4, "title": "Wk 1 · Gather all resume content — projects, skills, education"},
    "m4_career_w1_2": {"id": "m4_career_w1_2", "skill_type": "career", "frequency": "once", "xp": 15, "month_number": 4, "title": "Wk 1 · Draft your 1-page resume using Jake's template"},
    "m4_career_w2_1": {"id": "m4_career_w2_1", "skill_type": "career", "frequency": "once", "xp": 10, "month_number": 4, "title": "Wk 2 · Get resume reviewed by 2 people (peer, mentor, or online)"},
    "m4_career_w2_2": {"id": "m4_career_w2_2", "skill_type": "career", "frequency": "once", "xp": 10, "month_number": 4, "title": "Wk 2 · Revise resume based on feedback"},
    "m4_career_w3_1": {"id": "m4_career_w3_1", "skill_type": "career", "frequency": "once", "xp": 25, "month_number": 4, "title": "Wk 3 · Apply to Google STEP Internship"},
    "m4_career_w3_2": {"id": "m4_career_w3_2", "skill_type": "career", "frequency": "once", "xp": 25, "month_number": 4, "title": "Wk 3 · Apply to Microsoft Explore"},
    "m4_career_w4_1": {"id": "m4_career_w4_1", "skill_type": "career", "frequency": "once", "xp": 25, "month_number": 4, "title": "Wk 4 · Apply to Meta University"},
    "m4_career_w4_2": {"id": "m4_career_w4_2", "skill_type": "career", "frequency": "once", "xp": 25, "month_number": 4, "title": "Wk 4 · Apply to Amazon Future Engineer"},

    # ── Project — Add Depth ────────────────────────────────────────────────
    "m4_proj_w1_1":  {"id": "m4_proj_w1_1", "skill_type": "project",    "frequency": "once", "xp": 15, "month_number": 4, "title": "Wk 1 · Research JWT auth — understand access tokens vs refresh tokens"},
    "m4_proj_w1_2":  {"id": "m4_proj_w1_2", "skill_type": "project",    "frequency": "once", "xp": 20, "month_number": 4, "title": "Wk 1 · Implement JWT login/register endpoints in FastAPI"},
    "m4_proj_w2_1":  {"id": "m4_proj_w2_1", "skill_type": "project",    "frequency": "once", "xp": 15, "month_number": 4, "title": "Wk 2 · Protect your /predict endpoint with JWT auth"},
    "m4_proj_w3_1":  {"id": "m4_proj_w3_1", "skill_type": "project",    "frequency": "once", "xp": 10, "month_number": 4, "title": "Wk 3 · Install and configure Redis locally or in Docker"},
    "m4_proj_w3_2":  {"id": "m4_proj_w3_2", "skill_type": "project",    "frequency": "once", "xp": 15, "month_number": 4, "title": "Wk 3 · Add Redis caching to the /predict endpoint"},
    "m4_proj_w4_1":  {"id": "m4_proj_w4_1", "skill_type": "networking", "frequency": "once", "xp": 25, "month_number": 4, "title": "Wk 4 · Write a LinkedIn post or blog about what you built"},

    # ═══════════════════════════════════════════════════════════════════════════
    # ── Month 5 — Mock Interviews & Apps ──────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════════════

    # ── DSA — Interview Simulation Mode ────────────────────────────────────
    "m5_dsa_weekly": {"id": "m5_dsa_weekly", "skill_type": "dsa", "frequency": "weekly", "xp": 50, "month_number": 5, "title": "LeetCode Weekly Contest every Sunday"},
    "m5_dsa_w1_1":   {"id": "m5_dsa_w1_1",  "skill_type": "dsa", "frequency": "once",   "xp": 25, "month_number": 5, "title": "Wk 1 · Identify remaining NeetCode 150 gaps and make a hit list"},
    "m5_dsa_w1_2":   {"id": "m5_dsa_w1_2",  "skill_type": "dsa", "frequency": "once",   "xp": 25, "month_number": 5, "title": "Wk 1 · Complete all remaining Easy/Medium problems on the list"},
    "m5_dsa_w2_1":   {"id": "m5_dsa_w2_1",  "skill_type": "dsa", "frequency": "once",   "xp": 25, "month_number": 5, "title": "Wk 2 · Complete all remaining Hard problems on the list"},
    "m5_dsa_w2_2":   {"id": "m5_dsa_w2_2",  "skill_type": "dsa", "frequency": "once",   "xp": 25, "month_number": 5, "title": "Wk 2 · Verify NeetCode 150 is 100% complete"},
    "m5_dsa_w3_1":   {"id": "m5_dsa_w3_1",  "skill_type": "dsa", "frequency": "once",   "xp": 15, "month_number": 5, "title": "Wk 3 · 90-min timed simulation #1 (2 Mediums + 1 Hard)"},
    "m5_dsa_w3_2":   {"id": "m5_dsa_w3_2",  "skill_type": "dsa", "frequency": "once",   "xp": 15, "month_number": 5, "title": "Wk 3 · 90-min timed simulation #2"},
    "m5_dsa_w4_1":   {"id": "m5_dsa_w4_1",  "skill_type": "dsa", "frequency": "once",   "xp": 10, "month_number": 5, "title": "Wk 4 · 90-min timed simulation #3"},
    "m5_dsa_w4_2":   {"id": "m5_dsa_w4_2",  "skill_type": "dsa", "frequency": "once",   "xp": 10, "month_number": 5, "title": "Wk 4 · 90-min timed simulation #4"},

    # ── Mock Interviews ────────────────────────────────────────────────────
    "m5_mock_weekly": {"id": "m5_mock_weekly", "skill_type": "interviewing", "frequency": "weekly", "xp": 50, "month_number": 5, "title": "Complete 2 mock interviews this week"},
    "m5_mock_w1_1":  {"id": "m5_mock_w1_1", "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 1 · Sign up for Pramp and complete your first mock"},
    "m5_mock_w1_2":  {"id": "m5_mock_w1_2", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 1 · Complete second Pramp mock interview"},
    "m5_mock_w2_1":  {"id": "m5_mock_w2_1", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 2 · Complete third Pramp mock interview"},
    "m5_mock_w2_2":  {"id": "m5_mock_w2_2", "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 2 · Complete fourth Pramp mock interview"},
    "m5_mock_w3_1":  {"id": "m5_mock_w3_1", "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 3 · Sign up for interviewing.io and complete first mock"},
    "m5_mock_w3_2":  {"id": "m5_mock_w3_2", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 3 · Complete second interviewing.io mock"},
    "m5_mock_w4_1":  {"id": "m5_mock_w4_1", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 4 · Complete third interviewing.io mock"},
    "m5_mock_w4_2":  {"id": "m5_mock_w4_2", "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 4 · Complete fourth interviewing.io mock"},

    # ── Behavioral Interview Prep ──────────────────────────────────────────
    "m5_beh_w1_1":   {"id": "m5_beh_w1_1",  "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 1 · Write your 'Overcoming a challenge' STAR story"},
    "m5_beh_w1_2":   {"id": "m5_beh_w1_2",  "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 1 · Write your 'Teamwork' STAR story"},
    "m5_beh_w2_1":   {"id": "m5_beh_w2_1",  "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 2 · Write your 'Failure / learning' STAR story"},
    "m5_beh_w2_2":   {"id": "m5_beh_w2_2",  "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 2 · Write your 'Technical decision I made' STAR story"},
    "m5_beh_w3_1":   {"id": "m5_beh_w3_1",  "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 3 · Write your 'Impact I created' STAR story"},
    "m5_beh_w3_2":   {"id": "m5_beh_w3_2",  "skill_type": "interviewing", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 3 · Write 'Why this company' answer for top 3 targets"},
    "m5_beh_w4_1":   {"id": "m5_beh_w4_1",  "skill_type": "interviewing", "frequency": "once", "xp": 25, "month_number": 5, "title": "Wk 4 · Practice all 6 STAR stories out loud without notes"},
    "m5_beh_w4_2":   {"id": "m5_beh_w4_2",  "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 4 · Record yourself telling 2 stories and watch playback"},

    # ── Networking & Applications ──────────────────────────────────────────
    "m5_net_w1_1":   {"id": "m5_net_w1_1",  "skill_type": "career",     "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 1 · Set up Simplify.jobs to track all applications"},
    "m5_net_w1_2":   {"id": "m5_net_w1_2",  "skill_type": "career",     "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 1 · Make a list of 30+ target companies to apply to"},
    "m5_net_w2_1":   {"id": "m5_net_w2_1",  "skill_type": "career",     "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 2 · Apply to 10 companies"},
    "m5_net_w2_2":   {"id": "m5_net_w2_2",  "skill_type": "networking", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 2 · Identify 5 LinkedIn connections who could refer you"},
    "m5_net_w3_1":   {"id": "m5_net_w3_1",  "skill_type": "career",     "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 3 · Apply to 10 more companies (20 total)"},
    "m5_net_w3_2":   {"id": "m5_net_w3_2",  "skill_type": "networking", "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 3 · Send referral request messages to 3 connections"},
    "m5_net_w4_1":   {"id": "m5_net_w4_1",  "skill_type": "career",     "frequency": "once", "xp": 15, "month_number": 5, "title": "Wk 4 · Apply to 10 more companies (30+ total)"},
    "m5_net_w4_2":   {"id": "m5_net_w4_2",  "skill_type": "networking", "frequency": "once", "xp": 10, "month_number": 5, "title": "Wk 4 · Send referral request messages to 2 more connections"},

    # ── DDIA Reading ────────────────────────────────────────────────────────
    "m5_ddia_weekly": {"id": "m5_ddia_weekly", "skill_type": "system_design", "frequency": "weekly", "xp": 20, "month_number": 5, "title": "Read 1 DDIA section (sects 5–8 of 12)"},

    # ── Probability Bootcamp ────────────────────────────────────────────────
    "m5_prob_weekly": {"id": "m5_prob_weekly", "skill_type": "ml", "frequency": "weekly", "xp": 15, "month_number": 5, "title": "Watch 2 Brunton Probability Bootcamp videos (vids 33–40, final month)"},

    # ═══════════════════════════════════════════════════════════════════════════
    # ── Month 6 — Polish, Practice, Peak ──────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════════════

    # ── DSA — Maintain the Peak ────────────────────────────────────────────
    "m6_dsa_daily":  {"id": "m6_dsa_daily",  "skill_type": "dsa", "frequency": "daily",  "xp": 15, "month_number": 6, "title": "Solve 2-3 LeetCode problems (review and reinforce)"},
    "m6_dsa_weekly": {"id": "m6_dsa_weekly", "skill_type": "dsa", "frequency": "weekly", "xp": 50, "month_number": 6, "title": "LeetCode Weekly Contest every Sunday"},
    "m6_dsa_w1_1":   {"id": "m6_dsa_w1_1",  "skill_type": "dsa", "frequency": "once",   "xp": 15, "month_number": 6, "title": "Wk 1 · Review error log — categorize mistakes by pattern"},
    "m6_dsa_w1_2":   {"id": "m6_dsa_w1_2",  "skill_type": "dsa", "frequency": "once",   "xp": 15, "month_number": 6, "title": "Wk 1 · Redo the 10 hardest problems you previously got wrong"},
    "m6_dsa_w2_1":   {"id": "m6_dsa_w2_1",  "skill_type": "dsa", "frequency": "once",   "xp": 20, "month_number": 6, "title": "Wk 2 · Redo all remaining error log problems"},
    "m6_dsa_w3_1":   {"id": "m6_dsa_w3_1",  "skill_type": "dsa", "frequency": "once",   "xp": 25, "month_number": 6, "title": "Wk 3 · Complete a full LeetCode Virtual Contest (timed, 90 min)"},
    "m6_dsa_w4_1":   {"id": "m6_dsa_w4_1",  "skill_type": "dsa", "frequency": "once",   "xp": 25, "month_number": 6, "title": "Wk 4 · Complete a second LeetCode Virtual Contest (timed)"},

    # ── Interview Prep — Full Simulation ───────────────────────────────────
    "m6_mock_weekly": {"id": "m6_mock_weekly", "skill_type": "interviewing", "frequency": "weekly", "xp": 75, "month_number": 6, "title": "3 mock interviews this week (coding + behavioral)"},
    "m6_mock_w1_1":  {"id": "m6_mock_w1_1", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 1 · Record a mock interview on Zoom and watch it back"},
    "m6_mock_w1_2":  {"id": "m6_mock_w1_2", "skill_type": "interviewing", "frequency": "once", "xp": 5,  "month_number": 6, "title": "Wk 1 · Write down 3 things to improve from the recording"},
    "m6_mock_w2_1":  {"id": "m6_mock_w2_1", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 2 · Practice every session with a timer visible on screen"},
    "m6_mock_w3_1":  {"id": "m6_mock_w3_1", "skill_type": "interviewing", "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 3 · Do a mock explaining your thought process out loud the entire time"},

    # ── Project — Final Polish ─────────────────────────────────────────────
    "m6_proj_w1_1":  {"id": "m6_proj_w1_1", "skill_type": "project",       "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 1 · Remove dead code, unused imports, and commented-out blocks"},
    "m6_proj_w1_2":  {"id": "m6_proj_w1_2", "skill_type": "project",       "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 1 · Add clear comments to complex logic sections"},
    "m6_proj_w2_1":  {"id": "m6_proj_w2_1", "skill_type": "project",       "frequency": "once", "xp": 5,  "month_number": 6, "title": "Wk 2 · Write a script outline for your 2-minute demo video"},
    "m6_proj_w2_2":  {"id": "m6_proj_w2_2", "skill_type": "project",       "frequency": "once", "xp": 20, "month_number": 6, "title": "Wk 2 · Record and edit a 2-minute demo video of your project"},
    "m6_proj_w3_1":  {"id": "m6_proj_w3_1", "skill_type": "system_design", "frequency": "once", "xp": 25, "month_number": 6, "title": "Wk 3 · Prepare architecture explanation — what would you change at scale?"},
    "m6_proj_w3_2":  {"id": "m6_proj_w3_2", "skill_type": "system_design", "frequency": "once", "xp": 25, "month_number": 6, "title": "Wk 3 · Practice explaining your architecture to someone out loud"},

    # ── Final Push — Applications & Prep ───────────────────────────────────
    "m6_career_w1_1": {"id": "m6_career_w1_1", "skill_type": "career", "frequency": "once", "xp": 15, "month_number": 6, "title": "Wk 1 · Apply to 10 more companies (push toward 50+ total)"},
    "m6_career_w2_1": {"id": "m6_career_w2_1", "skill_type": "career", "frequency": "once", "xp": 15, "month_number": 6, "title": "Wk 2 · Apply to 10 more companies (50+ total)"},
    "m6_career_w2_2": {"id": "m6_career_w2_2", "skill_type": "career", "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 2 · Follow up on all pending applications via email"},
    "m6_career_w3_1": {"id": "m6_career_w3_1", "skill_type": "career", "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 3 · Research your top 5 interview target companies"},
    "m6_career_w3_2": {"id": "m6_career_w3_2", "skill_type": "career", "frequency": "once", "xp": 15, "month_number": 6, "title": "Wk 3 · Write company-specific notes for each of your top 5"},
    "m6_career_w4_1": {"id": "m6_career_w4_1", "skill_type": "career", "frequency": "once", "xp": 10, "month_number": 6, "title": "Wk 4 · Post demo video on LinkedIn with a brief write-up"},

    # ── DDIA Reading ────────────────────────────────────────────────────────
    "m6_ddia_weekly": {"id": "m6_ddia_weekly", "skill_type": "system_design", "frequency": "weekly", "xp": 20, "month_number": 6, "title": "Read 1 DDIA section (sects 9–12 of 12, final month)"},
}

# ── Checkpoints ───────────────────────────────────────────────────────────────
# Fields: id, skill_type, xp_reward, month_number, title

CHECKPOINTS: dict[str, dict] = {
    # Month 1
    "m1_cp_1": {"id": "m1_cp_1", "skill_type": "dsa",     "xp_reward":  100, "month_number": 1, "title": "Arrays, HashMaps, Two Pointers, Stacks complete"},
    "m1_cp_2": {"id": "m1_cp_2", "skill_type": "backend", "xp_reward":  100, "month_number": 1, "title": "FastAPI — build and run a REST API locally"},
    "m1_cp_3": {"id": "m1_cp_3", "skill_type": "backend", "xp_reward":  100, "month_number": 1, "title": "PostgreSQL — basic CRUD queries working"},
    "m1_cp_4": {"id": "m1_cp_4", "skill_type": "project", "xp_reward":  75, "month_number": 1, "title": "GitHub — 15+ commit days"},

    # Month 2
    "m2_cp_1": {"id": "m2_cp_1", "skill_type": "devops",  "xp_reward":  75, "month_number": 2, "title": "Docker — app containerized with docker-compose"},
    "m2_cp_2": {"id": "m2_cp_2", "skill_type": "devops",  "xp_reward":  50, "month_number": 2, "title": "Linux CLI — comfortable with basic commands"},
    "m2_cp_3": {"id": "m2_cp_3", "skill_type": "dsa",     "xp_reward":  100, "month_number": 2, "title": "Trees BFS/DFS — 10+ problems solved"},
    "m2_cp_4": {"id": "m2_cp_4", "skill_type": "ml",      "xp_reward":  150, "month_number": 2, "title": "Reproduced Generative Models via Drifting"},
    "m2_cp_6": {"id": "m2_cp_6", "skill_type": "dsa",     "xp_reward":  150, "month_number": 2, "title": "Neetcode 150 — 75+ problems total"},

    # Month 3
    "m3_cp_1": {"id": "m3_cp_1", "skill_type": "project", "xp_reward": 150, "month_number": 3, "title": "Project deployed — live URL accessible to anyone"},
    "m3_cp_2": {"id": "m3_cp_2", "skill_type": "cloud",   "xp_reward":  75, "month_number": 3, "title": "AWS EC2 + S3 — hands-on done"},
    "m3_cp_3": {"id": "m3_cp_3", "skill_type": "dsa",     "xp_reward":  100, "month_number": 3, "title": "Graph traversal — 15+ graph problems solved"},
    "m3_cp_4": {"id": "m3_cp_4", "skill_type": "ml",      "xp_reward": 100, "month_number": 3, "title": "HuggingFace — fine-tuned a transformer model"},
    "m3_cp_5": {"id": "m3_cp_5", "skill_type": "dsa",     "xp_reward":  75, "month_number": 3, "title": "LeetCode Weekly Contest — attempted 2+ contests"},
    "m3_cp_6": {"id": "m3_cp_6", "skill_type": "dsa",     "xp_reward":  100, "month_number": 3, "title": "Neetcode 150 — 120+ problems total"},

    # Month 4
    "m4_cp_1": {"id": "m4_cp_1", "skill_type": "dsa",           "xp_reward": 75, "month_number": 4, "title": "DP — 15+ problems solved (1D and 2D)"},
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
    1: ["m1_cp_1", "m1_cp_2", "m1_cp_3", "m1_cp_4"],
    2: ["m2_cp_1", "m2_cp_2", "m2_cp_3", "m2_cp_4", "m2_cp_6"],
    3: ["m3_cp_1", "m3_cp_2", "m3_cp_3", "m3_cp_4", "m3_cp_5", "m3_cp_6"],
    4: ["m4_cp_1", "m4_cp_2", "m4_cp_3", "m4_cp_4", "m4_cp_5", "m4_cp_6"],
    5: ["m5_cp_1", "m5_cp_2", "m5_cp_3", "m5_cp_4", "m5_cp_5", "m5_cp_6"],
    6: ["m6_cp_1", "m6_cp_2", "m6_cp_3", "m6_cp_4", "m6_cp_5", "m6_cp_6", "m6_cp_7"],
}

# ── Habits ────────────────────────────────────────────────────────────────────

HABITS: dict[str, dict] = {
    "habit_leetcode":  {"id": "habit_leetcode",  "skill_type": "dsa",          "xp_per_completion": 10, "title": "LeetCode problems",                       "starts_at_month": None},
    "habit_ml_project":   {"id": "habit_ml_project",   "skill_type": "ml","xp_per_completion": 5, "title": "Push at least 1 commit a day on ML project",   "starts_at_month": None},
    "habit_project":   {"id": "habit_project",   "skill_type": "project",      "xp_per_completion": 10, "title": "Work on personal portfolio",              "starts_at_month": 3},
    "habit_reading":   {"id": "habit_reading",   "skill_type": "system_design","xp_per_completion": 10, "title": "Read one tech article on Systems design", "starts_at_month": None},
    "habit_ml_paper":   {"id": "habit_ml_paper",   "skill_type": "ml","xp_per_completion": 10, "title": "Read at least 2 pages of ML paper",                            "starts_at_month": None},
    "habit_posting":   {"id": "habit_posting",   "skill_type": "project",      "xp_per_completion": 10, "title": "Post an Article on Personal Website",     "starts_at_month": 3},
    "habit_networking":{"id": "habit_networking","skill_type": "networking",   "xp_per_completion": 15, "title": "Network — LinkedIn DM or coffee chat",    "starts_at_month": 5},
    "habit_mock":      {"id": "habit_mock",      "skill_type": "interviewing", "xp_per_completion": 20, "title": "Mock interview",                          "starts_at_month": 5},
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


# ── Month metadata (subtitles) ───────────────────────────────────────────────

MONTH_SUBTITLES: dict[int, str] = {
    1: "Build the missing web/backend fundamentals. Start the DSA grind.",
    2: "Docker, cloud intro, and level up your ML depth with PyTorch.",
    3: "Deploy your project live. HuggingFace transformers. Graphs and DP.",
    4: "Intro system design, polish your project, build your resume.",
    5: "Simulate real interviews. Expand applications. Behavioral prep.",
    6: "Sharpen every edge. You are ready. Now perform.",
}


# ── Section groupings ────────────────────────────────────────────────────────
# Each section maps task IDs to a named group within a month.
# The MonthPage UI renders these as collapsible cards.

MONTH_SECTIONS: dict[int, list[dict]] = {
    1: [
        {"id": "m1_dsa", "title": "DSA — Daily Grind", "skill_type": "dsa", "task_ids": [
            "m1_dsa_daily",
            "m1_dsa_w1_1", "m1_dsa_w1_2",
            "m1_dsa_w2_1", "m1_dsa_w2_2",
            "m1_dsa_w3_1",
            "m1_dsa_w4_1",
        ]},
        {"id": "m1_backend", "title": "Tech Stack — FastAPI & PostgreSQL", "skill_type": "backend", "task_ids": [
            "m1_be_w1_1", "m1_be_w1_2",
            "m1_be_w2_1", "m1_be_w2_2",
            "m1_be_w3_1", "m1_be_w3_2",
            "m1_be_w4_1", "m1_be_w4_2", "m1_be_w4_3",
        ]},
        {"id": "m1_project", "title": "Project — Scaffold It", "skill_type": "project", "task_ids": [
            "m1_proj_w1_1", "m1_proj_w1_2",
            "m1_proj_w2_1",
            "m1_proj_w3_1",
            "m1_proj_w4_1",
        ]},
        {"id": "m1_ml", "title": "ML — Weekly Paper & Prob Bootcamp", "skill_type": "ml", "task_ids": [
            "m1_paper",
            "m1_prob_weekly",
        ]},
    ],
    2: [
        {"id": "m2_dsa", "title": "DSA — Ramp Up", "skill_type": "dsa", "task_ids": [
            "m2_dsa_daily",
            "m2_dsa_w1_1",
            "m2_dsa_w2_1",
            "m2_dsa_w3_1", "m2_dsa_w3_2",
            "m2_dsa_w4_1", "m2_dsa_w4_2",
        ]},
        {"id": "m2_devops", "title": "Tech Stack — Docker & Linux", "skill_type": "devops", "task_ids": [
            "m2_devops_w1_1", "m2_devops_w1_2",
            "m2_devops_w2_1", "m2_devops_w2_2",
            "m2_devops_w3_1",
            "m2_devops_w4_1",
        ]},
        {"id": "m2_ml", "title": "ML Depth — PyTorch", "skill_type": "ml", "task_ids": [
            "m2_ml_w1_1", "m2_ml_w1_2",
            "m2_ml_w2_1", "m2_ml_w2_2",
            "m2_ml_w3_1", "m2_ml_w3_2",
            "m2_ml_w4_1", "m2_ml_w4_2",
            "m2_prob_weekly",
        ]},
        {"id": "m2_project", "title": "Project — Add ML Endpoint", "skill_type": "project", "task_ids": [
            "m2_proj_w2_1", "m2_proj_w2_2",
            "m2_proj_w3_1", "m2_proj_w3_2",
            "m2_proj_w4_1", "m2_proj_w4_2",
        ]},
    ],
    3: [
        {"id": "m3_dsa", "title": "DSA — Go Hard", "skill_type": "dsa", "task_ids": [
            "m3_dsa_daily",
            "m3_dsa_w1_1", "m3_dsa_w1_2",
            "m3_dsa_w2_1", "m3_dsa_w2_2",
            "m3_dsa_w3_1", "m3_dsa_w3_2",
            "m3_dsa_w4_1", "m3_dsa_w4_2",
        ]},
        {"id": "m3_cloud", "title": "Tech Stack — AWS Cloud", "skill_type": "cloud", "task_ids": [
            "m3_cloud_w1_1", "m3_cloud_w1_2",
            "m3_cloud_w2_1", "m3_cloud_w2_2",
            "m3_cloud_w3_1", "m3_cloud_w3_2",
        ]},
        {"id": "m3_ml", "title": "ML Depth — HuggingFace & Transformers", "skill_type": "ml", "task_ids": [
            "m3_ml_w1_1", "m3_ml_w1_2",
            "m3_ml_w2_1", "m3_ml_w2_2",
            "m3_ml_w3_1", "m3_ml_w3_2",
            "m3_prob_weekly",
        ]},
        {"id": "m3_project", "title": "Project — Deploy It Live", "skill_type": "project", "task_ids": [
            "m3_proj_w3_1", "m3_proj_w3_2",
            "m3_proj_w4_1", "m3_proj_w4_2", "m3_proj_w4_3",
        ]},
    ],
    4: [
        {"id": "m4_dsa", "title": "DSA — Hard Push", "skill_type": "dsa", "task_ids": [
            "m4_dsa_daily",
            "m4_dsa_w1_1", "m4_dsa_w1_2",
            "m4_dsa_w2_1", "m4_dsa_w2_2",
            "m4_dsa_w3_1", "m4_dsa_w3_2",
            "m4_dsa_w4_1", "m4_dsa_w4_2",
        ]},
        {"id": "m4_sysdesign", "title": "System Design — Intro Level", "skill_type": "system_design", "task_ids": [
            "m4_sd_weekly",
            "m4_sd_w1_1",
            "m4_sd_w2_1",
            "m4_sd_w3_1",
            "m4_sd_w4_1", "m4_sd_w4_2",
            "m4_ddia_weekly",
        ]},
        {"id": "m4_prob", "title": "Probability Bootcamp — Brunton", "skill_type": "ml", "task_ids": [
            "m4_prob_weekly",
        ]},
        {"id": "m4_career", "title": "Career — Resume & Applications", "skill_type": "career", "task_ids": [
            "m4_career_w1_1", "m4_career_w1_2",
            "m4_career_w2_1", "m4_career_w2_2",
            "m4_career_w3_1", "m4_career_w3_2",
            "m4_career_w4_1", "m4_career_w4_2",
        ]},
        {"id": "m4_project", "title": "Project — Add Depth", "skill_type": "project", "task_ids": [
            "m4_proj_w1_1", "m4_proj_w1_2",
            "m4_proj_w2_1",
            "m4_proj_w3_1", "m4_proj_w3_2",
            "m4_proj_w4_1",
        ]},
    ],
    5: [
        {"id": "m5_dsa", "title": "DSA — Interview Simulation Mode", "skill_type": "dsa", "task_ids": [
            "m5_dsa_weekly",
            "m5_dsa_w1_1", "m5_dsa_w1_2",
            "m5_dsa_w2_1", "m5_dsa_w2_2",
            "m5_dsa_w3_1", "m5_dsa_w3_2",
            "m5_dsa_w4_1", "m5_dsa_w4_2",
        ]},
        {"id": "m5_interview", "title": "Mock Interviews", "skill_type": "interviewing", "task_ids": [
            "m5_mock_weekly",
            "m5_mock_w1_1", "m5_mock_w1_2",
            "m5_mock_w2_1", "m5_mock_w2_2",
            "m5_mock_w3_1", "m5_mock_w3_2",
            "m5_mock_w4_1", "m5_mock_w4_2",
        ]},
        {"id": "m5_behavioral", "title": "Behavioral Interview Prep", "skill_type": "interviewing", "task_ids": [
            "m5_beh_w1_1", "m5_beh_w1_2",
            "m5_beh_w2_1", "m5_beh_w2_2",
            "m5_beh_w3_1", "m5_beh_w3_2",
            "m5_beh_w4_1", "m5_beh_w4_2",
        ]},
        {"id": "m5_networking", "title": "Networking & Applications", "skill_type": "career", "task_ids": [
            "m5_net_w1_1", "m5_net_w1_2",
            "m5_net_w2_1", "m5_net_w2_2",
            "m5_net_w3_1", "m5_net_w3_2",
            "m5_net_w4_1", "m5_net_w4_2",
        ]},
        {"id": "m5_reading", "title": "Continuous Learning — DDIA & Prob Bootcamp", "skill_type": "system_design", "task_ids": [
            "m5_ddia_weekly",
            "m5_prob_weekly",
        ]},
    ],
    6: [
        {"id": "m6_dsa", "title": "DSA — Maintain the Peak", "skill_type": "dsa", "task_ids": [
            "m6_dsa_daily", "m6_dsa_weekly",
            "m6_dsa_w1_1", "m6_dsa_w1_2",
            "m6_dsa_w2_1",
            "m6_dsa_w3_1",
            "m6_dsa_w4_1",
        ]},
        {"id": "m6_interview", "title": "Interview Prep — Full Simulation", "skill_type": "interviewing", "task_ids": [
            "m6_mock_weekly",
            "m6_mock_w1_1", "m6_mock_w1_2",
            "m6_mock_w2_1",
            "m6_mock_w3_1",
        ]},
        {"id": "m6_project", "title": "Project — Final Polish", "skill_type": "project", "task_ids": [
            "m6_proj_w1_1", "m6_proj_w1_2",
            "m6_proj_w2_1", "m6_proj_w2_2",
            "m6_proj_w3_1", "m6_proj_w3_2",
        ]},
        {"id": "m6_career", "title": "Final Push — Applications & Prep", "skill_type": "career", "task_ids": [
            "m6_career_w1_1",
            "m6_career_w2_1", "m6_career_w2_2",
            "m6_career_w3_1", "m6_career_w3_2",
            "m6_career_w4_1",
        ]},
        {"id": "m6_ddia", "title": "DDIA — Final Chapters", "skill_type": "system_design", "task_ids": [
            "m6_ddia_weekly",
        ]},
    ],
}
