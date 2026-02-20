*This project has been created as part of the 42 curriculum by [login1], [login2], [login3].*

# ft_transcendence: Surprise

## 📝 Description

**ft_transcendence** is a full-stack, real-time multiplayer game platform focused on providing an engaging digital ping-pong experience. The platform allows users to play live matches, chat with other players, track their statistics, and manage their profiles in a robust microservices-based architecture. 

**Key Features:**
- Live multiplayer Pong game
- Real-time chat system with channels and direct messaging
- Secure user authentication and profile management (OAuth, 2FA)
- Player statistics, leaderboards, and match history
- Fully-fledged microservices architecture with a modern, responsive web interface

## 🛠 Instructions

### Prerequisites
- **Docker** and **Docker Compose**
- **Node.js** (v22+) for local development (optional, as Docker handles the environment)
- A configured `.env` file at the root. You can copy the provided example:
  ```bash
  cp .env.example .env
  ```
- Make sure to fill in any required API keys or secrets in the `.env` file (e.g., 42 Intranet OAuth credentials).

### Setup and Execution

1. **Clone the repository:**
   ```bash
   git clone <repository_url> ft_transcendence
   cd ft_transcendence
   ```

2. **Start the project using Docker (Production-like environment):**
   ```bash
   make up
   # Or directly via docker-compose
   docker-compose up --build -d
   ```

3. **Development Mode:**
   To run the project with hot-reloading for development:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Accessing the Services:**
   - **Frontend App:** `http://localhost:3010` (or as configured in `.env`)
   - **Backend API Gateway / NGINX:** `http://localhost:8080`
   - **Monitoring (Grafana):** `http://localhost:3000`

5. **Stopping the project:**
   ```bash
   make down
   # Or directly
   docker-compose down
   ```

## 📚 Resources

