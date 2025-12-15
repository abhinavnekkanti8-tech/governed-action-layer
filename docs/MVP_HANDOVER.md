# MVP Handover Pack

## 1. Domain Model

- **Tenant**: Isolation boundary.
- **Principal**: User, App, or Agent.
- **RoleAssignment**: Maps Principal -> Role.
- **Folder**: Organizational unit for Workflows and SOPs.
- **Document**: SOP/Policy attachment.
- **Workflow**: The definition graph (Draft/Published).
- **Skill**: A published, versioned workflow ready for invocation.
- **SkillVersion**: Immutable snapshot of input/output schema & risk profile.
- **Run**: An instance of a Skill execution.
- **StepTrace**: Result of a single step within a Run.
- **Approval**: A pending human decision.
- **AuditEvent**: Immutable log entry.

## 2. RBAC Permissions (MVP)

| Action | Admin | Builder | Operator | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| Tenant Settings | ✅ | | | |
| Create/Edit Workflows | ✅ | ✅ | | |
| Publish Skills | ✅ | ✅ | | |
| Invoke Skills | ✅ | ✅ | ✅ | |
| View Runs/Audit | ✅ | ✅ | ✅ | ✅ |
| Approve/Reject | ✅ | | ✅ | |

## 3. Skill Contract (MVP)

A published Skill must have:
- `skill_id`: Unique identifier.
- `version`: SemVer string.
- `input_schema`: JSON Schema for input validation.
- `output_schema`: JSON Schema for response.
- `risk_tags`: e.g., `["write", "requires_approval"]`.

## 4. API Surface

### Control Plane
- `POST /workflows` (Create Draft)
- `POST /workflows/:id/publish` (Publish to Skill)
- `GET /skills` (Registry)
- `POST /folders` & `POST /documents`

### Execution Plane
- `POST /skills/:id/invoke` (Start Run)
- `GET /runs/:id` & `GET /runs/:id/trace`
- `GET /approvals` & `POST /approvals/:id/decision`

### Agent Gateway (MCP)
- `listTools()` -> Returns Skills.
- `callTool(skill_id)` -> Proxies to Execution Plane Invoke.

## Milestone 1: Acceptance Criteria

1. **Builder UI**: Create workflow (AI Summarise -> Approval -> HTTP) and Publish.
2. **Registry**: Skill appears with correct schemas.
3. **Execution**: REST invoke triggers run; pauses at Approval.
4. **Approval**: Operator approves; workflow resumes; HTTP step fires.
5. **Audit**: Trace shows inputs, approval decision, and final status (Redacted).
