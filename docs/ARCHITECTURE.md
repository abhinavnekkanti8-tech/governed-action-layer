# Architecture: Governed Action Layer for Agentic AI

## Overview

This project implements a governed action layer separating workflow definition (Control Plane) from execution (Execution Plane) and agent access (Agent Gateway).

## Service Decomposition

### Service 1: Control Plane API
**Responsibilities**:
- Workflow CRUD (Draft/Published)
- Skill Registry (Publishing workflows as skills)
- Tenant & RBAC Management
- Folder/Tower structure & SOP Documents

**Storage**:
- PostgreSQL: Workflows, Skills, Folders, RBAC, Doc Metadata.

### Service 2: Execution Plane API
**Responsibilities**:
- Skill Invocation (REST) & Input Validation
- Workflow Execution (via Temporal)
- Approval Management (Wait states)
- Audit Logging & Redaction
- Run Tracing

**Storage**:
- PostgreSQL: Runs, Step Traces, Approvals, Audit Events.
- Temporal: Durable workflow state.

### Service 3: Agent Gateway (MCP Server)
**Responsibilities**:
- Expose Skills as MCP Tools
- Authenticate Agent Pilots
- Forward invocations to Execution Plane
- Ensure `invoker_type=agent` in audits

## Shared Infrastructure

- **Workflow Engine**: Temporal (Durable execution, retries, approval wait signals).
- **Database**: PostgreSQL (Relational data for both planes).
- **Object Storage**: S3/GCS compatible (SOP documents).
- **Observability**: OpenTelemetry.

## MVP Workflow Semantics

- **Sequential Execution**: Step A -> Step B -> Step C.
- **Branching**: Simple `if/else` based on step output.
- **Approvals**: Explicit "Human-in-the-loop" step. Workflow suspends until approved/rejected.
- **Retries**: Configurable policies per step.
- **AI Steps**:
    - **Summarisation**: LLM summarises context.
    - **Decision**: LLM returns structured JSON for branching.

## Audit & Redaction

- **Append-Only**: Audit events are immutable.
- **Redaction-First**: Sensitive data (secrets, PII) is redacted *before* persistence.
- **Traceability**: Every run links to an Invoker, a Skill Version, and a full Step Trace.