- **Classic References:**
  - [Next.js Documentation](https://nextjs.org/docs)
  - [Fastify Documentation](https://fastify.dev/docs/latest/)
  - [Prisma Documentation](https://www.prisma.io/docs/)
  - [Docker Documentation](https://docs.docker.com/)

- **AI Usage:**
  - AI tools (e.g., ChatGPT, GitHub Copilot) were used to assist in discovering Fastify configurations, writing repetitive boilerplate code (like Swagger schema definitions), generating initial unit test templates, and troubleshooting Docker networking setups. AI was not used to generate the core game logic or the microservices architecture design.

---

## 👥 Team Information

| Team Member | Assigned Role(s) | Responsibilities |
| ----------- | ---------------- | ---------------- |
| **[login1]** | Tech Lead / Developer | Overseeing microservices architecture, implementing Auth & User services. |
| **[login2]** | PO / Fullstack Developer | Implementing the Game engine, frontend integration, and managing project milestones. |
| **[login3]** | PM / Developer | Developing the Chat service, handling DevOps (Docker, Prometheus), and managing tasks. |

## 📅 Project Management

- **Task Organization:** The project was organized into weekly sprints. Tasks were divided based on domains (Frontend, Game Logic, Microservices).
- **Tools Used:** We used **GitHub Projects (Issues and Kanban boards)** to track progress and assign tasks.
- **Communication Channels:** **Discord** for daily communication and quick ad-hoc meetings. In-person stand-ups were held twice a week.

## 💻 Technical Stack

### Frontend
- **Framework:** Next.js (v15) with React 19
- **Styling:** Tailwind CSS (v4)
- **Language:** TypeScript

### Backend (Microservices)
- **Framework:** Fastify (Node.js)
- **Language:** TypeScript
- **Services:** Auth, Chat, Game, Notification, Room, Stats, User
- **Validation:** Zod
- **Authentication:** JWT, Fastify OAuth2, Speakeasy (2FA)

### Database
- **System:** SQLite (via Better-SQLite3) managed by Prisma ORM.
- **Justification:** SQLite was chosen per service to maintain strict microservice decoupling, ensuring that each service owns its data without complex distributed database tuning, keeping the setup lightweight and compliant with the project constraints.

### Other Technologies
- **Infrastructure:** Docker & Docker Compose
- **Routing/Gateway:** NGINX 
- **Monitoring & Logging:** Prometheus, Grafana, Logstash

### Justification for Major Choices
- **Fastify over Express:** Chosen for its performance, native async/await support, and excellent plugin ecosystem.
- **Next.js:** Provided a solid structure for building a robust SPA, with built-in optimizations and easy routing.
- **Microservices:** A modular approach was chosen to allow independent scaling, easier debugging, and clear separation of concerns among team members.

## 🗄 Database Schema

Each microservice maintains its own segmented database (Database-per-service pattern). Below is a high-level representation of the core structures:

**User Service DB:**
- `User` (id: UUID, username: String, email: String, avatar: String, status: Enum)

**Auth Service DB:**
- `Credentials` (userId: UUID, passwordHash: String, twoFactorSecret: String)

**Chat Service DB:**
- `Channel` (id: UUID, name: String, type: Enum, ownerId: UUID)
- `Message` (id: UUID, channelId: UUID, senderId: UUID, content: String, timestamp: DateTime)

**Game & Stats Service DB:**
- `Match` (id: UUID, player1Id: UUID, player2Id: UUID, score1: Int, score2: Int, status: Enum)
- `Stats` (userId: UUID, wins: Int, losses: Int, ladderLevel: Int)

*(Note: Relationships across services are handled logically via UUIDs rather than enforced foreign keys, adhering strictly to microservice boundaries.)*

## ✨ Features List

| Feature | Team Member(s) | Description |
| ------- | -------------- | ----------- |
| **User Authentication** | [login1] | Secure login/registration via standard credentials or 42 Intranet OAuth. |
| **Two-Factor Authentication** | [login1] | Optional 2FA utilizing Google Authenticator compatibility. |
| **Live Multiplayer Game** | [login2] | Real-time Pong with matchmaking and custom game options. |
| **Chat functionality** | [login3] | Public/private channels, direct messaging, and blocking capabilities. |
| **Live Notifications** | [login3] | Real-time alerts for game invites and friend requests. |
| **User Profiles & Stats** | [login1, login2] | Detailed match history, win/loss tracking, and profile page. |

## 🧩 Modules

| Module Name | Type / Points | Justification & Implementation | Team Member(s) |
| ----------- | ------------- | ------------------------------ | -------------- |
| **Use a Microframework** | Major (2pts) | To fulfill backend requirements using Fastify instead of heavy frameworks (e.g. NestJS), allowing absolute control over routing and plugins. | [login1] |
| **Standard User Management** | Major (2pts) | Essential for identifying players, keeping track of their stats, and managing avatars/passwords securely. | [login1] |
| **Live Chat** | Major (2pts) | Implemented via WebSockets for real-time interaction natively between players. | [login3] |
| **Advanced 3D Game Option** | Major (2pts) | Using Three.js to provide a 3D view alternative to the classic 2D Pong, elevating the visual experience. | [login2] |
| **Two-Factor Authentication** | Minor (1pt) | Important for security. Implemented using TOTP (Time-Based One-Time Password) with Google Authenticator integration. | [login1] |
| **Server-Side Metrics** | Minor (1pt) | Uses Prometheus and Grafana for monitoring backend health, traffic, and performance metrics across microservices. | [login3] |

**Total Points Target:** At least 7 Major/Minor points based on the selected configuration.

## 👤 Individual Contributions

### [login1]
- **Contributions:** Architected the microservices pattern, implemented the API Gateway (NGINX), and fully developed the `auth-service` and `user-service`.
- **Challenges:** Dealing with cross-origin requests (CORS) across multiple Docker containers and sharing authentication state securely.
- **Solutions:** Implemented an API gateway to unify traffic and enforced strict JWT validation with HttpOnly cookies.

### [login2]
- **Contributions:** Built the primary Next.js Frontend application, the game loop, and the physics engine inside the `game-service`.
- **Challenges:** Ensuring the ball physics were perfectly synced between the server and both clients without stuttering.
- **Solutions:** Implemented a client-side prediction algorithm combined with server-authoritative state reconciliation.

### [login3]
- **Contributions:** Set up the global Docker environments, implemented continuous monitoring via Grafana, and developed the `chat-service` and `notification-service`.
- **Challenges:** Handling WebSocket connection drops in the chat and scaling the real-time event distribution.
- **Solutions:** Utilized Fastify's native websocket plugins and created robust reconnection logic on the frontend.

---
*Please make sure to replace the placeholder names `[login1]`, `[login2]`, and `[login3]`, and verify the specifics of the Features, Contributions, and Modules according to your actual team's final submission!*
