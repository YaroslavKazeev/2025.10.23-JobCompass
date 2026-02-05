# JobCompass

> Master navigating the sea of irrelevant jobs with **JobCompass**

JobCompass is an advanced job search platform that helps you find ideal positions with smart filtering capabilities, commute calculations, and personalized matching. Tell us your skills, role, and location, and we'll steer you to the right job with the least commute time.

The monorepo features a Vite/React Frontend and an Express/PostgreSQL backend, which also integrates Google Maps for transit times, RapidAPI (for LinkedIn jobs), Firebase Storage for avatars, and email-based password recovery.

## 🎯 Mission

Connect talented professionals with opportunities that match their skills, preferences, and career goals.

## ✨ Features

- **🔍 Smart Filtering and Sorting** - Filter by job type, work mode, and experience level, and sort listings based on what matters most to you
- **⚡ Smart Matching** - Search and browse open roles; surface skills detected in each description.
- **🗺️ Commute Calculator** - See travel time and number of transfers from your home to workplace
- **❤️ Save to Favorites** - Mark interesting job posts to easily view them later
- **✉️ Password Reset** - Recover account access via email with secure, short-lived tokens
- **👤 User Profiles** - Customize your profile with skills, address settings, and avatar uploads
- **👥 Guest Mode** - Try the platform without creating an account (with limited features)

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library

### Backend

- **Node.js** (>=24.0.0) - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** (Neon DB) - Database
- **Firebase Admin** - File storage and authentication
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Google Maps API** - Commute calculations

### DevOps & Tools

- **Husky** - Git hooks
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands
- **express-rate-limit** - API rate limiting
- **Jest** - Testing framework

## 📁 Project Structure

```
2025.10.23-JobCompass/
├── client/                     # React frontend application
│   ├── public/                 # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── Layout.jsx       # Main application layout
│   │   │   ├── AuthForms/      # Login/Signup forms
│   │   │   ├── ProtectedRoute.jsx # Authentication wrapper
│   │   │   ├── JobCard/        # Job listing card
│   │   │   ├── SearchInput/    # Job search input
│   │   │   └── [and more]      # UI components
│   │   ├── pages/              # Page-level components (9)
│   │   │   ├── jobSearch/      # Job search interface
│   │   │   ├── openPositions/  # Browse job listings
│   │   │   ├── Profile/        # User profile management
│   │   │   ├── MyFavorites/    # Saved jobs management
│   │   │   ├── About/          # About page
│   │   │   └── [4 more]        # LoginForm, SignupForm, ForgotPassword, ResetPassword
│   │   ├── context/            # React Context providers (2 items)
│   │   ├── hooks/              # Custom React hooks (3 items)
│   │   ├── util/               # Utility functions (12 items)
│   │   ├── reducers/           # State management (1 item)
│   │   ├── data/               # Static data files (1 item)
│   │   ├── assets/             # Static assets (5 items)
│   │   ├── App.jsx             # Main application component with routing
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Global styles
│   ├── .babelrc                # Babel configuration
│   ├── .eslintrc.js            # ESLint configuration
│   ├── .env.example            # Environment variables template
│   └── package.json            # Frontend dependencies
├── server/                     # Express backend application
│   ├── src/
│   │   ├── controllers/        # Route controllers (10)
│   │   │   ├── user.js         # User management logic
│   │   │   ├── jobData.js      # Job search and data processing
│   │   │   ├── travelController.js # Commute calculations
│   │   │   └── [6 more]        # changePassword, changeSkills, deleteUser, forgotPassword, resetPassword, toggleFavoriteJob
│   │   ├── routes/             # API route definitions (3 items)
│   │   │   ├── user.js         # User-related endpoints
│   │   │   ├── job.js          # Job search endpoints
│   │   │   └── travel.js       # Travel time endpoints
│   │   ├── services/           # Business logic services (7)
│   │   │   ├── persistJobSearch.js # Job data persistence
│   │   │   ├── linkedInScraperFetch.js # LinkedIn scraper integration
│   │   │   ├── rapidAPIfetch.js # RapidAPI client
│   │   │   ├── googleMapsApi.js # Google Maps integration
│   │   │   └── [3 more]        # fetchPersister, getCachedJobsBySearchString, ImageUpload
│   │   ├── middleware/         # Express middleware (2 items)
│   │   │   ├── authVerify.js   # JWT authentication
│   │   │   └── rateLimiter.js  # API rate limiting
│   │   ├── db/                 # Database configuration (1 item)
│   │   │   └── connectNeonDB.js # PostgreSQL connection
│   │   ├── config/             # Configuration files (1 item)
│   │   ├── util/               # Utility functions (10)
│   │   │   ├── logging.js      # Error and info logging
│   │   │   └── [9 more]        # cleanupInProgress, normalizeDescription, processRapidAPIjob, processScraperJob, validateAllowedFields, validateCreactUser, validateJob, validatePassword, validationErrorMessage
│   │   ├── app.js              # Express app configuration
│   │   └── index.js            # Server entry point with cron jobs
│   ├── .env.example            # Environment variables template
│   ├── .eslintrc.cjs           # ESLint configuration
│   ├── babel.config.cjs        # Babel configuration
│   └── package.json            # Backend dependencies
├── db_migrations/              # Database schema and migrations
│   └── create_tables.sql       # PostgreSQL table definitions
├── documentation/              # Project documentation
│   ├── ERD.md                  # Entity Relationship Diagram
│   ├── authentication/         # Authentication flow docs (11)
│   ├── jobFetch/               # Job fetching process docs (16)
│   └── devdata/                # Development data samples (3 JSON files)
├── .github/                   # GitHub workflows
│   └── workflows/             # CI/CD pipeline configurations
│       ├── client-code-style-check.yml
│       └── server-code-style-check.yml
├── .husky/                    # Git hooks configuration
│   └── pre-commit             # Pre-commit hooks
├── .gitignore                 # Git ignore rules
├── .prettierrc.json           # Prettier configuration
├── Procfile                   # Heroku deployment configuration
├── package.json               # Root package.json with workspace scripts
└── README.md                  # Project documentation
```

