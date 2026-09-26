import logging
from typing import TypedDict, List, Dict, Any, Optional, Callable
from ai.agents.narrative_architect import NarrativeArchitectAgent
from ai.agents.educational_alignment import EducationalAlignmentAgent
from ai.agents.safety_guardian import SafetyGuardianAgent

logger = logging.getLogger("ai_storywizard.ai.workflow")

# ==============================================================================
# 1. Shared LangGraph State Schema
# ==============================================================================
class StoryState(TypedDict, total=False):
    """
    Typed shared state for the multi-agent story generation workflow.
    Adheres to LangGraph StateGraph schema standards.
    Contains no secrets or sensitive credentials.
    """
    user_id: str
    age_or_grade_band: str
    topic: str
    interests: List[str]
    learning_objective: str
    story_requirements: Dict[str, Any]
    draft_story: Optional[Dict[str, Any]]
    educational_validation: Optional[Dict[str, Any]]
    safety_validation: Optional[Dict[str, Any]]
    final_story: Optional[Dict[str, Any]]
    status: str
    errors: List[str]
    metadata: Dict[str, Any]

# ==============================================================================
# 2. Node Implementations
# ==============================================================================
async def narrative_architect_node(state: StoryState) -> Dict[str, Any]:
    """Node 1: Draft initial structured educational narrative."""
    agent = NarrativeArchitectAgent()
    return await agent.execute(state)

async def educational_alignment_node(state: StoryState) -> Dict[str, Any]:
    """Node 2: Evaluate pedagogical fidelity, curriculum concepts, and CCSS level."""
    agent = EducationalAlignmentAgent()
    return await agent.execute(state)

async def safety_guardian_node(state: StoryState) -> Dict[str, Any]:
    """Node 3: Rigorous child-protection, age-rating, and content safety audit."""
    agent = SafetyGuardianAgent()
    return await agent.execute(state)

async def final_validation_node(state: StoryState) -> Dict[str, Any]:
    """
    Node 4: Synthesize validation outcomes and produce final verified result.
    Evaluates safety and pedagogical assessments before releasing narrative.
    """
    draft = state.get("draft_story")
    edu_val = state.get("educational_validation") or {}
    safety_val = state.get("safety_validation") or {}
    current_errors = list(state.get("errors", []))

    is_safe = safety_val.get("is_safe", False)
    is_aligned = edu_val.get("is_aligned", False)

    if not is_safe:
        reason = safety_val.get("reason", "Content failed safety guardrails.")
        logger.warning("Story generation blocked by Safety Guardian: %s", reason)
        return {
            "final_story": None,
            "status": "rejected_safety",
            "errors": current_errors + [f"Safety Guardian rejection: {reason}"],
        }

    if not is_aligned:
        summary = edu_val.get("educational_summary", "Pedagogical alignment requirements not satisfied.")
        logger.warning("Story flagged for educational deficiencies: %s", summary)
        return {
            "final_story": draft,
            "status": "needs_educational_revision",
            "errors": current_errors + [f"Educational Alignment advisory: {summary}"],
        }

    logger.info("Story '%s' passed all Multi-Agent verification gates.", draft.get("title") if draft else "Untitled")
    return {
        "final_story": draft,
        "status": "completed",
        "errors": current_errors,
    }

# ==============================================================================
# 3. Deterministic Graph Engine (Standard Library Compliant Fallback)
# ==============================================================================
class DeterministicCompiledWorkflow:
    """
    Deterministic executable workflow matching the LangGraph compiled graph interface.
    Ensures 100% testability and reliability in environments where external compiled
    c-extensions or network packages are optional.
    """
    def __init__(self, nodes: Dict[str, Callable], edges: List[tuple]):
        self.nodes = nodes
        self.edges = edges

    async def ainvoke(self, initial_state: StoryState) -> StoryState:
        state = dict(initial_state)
        # Sequence: START -> narrative_architect -> educational_alignment -> safety_guardian -> final_validation -> END
        execution_order = [
            "narrative_architect",
            "educational_alignment",
            "safety_guardian",
            "final_validation"
        ]

        for node_name in execution_order:
            if node_name in self.nodes:
                func = self.nodes[node_name]
                import inspect
                if inspect.iscoroutinefunction(func):
                    update = await func(state)
                else:
                    update = func(state)
                if isinstance(update, dict):
                    state.update(update)

        return state

    def invoke(self, initial_state: StoryState) -> StoryState:
        import asyncio
        return asyncio.run(self.ainvoke(initial_state))

# ==============================================================================
# 4. Workflow Builder
# ==============================================================================
def create_story_workflow(custom_llm: Optional[Any] = None) -> Any:
    """
    Constructs the LangGraph story generation workflow:
    START -> Narrative Architect -> Educational Alignment -> Safety Guardian -> Final Validation -> END.
    Uses official LangGraph StateGraph if available, or DeterministicCompiledWorkflow.
    """
    try:
        from langgraph.graph import StateGraph, START, END

        builder = StateGraph(StoryState)
        builder.add_node("narrative_architect", narrative_architect_node)
        builder.add_node("educational_alignment", educational_alignment_node)
        builder.add_node("safety_guardian", safety_guardian_node)
        builder.add_node("final_validation", final_validation_node)

        builder.add_edge(START, "narrative_architect")
        builder.add_edge("narrative_architect", "educational_alignment")
        builder.add_edge("educational_alignment", "safety_guardian")
        builder.add_edge("safety_guardian", "final_validation")
        builder.add_edge("final_validation", END)

        logger.info("Successfully compiled story workflow with native langgraph.graph.StateGraph")
        return builder.compile()
    except (ImportError, Exception) as exc:
        logger.info("Using standard deterministic workflow engine (notice: %s)", exc)
        return DeterministicCompiledWorkflow(
            nodes={
                "narrative_architect": narrative_architect_node,
                "educational_alignment": educational_alignment_node,
                "safety_guardian": safety_guardian_node,
                "final_validation": final_validation_node,
            },
            edges=[
                ("START", "narrative_architect"),
                ("narrative_architect", "educational_alignment"),
                ("educational_alignment", "safety_guardian"),
                ("safety_guardian", "final_validation"),
                ("final_validation", "END"),
            ]
        )

# Compiled singleton story workflow for runtime reuse
compiled_story_workflow = create_story_workflow()
