# AGENTS.MD - Omake (Expense Tracker Architect & Full-Stack Developer)

## 1. Project Profile
- **Name:** Omake
- **Focus:** Modern Expense Tracker focused on weekly/monthly graphical analysis.
- **Core Principle:** Decoupled Architecture (Monorepo), Simple & Didactic Frontend, Robust Secure Backend.

## 2. Mandatory Tech Stack
- **Backend:** Java + Spring Boot + Maven.
- **Database:** PostgreSQL.
- **Security:** Spring Security with JWT (JSON Web Tokens) from Day 1.
- **Frontend:** React + Vite.
- **Styling:** Tailwind CSS.
- **Frontend State & HTTP:** React Context API (State Management) & Axios (HTTP Requests).
- **Charts:** Recharts (for dynamic data visualization).

## 3. Architecture & Coding Standards
- **Pattern:** - Backend: Standard 3-Layer Architecture (`Controller` -> `Service` -> `Repository`).
  - Frontend: Component-based architecture.
- **Language Requirements:** - 100% **English** (UI labels, variables, methods, documentation, commits).
  - Frontend UI components should be designed with future i18n (internationalization) in mind.
- **Directory Structure:** Strict separation between `/backend` and `/frontend` folders in the root directory.
- **API Contract:** The file `/docs/api-spec.md` is the Single Source of Truth for all communication between front and back.

## 4. Agent Behavior & Constraints
- **API-First Rule:** The agent MUST update and verify the `/docs/api-spec.md` file before generating or modifying any Backend Endpoint or Frontend Service.
- **Strict Tailwind:** Creating custom `.css` files is strictly PROHIBITED unless absolutely unavoidable. All styling must be done using Tailwind utility classes.
- **Console Security:** NEVER use `console.log` or backend loggers to print sensitive data, passwords, PII, or JWT tokens.
- **CORS & Environment:** - Backend must be configured to accept CORS from the Frontend local/production URLs.
  - Database credentials and secrets must ALWAYS use environment variables (`application.properties` / `.env`), never hardcoded.

## 5. Data Model Definition (Initial Schema)
- `User`: {UUID id, String email, String passwordHash, String role}
- `Category`: {Long id, String name, String colorHex, String iconName}
- `Expense`: {Long id, BigDecimal amount, LocalDate date, String description, Category category, User user}

## 6. Error & Conflict Protocol
- If a dependency conflict arises in Maven (`pom.xml`) or NPM (`package.json`), stop immediately and alert the user with a proposed fix before proceeding.diately and alert the Antigravity Manager View.

## 7. Available Custom Skills
The following custom skills are available in the `/.skills` directory. The agent must refer to them when executing related tasks:

- **Backend:** `java-pro`, `postgresql`, `backend-security-coder`
- **Frontend:** `stitch-ui-design`, `design-md`
- **Global:** `debugging-strategies`, `enhance-prompt`, `readme`, `docker-expert`, `github`