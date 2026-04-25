# Coding Conventions

## Backend (PHP)
- **File Naming**: Snake_case (e.g., `update_profile.php`).
- **Response Format**: Always JSON with `status` (success/error) and `data`/`message`.
- **Error Handling**: Uses `http_response_code()` and `exit()`.
- **Database**: PDO with prepared statements.
- **SQL Styling**: Uppercase keywords (`SELECT`, `INSERT`), lowercase table/column names.

## Frontend (React)
- **Component Naming**: PascalCase (e.g., `UserProfile.jsx`, `EditProfileModal.jsx`).
- **Styling**: Atomic Tailwind CSS classes. Prefers inline utility classes for rapid development.
- **State Management**: Functional components with `useState` and `useEffect`.
- **Props**: Destructured in the function signature.
- **File Extensions**: `.jsx` for all React components.

## General
- **ID Handling**: Use encoded `uid` for URL parameters; decode to numeric `id` before database queries.
- **Variable Naming**: 
    - JS: CamelCase for variables/functions.
    - PHP: Snake_case for variables/functions.
- **CSS Hierarchy**: Managed via Tailwind. Avoid nesting vanilla CSS unless in global `index.css`.
