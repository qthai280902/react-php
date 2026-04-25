# Integrations and Communication

## Internal Communication
- **API Pattern**: REST-ish API endpoints in PHP returning JSON.
- **Client Communication**: Axios with a centralized `axiosClient.js` using a base URL and interceptors for Authorization headers.

## Authentication System
- **Provider**: Internal PHP logic.
- **Mechanism**: JWT-based. Tokens are issued at login and verified in protected PHP endpoints via `token_helper.php`.
- **Storage**: Tokens are typically managed in the Frontend's `AuthContext` and persisted in `localStorage`.

## File Storage
- **Mechanism**: Direct local filesystem storage.
- **Paths**: `be_php/uploads/`.
- **Retrieval**: Frontend constructs absolute URLs pointing to the backend's upload directory.

## Database Integration
- **Engine**: MySQL.
- **Interaction**: PDO with prepared statements for SQL Injection prevention.
- **ID Security**: Numeric IDs are obfuscated using `id_helper.php` (Salted Hashing) before being exposed in public-facing URLs (UIDs).

## Data Synchronization
- **Profile Updates**: Multi-dimensional sync. API returns full updated user objects to allow the Frontend to update global states immediately.
