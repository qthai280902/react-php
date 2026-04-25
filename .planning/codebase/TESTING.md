# Testing Strategy

## Current State
- **Automated Tests**: Limited to manual browser-based verification during development.
- **Unit Testing**: Not yet implemented for either PHP or React.

## Recommended Approaches
- **Backend**: Implement PHPUnit for testing API endpoints and ID obfuscation logic.
- **Frontend**: Implement Vitest or Jest for testing React component rendering and Context logic.
- **E2E**: Use Playwright or Cypress for testing critical flows like Login -> Edit Profile -> Logout.

## Critical Test Areas
- **ID Security**: Verify that non-numeric IDs are correctly rejected or decoded by `id_helper.php`.
- **Authorization**: Verify that token-protected endpoints return 401 when the token is missing or expired.
- **Data Integrity**: Verify that updating a profile correctly updates the `user_name_history` table and respects the 7-day cooldown.
- **UI Responsiveness**: Verify that the Live Timer accurately decrements and locks the UI on different browsers.
