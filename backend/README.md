# AI StoryWizard - FastAPI Backend

Production-grade educational storytelling backend built with **FastAPI**, **Pydantic v2**, and **Google Gemini 2.5 Flash**.

## 🚀 Key Architectural Features
- **Strict Role-Based Authentication**: Separate PIN auth for young learners vs. credential-based authentication for parents/supervisors.
- **Topic Exploration Engine**: Transforms freeform student queries into CCSS-calibrated branching stories, Tier-2 academic vocabulary drawers, and comprehension quizzes.
- **Age-Mismatch Notification Pipeline**: Detects topics exceeding configured target grade ceilings (e.g., student querying Quantum Mechanics when capped at Grade 3-4) and flags real-time alerts to parent dashboards.
- **Parental Controls**: Enforces maximum daily reading time caps, grade ceilings, and AI creativity/temperature bounds.
- **CORS Configured**: Ready to interact with React development environments on `http://localhost:3000` and `http://localhost:5173`.

## 📦 Directory Layout
```
backend/
├── app/
│   ├── core/
│   │   ├── config.py       # BaseSettings & Environment variables
│   │   └── security.py     # JWT token generation & verification
│   ├── models/
│   │   ├── auth.py         # Login & Role permissions Pydantic schemas
│   │   ├── story.py        # Story generation & CCSS Quiz schemas
│   │   └── parent.py       # Child progress, analytics & controls schemas
│   ├── routers/
│   │   ├── auth.py         # POST /api/v1/auth/login
│   │   ├── stories.py      # POST /api/v1/stories/explore-topic
│   │   └── parent.py       # GET child-progress & PUT controls
│   ├── services/
│   │   ├── safety_filter.py # Age mismatch detection & content filters
│   │   └── story_engine.py  # Gemini 2.5 Flash story generation
│   └── main.py             # FastAPI entrypoint with CORS
└── requirements.txt
```

## 🛠️ Quickstart

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Launch server with hot reload:
```bash
uvicorn app.main:app --reload --port 8000
```

4. Interactive Swagger documentation available at:
`http://localhost:8000/api/v1/docs`
