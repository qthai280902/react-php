# Technology Stack

## Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios
- **State Management**: React Context API (`AuthContext`)
- **Toasts**: react-hot-toast
- **Routing**: react-router-dom

## Backend
- **Language**: PHP 8.x
- **Database Access**: PDO (PHP Data Objects)
- **Authentication**: JWT (JSON Web Tokens - Custom implementation with token_helper.php)
- **Security**: ID Hashing (id_helper.php)
- **CORS**: Custom middleware (cors.php)

## Database
- **Engine**: MySQL / MariaDB
- **Key Tables**: `users`, `posts`, `reposts`, `follows`, `likes`, `user_name_history`.

## Infrastructure
- **Server**: Local PHP Server (Port 8000)
- **Client**: Vite Dev Server (Port 5173)
- **Uploads**: Local filesystem (`be_php/uploads`)