## Backend API Routes

### User Management (`/api/users`)

- `POST /api/users` – User registration (rate limited: 5 requests per 5 minutes)
- `POST /api/users/login` – User authentication (rate limited: 5 requests per 5 minutes)
- `POST /api/users/logout` – User logout (requires authentication)
- `GET /api/users/me` – Get current user profile (requires authentication)
- `PUT /api/users/profile` – Update user profile information (requires authentication)
- `POST /api/users/update-avatar` – Upload user avatar (requires authentication, 6MB limit, JPEG/PNG/GIF/WebP)
- `POST /api/users/change-password` – Change user password (requires authentication)
- `POST /api/users/change-skills` – Update user skills (requires authentication)
- `POST /api/users/favorites/toggle` – Add/remove job from favorites (requires authentication, job object in body)
- `DELETE /api/users/delete` – Delete user account (requires authentication)
- `POST /api/users/forgot-password` – Initiate password reset via email
- `POST /api/users/reset-password` – Complete password reset with token

### Job Management (`/api/jobs`)

- `POST /api/jobs/search` – Search jobs using LinkedIn RapidAPI integration (accessible to both authenticated and unauthenticated users; authenticated users get enhanced results with background LinkedIn scraper)

### Travel & Commute (`/api/travel`)

- `POST /api/travel/batch` – Calculate batch travel times and transfer counts for multiple job locations (no authentication required)

## Job Search Architecture

### Multi-Source Job Fetching

JobCompass integrates multiple job sources to provide comprehensive coverage:

#### RapidAPI LinkedIn Integration

- **Real-time Results**: Immediate job fetching from LinkedIn Job Search API
- **Rate Limits**: 100 results for authenticated users, 5 for guests
- **Location Support**: Configurable geographic filtering (default: Netherlands)
- **Data Processing**: Normalized job data with seniority level mapping

#### Apify LinkedIn Scraper

- **Background Processing**: Asynchronous execution for authenticated users only
- **Enhanced Data**: Company information, logos, and detailed descriptions
- **Polling System**: 30-second intervals with 10-minute timeout
- **Company Scraping**: Includes detailed company information

### Intelligent Caching System

- **Authentication-Aware**: Separate cache for authenticated vs guest users
- **Search String Tracking**: Records all search queries with timestamps
- **Automatic Cleanup**: Daily cron jobs remove old cache entries
- **Performance Optimization**: Reduces API calls and improves response times

### Search Processing Pipeline

1. **Input Validation**: Client-side validation with `validateJobInput()`
2. **Cache Check**: First attempts to find cached results for complete search
3. **Word-by-Word Processing**: Splits search string for broader coverage
4. **API Integration**: Fetches from multiple sources simultaneously
5. **Data Normalization**: Standardizes job data from different sources
6. **Deduplication**: Removes duplicate jobs across sources
7. **Persistence**: Stores results for future cache hits

### Data Processing & Normalization

#### Job Data Standardization

- **Seniority Mapping**: Normalizes Dutch/German seniority levels to English
- **Employment Types**: Standardizes employment type formatting
- **Location Processing**: Normalizes location display and work mode detection
- **Description Handling**: Text normalization for search optimization

#### Validation & Quality Control

- **Field Validation**: Ensures required fields are present and valid
- **Data Integrity**: Maintains consistency across different API sources
- **Error Handling**: Graceful degradation when API sources fail
- **Logging**: Comprehensive error tracking and monitoring

## Authentication & Security

