# IMF Gadget API

## Overview
The IMF Gadget API is a secure RESTful service built with Node.js, Express, and PostgreSQL to manage the Impossible Missions Force's gadget inventory. The service is secured using JWT authentication and is fully documented using Swagger UI.

The API is deployed on Render and is accessible at:
```
https://sm-imf-gadget-api-internapp.onrender.com/sm
```


## Features
- **Gadget Inventory Management**: Create, retrieve, update, and decommission gadgets.
- **Unique Codenames**: Each gadget is assigned a unique, randomly generated codename (e.g., "The Nightingale").
- **Self-Destruct Sequence**: Generate a confirmation code and trigger a self-destruct sequence that marks a gadget as "Destroyed".
- **JWT Authentication**: Secure access to protected endpoints using JSON Web Tokens.
- **Swagger Documentation**: Interactive API documentation available to test and explore endpoints.
- **Deployment on Render**: The API is live and accessible via Render.

## Tech Stack
- **Node.js** and **Express** for the API server.
- **PostgreSQL** as the database.
- **Sequelize** as the ORM.
- **JWT** for authentication.
- **Swagger UI** for API documentation.
- **Render** for deployment.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)
- Git (to clone the repository)

### 1. Clone the Repository
### 2. Database Setup

1. **Install PostgreSQL**  

2. **Create the Database**  
   Create a new PostgreSQL database:
   ```bash
   createdb imf_gadget_db
   ```
   Or alternatively:
   ```bash
   psql -U your_postgres_username -c "CREATE DATABASE imf_gadget_db;"
   ```

3. **Initialize Sequelize**  
   Set up the Sequelize project structure:
   ```bash
   npx sequelize-cli init
   ```

4. **Run Migrations**  
   Create the necessary tables by running:
   ```bash
   npx sequelize-cli db:migrate
   ```
### 3. Set up Environment Variables
### 4. Installation
Install project dependencies:
```bash
npm install
```

### 5. Running the Application

#### Development
Run the API server with Nodemon:
```bash
npm run dev
```
The server will run on the port specified in your `.env` file (default is 3000).

#### Production
Start the server in production mode:
```bash
npm start
```

## API Endpoints

### Authentication (Public)

#### Register a New User
- **Endpoint:** `POST /auth/register`
- **Description:** Create a new user account.
- **Request Body:**
  ```json
  {
    "username": "agent007",
    "password": "your_password"
  }
  ```
- **Response:** 201 status with a success message.

#### User Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate a user and retrieve a JWT token.
- **Request Body:**
  ```json
  {
    "username": "agent007",
    "password": "your_password"
  }
  ```
- **Response:** 200 status with a token:
  ```json
  {
    "token": "your_jwt_token"
  }
  ```

### Gadget Inventory (Protected)
Include the JWT in the `Authorization` header for all gadget endpoints:
```
Authorization: your_jwt_token
```

#### Retrieve Gadgets
- **Endpoint:** `GET /gadgets`
- **Description:** Retrieve a list of all gadgets, each including a randomly generated mission success probability.
- **Optional Query Parameter:**  
  `?status=Available` (or "Deployed", "Destroyed", "Decommissioned") to filter results.
- **Response Example:**
  ```json
  [
    {
      "id": "uuid",
      "name": "The Nightingale",
      "status": "Available",
      "successProbability": "87%",
      "display": "The Nightingale - 87% success probability"
    }
  ]
  ```

#### Add a New Gadget
- **Endpoint:** `POST /gadgets`
- **Description:** Create a new gadget. A unique codename is automatically generated.
- **Response:** 201 status with the new gadget's details.

#### Update a Gadget
- **Endpoint:** `PATCH /gadgets/{id}`
- **Description:** Update the information of an existing gadget.
- **Request Body Example:**
  ```json
  {
    "name": "New Codename",
    "status": "Deployed"
  }
  ```
- **Response:** Updated gadget details.

#### Decommission a Gadget
- **Endpoint:** `DELETE /gadgets/{id}`
- **Description:** Instead of deletion, mark a gadget as "Decommissioned" and record a decommission timestamp.
- **Response Example:**
  ```json
  {
    "message": "Gadget decommissioned"
  }
  ```

### Self-Destruct Sequence (Protected)

#### Generate Confirmation Code
- **Endpoint:** `POST /gadgets/{id}/self-destruct/generate-code`
- **Description:** Generate a confirmation code required for triggering the self-destruct sequence.
- **Response Example:**
  ```json
  {
    "confirmationCode": "12345",
    "message": "Confirmation code generated. Use this code to confirm self-destruct."
  }
  ```

#### Trigger Self-Destruct
- **Endpoint:** `POST /gadgets/{id}/self-destruct`
- **Description:** Trigger the self-destruct sequence by submitting the generated confirmation code.
- **Request Body:**
  ```json
  {
    "confirmationCode": "12345"
  }
  ```
- **Response Example:**
  ```json
  {
    "message": "Gadget self-destructed"
  }
  ```




