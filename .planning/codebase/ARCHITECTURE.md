# Architecture Overview

## Design Patterns
- **Monolithic API**: A single PHP backend codebase managing all domain logic.
- **Single Page Application (SPA)**: React frontend managing state and routing client-side.
- **Provider Pattern**: React Context API used for global `AuthContext` to avoid prop drilling.
- **Composition over Inheritance**: React components are composed for modularity.

## Data Flow
1. **Request**: UI Component triggers an action (e.g., Follow).
2. **API Call**: Handled by Axios. Authorization bearer token attached if required.
3. **Backend Logic**: PHP logic decodes UIDs, validates tokens, and executes SQL transactions.
4. **Response**: Backend returns JSON status and data (e.g., new follower count).
5. **State Update**: Frontend updates local state/context based on API response to ensure UI reactivity.

## Security Layers
- **Token Shield**: JWT verification on sensitive API endpoints.
- **UID Hardening**: Obfuscation of database IDs in URLs to prevent resource enumeration.
- **ID Resolution**: "Smart Decoding" on the backend to handle both legacy numeric IDs and new UIDs safely.
- **Business Logic Guards**: Server-side cooldown checks for name changes (7-day rule).

## Frontend Organization
- **Pages**: Top-level route components.
- **Components**: Reusable UI blocks and Modals.
- **Context**: Global state and auth logic.
- **Hooks**: Shared utility logic (if any).
