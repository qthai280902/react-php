# Project Structure

```text
revphp/
├── .planning/                  # Project Management & Codebase Map
│   └── codebase/               # [CURRENT] Structure, Stack, Arch docs
├── be_php/                     # PHP Backend
│   ├── api/                    # API Endpoints
│   │   ├── auth/               # Login, Register, Token Helpers
│   │   ├── posts/              # Post manipulation
│   │   └── users/              # Profiles, Follows, History
│   ├── config/                 # Database, CORS, ID Helpers
│   ├── uploads/                # User uploaded images
│   └── index.php               # Entry point (if used)
└── fe_react/                   # React Frontend (Vite)
    ├── public/                 # Static assets
    └── src/
        ├── api/                # Axios Client setup
        ├── components/         # Modals, Navbar, UI Fragments
        ├── context/            # AuthContext
        ├── pages/              # UserProfile, CreatePost, Login
        ├── App.jsx             # Route definitions
        └── main.jsx            # React root
```

## Relevant Subsystems
- **Authorization**: `be_php/api/auth/token_helper.php` <-> `fe_react/src/context/AuthContext.jsx`.
- **Profile Management**: `be_php/api/users/update_profile.php` <-> `fe_react/src/components/EditProfileModal.jsx`.
- **ID Obfuscation**: `be_php/config/id_helper.php` (The "Source of Truth" for ID Salt).
