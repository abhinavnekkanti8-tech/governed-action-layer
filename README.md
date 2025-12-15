# Google Anti-Gravity (Governed Action Layer)

A production "action layer" that turns Agentic AI pilots into governed, integrated, auditable workflows.

## Services

- **Control Plane API** (`services/control-plane`): Workflow management, skill registry, RBAC.
- **Execution Plane API** (`services/execution-plane`): Workflow execution, approval management, audit logs.
- **Agent Gateway** (`services/agent-gateway`): MCP server exposing skills as tools to agents.
- **Builder UI** (`web/builder-ui`): React-based UI for creating workflows and managing operations.

## shared Packages

- **Shared** (`packages/shared`): Common types, schemas, and contracts.

## Local Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start infrastructure:
   ```bash
   cd infra
   docker-compose up -d
   ```

3. Run migrations (TBD):
   ```bash
   pnpm db:migrate
   ```

4. Start services:
   ```bash
   pnpm dev
   ```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.