- **JWT Tokens**: HTTP-only cookie-based authentication
- **Rate Limiting**: Authentication endpoints limited to 5 requests per 5 minutes
- **File Upload**: Avatar uploads limited to 6MB with image type validation
- **Password Security**: bcrypt hashing for password storage
- **Session Management**: Secure token-based authentication with expiration

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 24.0.0
- **npm** (comes with Node.js)
- **PostgreSQL** database (Neon DB recommended)
- **Firebase** Firebase service account (as JSON string)
- **SMTP credentials**
- **LinkedIn Job Search RapidAPI key**
- **Google Maps API** key for commute calculations

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YaroslavKazeev/2025.10.23-JobCompass.git
   cd 2025.10.23-JobCompass
   ```

2. **Install dependencies**

   ```bash
   npm run setup
   ```

   This will install dependencies for both client and server.

3. **Set up environment variables**

   In client and server directories, copy and rename the `.env.example` files into `.env`. Set all environmental variables.

4. **Run the development servers**

   ```bash
   npm run dev
   ```

   This will start both the client (Vite dev server) and server (Express with nodemon) concurrently.
   - Frontend: http://localhost:5173 (or the port Vite assigns)
   - Backend: http://localhost:3000 (or your configured PORT)

## 📝 Development Environment

### Recommended VS Code Extensions

For the best experience with this project's documentation and codebase, we recommend installing these VS Code extensions:

- **Markdown All in One** - Enhanced Markdown editing, preview, and syntax highlighting
- **Markdown Preview Mermaid Support** - Render Mermaid diagrams in Markdown preview
- **Mermaid Markdown Syntax Highlighting** - Syntax highlighting for Mermaid diagram code blocks
- **Mermaid Lens** - Interactive Mermaid diagram preview and editing

These extensions will provide full access to the documentation features, including the Entity Relationship Diagram and other visual elements.

## 📜 Available Root Level Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run start` - Start the production server
- `npm run build:client` - Build the client for production
- `npm run setup` - Install dependencies for both client and server

## 🚢 Deployment

The project is configured for a professional CI/CD pipeline using **GitHub Actions**, **Heroku**, and repository scripts.

### 🔄 CI/CD Pipeline

1.  **Continuous Integration (GitHub Actions)**: Every Pull Request triggers automated workflows:
    - `client-code-style-check`: Runs Prettier and Lint for the frontend.
    - `server-code-style-check`: Runs Prettier and Lint for the backend.
    - (Optional) Performance and unit tests are executed to ensure stability.
2.  **Automated Deployment (Heroku)**:
    - **Review Apps**: Every PR automatically creates a temporary, isolated environment on Heroku. A link is provided in the PR for manual testing and QA.
    - **Production**: Merging to `main` (or `develop`) triggers an automatic deployment to the main Heroku application.

### 🛠️ Build Scripts

The deployment relies on the following scripts in the root `package.json`:

- `heroku-postbuild`: Automatically runs during Heroku's build phase. It sets up dependencies and builds the client production bundle.
  ```bash
  npm run heroku-postbuild
  ```
- `start`: The production start command, as defined in the `Procfile`.
  ```bash
  npm start
  ```

### 🚀 Manual Deployment (Alternative)

If you need to deploy manually from your terminal:

1.  Logged into Heroku CLI: `heroku login`
2.  Add the Heroku remote (if not done): `heroku git:remote -a <your-app-name>`
3.  Push to Heroku:
    ```bash
    git push heroku main
    ```

## 👥 Contributors

This project was developed as part of HackYourFuture's final project by:

- **Yaroslav Kazeev** - HYF trainee - [GitHub](https://github.com/YaroslavKazeev) | [LinkedIn](https://www.linkedin.com/in/yaroslavkazeev/)
- **Hanna Dubyna** - HYF trainee - [GitHub](https://github.com/HannaInIT) | [LinkedIn](https://www.linkedin.com/in/hanna-dubyna/)
- **Yahya Al-Ademi** - HYF trainee - [GitHub](https://github.com/YahyaAl-Ademi) | [LinkedIn](https://www.linkedin.com/in/yahya-al-ademi-12786555/)
- **Stas Seldin** - DevOps, Education Director - [GitHub](https://github.com/stasel) | [LinkedIn](https://www.linkedin.com/in/stasel/)
- **Jana Gombitová** - Product Owner, Scrum Master - [GitHub](https://github.com/janagombitova) | [LinkedIn](https://www.linkedin.com/in/jana-gombitova-42b08394/)
- **Tim Lorent** - Tech Lead - [GitHub](https://github.com/tlorent) | [LinkedIn](https://www.linkedin.com/in/timlorent/)

## 📧 Contact

Have questions or feedback? We would love to hear from you!

Drop us a line at [jobcompass2025@gmail.com](mailto:jobcompass2025@gmail.com?subject=Question about JobCompass) and we will get back to you as soon as possible!

## 📄 License

ISC

## 🙏 Acknowledgments

- Based on [c53-final-project-group-A](https://github.com/HackYourFutureProjects/c53-final-project-group-A), which was a part of the [HackYourFuture](https://www.hackyourfuture.net/) curriculum
- Special thanks to all mentors and contributors who made this project possible
