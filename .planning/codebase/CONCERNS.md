# Codebase Concerns & Risks

## High Priority (Security)
- **Hardcoded Secret**: `ID_SALT` and potential JWT secrets are embedded in configuration files. Should be moved to environment variables.
- **Incomplete Authorization**: Ensure *all* backend endpoints implement token verification (some legacy files might be unprotected).

## Technical Debt
- **ID Ambiguity**: Mixing legacy numeric IDs with new UIDs in the same system can cause logic bugs if not handled by "Smart Decoding" everywhere.
- **Manual State Sync**: Relying on the Frontend to manually update its context based on API responses is error-prone. Consider a more robust state synchronization pattern.
- **Lack of Validation**: Input validation on the backend is focused on basic types; should be hardened against malicious payloads.

## Potential Hazards
- **Date Parsing**: JS `new Date()` can behave inconsistently across browsers (Safari vs Chrome) if MySQL strings aren't normalized to ISO-8601 (`T` separator).
- **Concurrency**: Multiple simultaneous profile updates might lead to race conditions in the `user_name_history` table if not properly transactional.
- **File Rác**: If physical file deletion (`unlink`) fails during update, legacy avatar/cover images will persist and consume disk space.
