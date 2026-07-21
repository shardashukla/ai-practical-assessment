# Tool Workflow

## Selected Tool: Cursor IDE

This project was built using **Cursor** as the AI-assisted development environment. See `ai-prompts/tool-specific/cursor-workflow/` for detailed Cursor-specific artifacts.

## Workflow Phases

### 1. Planning
- Used AI to analyze the assessment brief and produce structured requirements
- Generated `requirements-analysis.md`, `acceptance-criteria.md`, and `implementation-plan.md`
- Defined data model and API contract before writing code

### 2. Design
- AI-assisted UI flow mapping and component breakdown
- Design decisions documented in `design-notes.md` and `ui-flow.md`
- Chose a card-based dashboard with filterable task list

### 3. Implementation
- Backend-first approach: schema → API → frontend
- Iterative prompting for each layer (database, routes, React components)
- AI generated boilerplate; human reviewed for correctness and conventions

### 4. Testing
- AI-assisted test generation for API endpoints and React components
- Manual verification of UI states (loading, empty, error, success)
- Test results captured in `test-results.md`

### 5. Code Review
- Self-review with AI assistance documented in `code-review-notes.md`
- Fixes applied and recorded in `review-fixes.md`

### 6. Documentation
- AI helped draft assessment deliverables from the implemented codebase
- Prompt history preserved in `ai-prompts/` folder

## AI Usage Principles

1. **Plan before code** — Requirements and API contract defined first
2. **Small iterations** — Build one feature at a time, verify, then continue
3. **Human review** — All AI-generated code reviewed for logic, security, and style
4. **Document prompts** — Key prompts saved in `ai-prompts/` for reproducibility

## Tool-Specific Folder

Only the Cursor workflow folder is populated:
- `ai-prompts/tool-specific/cursor-workflow/`
