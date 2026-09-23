# AI StoryWizard

**Official Academic Title:**  
*Design and Development of a Multi-Agent LLM-Based Personalized Educational Storytelling Platform for Children*

## 📌 Project Overview
AI StoryWizard is an intelligent, personalized educational storytelling platform designed for children aged 8–12. Built as a Final Year Engineering Project, the platform utilizes a Multi-Agent LLM architecture (LangGraph) to generate age-appropriate, curriculum-aligned educational narratives featuring dynamic interactive quizzes, vocabulary aids, and parental supervision controls.

## 🛠️ System Architecture & Technology Stack
- **Frontend:** React.js, Vite, Tailwind CSS v4, React Router DOM, Axios
- **Backend:** FastAPI, Python, Pydantic, JWT Authentication
- **Database:** MongoDB / Motor
- **AI Engine:** Multi-Agent Architecture (LangGraph, Groq API)
  - Narrative Architect Agent
  - Educational Alignment Agent
  - Safety Guardian Agent

## 📁 Repository Structure
```text
AI-StoryWizard/
├── frontend/   # React + Vite + Tailwind CSS Application
├── backend/    # FastAPI REST API & Database Layer
├── ai/         # LangGraph Multi-Agent Orchestration Engine
└── docs/       # Project Documentation & Architecture Diagrams
