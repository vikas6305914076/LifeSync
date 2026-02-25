# LifeSync Full-Stack Application

LifeSync is a full-stack productivity app with authentication, expense tracking, task management, grocery management, and medicine reminders.

## Tech Stack
- Backend: Spring Boot 3, Java 17, Maven, Spring Web, Spring Data JPA, Spring Security (JWT), MySQL
- Frontend: React (CRA), Axios, basic CSS
- Database: MySQL (`lifesyncdb`)

## Folder Structure
- `backend` - Spring Boot API
- `frontend` - React client
- `database/schema.sql` - SQL schema

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- MySQL 8+

## Database Setup
1. Ensure MySQL is running locally.
2. Create and initialize schema:
   ```sql
   SOURCE C:/Users/vikey/OneDrive/Desktop/LifeSync/database/schema.sql;
   ```
3. Backend DB config:
   - Username: `root`
   - Password: `root`
   - Database: `lifesyncdb`

## Run Backend
```bash
cd backend
mvn clean spring-boot:run
```
Backend runs on `http://localhost:8080`.

## Run Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`.

## REST Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Expenses
- `POST /api/expenses`
- `GET /api/expenses`
- `DELETE /api/expenses/{id}`

### Tasks
- `POST /api/tasks`
- `GET /api/tasks`
- `PATCH /api/tasks/{id}/complete`
- `DELETE /api/tasks/{id}`

### Groceries
- `POST /api/groceries`
- `GET /api/groceries`
- `PATCH /api/groceries/{id}/purchase`
- `DELETE /api/groceries/{id}`

### Medicines
- `POST /api/medicines`
- `GET /api/medicines`

## Postman Testing
1. Register:
   - URL: `POST http://localhost:8080/api/auth/register`
   - Body:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```
2. Login:
   - URL: `POST http://localhost:8080/api/auth/login`
   - Body:
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
3. Copy `token` from login response.
4. In Postman, set header for protected APIs:
   - `Authorization: Bearer <token>`
5. Use module endpoints with JSON bodies.

## Notes
- JWT is stored in frontend `localStorage`.
- CORS allows `http://localhost:3000`.
- Hibernate `ddl-auto=update` is enabled for development.
