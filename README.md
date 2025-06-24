# User and Document Management System

A comprehensive API-based system for managing users and documents with advanced features including authentication, authorization, document management, and document ingestion processing using a microservice architecture.

## Features

### Authentication and Authorization
- JWT-based authentication
- Role-based access control (Admin, Editor, Viewer roles)
- Secure registration and login workflows
- Protected API endpoints

### User Management
- User CRUD operations (Create, Read, Update, Delete)
- Role management
- Secure password handling with bcrypt

### Document Management
- Document CRUD operations
- Access control based on ownership and roles
- Document content storage and retrieval
- File path tracking for document storage

### Document Ingestion Service
- Microservice architecture with TCP transport
- Asynchronous document processing
- Status tracking for ingestion processes
- Webhook integration for status updates

### Database
- PostgreSQL database with Prisma ORM
- Relational data model for users, documents, and ingestion processes
- Migration support for database versioning

### Testing
- Comprehensive unit tests for all modules
- End-to-end API testing
- Test coverage reporting

## Architecture

The application is built with NestJS and follows a modular architecture:

- **Authentication Module**: Handles user authentication and authorization
- **User Module**: Manages user data and operations
- **Document Module**: Handles document storage and retrieval
- **Ingestion Module**: Processes documents asynchronously using a microservice
- **Prisma Module**: Provides database access via Prisma ORM

The system integrates with a Python backend microservice for document processing, using TCP transport for communication.

## Technical Stack

- **Backend Framework**: NestJS 11
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: Passport, JWT
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Microservices**: NestJS Microservices with TCP transport
- **Validation**: class-validator, class-transformer

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- Python environment (for the ingestion microservice)
- Docker (optional, for containerization)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd user-doc-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/user_doc_management?schema=public"
   JWT_SECRET="your-jwt-secret-key"
   PORT=3000
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the application:
   ```bash
   npm run start:dev
   ```

### Docker Setup (Optional)

A Docker Compose configuration is available for running the application with all its dependencies:

```bash
docker-compose up -d
```

This will start:
- The NestJS application
- PostgreSQL database
- Python ingestion service

## API Documentation

The API is documented using Swagger/OpenAPI. After starting the application, you can access the documentation at:

```
http://localhost:3000/api
```

### Main Endpoints

- **Authentication**:
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Login and obtain JWT token
  - `POST /auth/logout` - Logout (client-side token removal)
  - `GET /auth/profile` - Get current user profile

- **Users**:
  - `GET /user` - Get all users (Admin only)
  - `GET /user/:id` - Get a specific user
  - `POST /user` - Create a user (Admin only)
  - `PATCH /user/:id` - Update a user (Admin only)
  - `DELETE /user/:id` - Delete a user (Admin only)

- **Documents**:
  - `GET /document` - Get all documents (filtered by user role)
  - `GET /document/:id` - Get a specific document
  - `POST /document/create` - Create a document
  - `PATCH /document/:id` - Update a document
  - `DELETE /document/:id` - Delete a document

- **Ingestion**:
  - `POST /ingestion/trigger/:documentId` - Trigger document ingestion
  - `GET /ingestion/status/:id` - Get ingestion status
  - `GET /ingestion` - Get all ingestion processes
  - `POST /ingestion/webhook/status/:id` - Update ingestion status via webhook

## Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Future Enhancements

- Add refresh token functionality for enhanced security
- Implement document sharing between users
- Add pagination and filtering for document and user listings
- Create frontend interface
- Set up production deployment pipeline

## License

This project is licensed under the [MIT License](LICENSE).
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
