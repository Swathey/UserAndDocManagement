import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

describe('User & Document Management E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let adminId: string;
  let editorId: string;
  let viewerId: string;
  let documentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Clean the database
    await prismaService.document.deleteMany({});
    await prismaService.user.deleteMany({});

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await prismaService.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: Role.Admin,
      },
    });
    adminId = admin.id;
    
    const editor = await prismaService.user.create({
      data: {
        email: 'editor@example.com',
        password: hashedPassword,
        role: Role.Editor,
      },
    });
    editorId = editor.id;
    
    const viewer = await prismaService.user.create({
      data: {
        email: 'viewer@example.com',
        password: hashedPassword,
        role: Role.Viewer,
      },
    });
    viewerId = viewer.id;

    // Login and get tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.accessToken;
    
    const editorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'editor@example.com', password: 'password123' });
    editorToken = editorLogin.body.accessToken;
    
    const viewerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'viewer@example.com', password: 'password123' });
    viewerToken = viewerLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prismaService.document.deleteMany({});
    await prismaService.user.deleteMany({});
    await app.close();
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          role: Role.Editor,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('role', Role.Editor);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail registration with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com', // Already exists
          password: 'password123',
          role: Role.Editor,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User with this email already exists');
    });

    it('should login a user with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@example.com');
      expect(response.body.user).toHaveProperty('role', Role.Admin);
    });

    it('should fail login with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'admin@example.com');
      expect(response.body).toHaveProperty('role', Role.Admin);
    });

    it('should fail to get profile without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('User Management', () => {
    it('should allow admins to get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // At least admin, editor, viewer
    });

    it('should not allow non-admins to get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow admins to get a specific user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${editorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', editorId);
      expect(response.body).toHaveProperty('email', 'editor@example.com');
    });

    it('should allow users to view their own profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${editorId}`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', editorId);
      expect(response.body).toHaveProperty('email', 'editor@example.com');
    });

    it('should allow admins to update a user', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/user/${viewerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: Role.Editor,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', viewerId);
      expect(response.body).toHaveProperty('role', Role.Editor);
    });

    it('should not allow non-admins to update users', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/user/${viewerId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          role: Role.Viewer,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Document Management', () => {
    it('should allow authenticated users to create documents', async () => {
      const response = await request(app.getHttpServer())
        .post('/document/create')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Test Document',
          content: 'This is a test document',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Document created successfully');
      expect(response.body.document).toHaveProperty('title', 'Test Document');
      expect(response.body.document).toHaveProperty('ownerId', editorId);
      
      // Save document ID for later tests
      documentId = response.body.document.id;
    });

    it('should allow admins to see all documents', async () => {
      const response = await request(app.getHttpServer())
        .get('/document')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Documents retrieved successfully');
      expect(Array.isArray(response.body.documents)).toBe(true);
      expect(response.body.documents.length).toBeGreaterThanOrEqual(1);
    });

    it('should only show users their own documents', async () => {
      const response = await request(app.getHttpServer())
        .get('/document')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Documents retrieved successfully');
      expect(Array.isArray(response.body.documents)).toBe(true);
      
      // All documents should belong to the editor
      response.body.documents.forEach(doc => {
        expect(doc.ownerId).toBe(editorId);
      });
    });

    it('should allow document owners to view their documents', async () => {
      const response = await request(app.getHttpServer())
        .get(`/document/${documentId}`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', `Document with ID ${documentId} found successfully`);
      expect(response.body.document).toHaveProperty('id', documentId);
      expect(response.body.document).toHaveProperty('title', 'Test Document');
    });

    it('should allow admins to view any document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/document/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('document');
      expect(response.body.document).toHaveProperty('id', documentId);
    });

    it('should not allow non-owners to view documents', async () => {
      const response = await request(app.getHttpServer())
        .get(`/document/${documentId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'You do not have permission to access this document');
    });

    it('should allow document owners to update their documents', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/document/${documentId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Updated Document Title',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', `Document with ID ${documentId} updated successfully`);
      expect(response.body.document).toHaveProperty('title', 'Updated Document Title');
    });

    it('should not allow non-owners to update documents', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/document/${documentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          title: 'Unauthorized Update',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'You do not have permission to update this document');
    });

    it('should allow document owners to delete their documents', async () => {
      // First create a new document to delete
      const createResponse = await request(app.getHttpServer())
        .post('/document/create')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Document to Delete',
          content: 'This document will be deleted',
        });
      
      const docToDeleteId = createResponse.body.document.id;
      
      const response = await request(app.getHttpServer())
        .delete(`/document/${docToDeleteId}`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', `Document with ID ${docToDeleteId} deleted successfully`);
    });

    it('should not allow non-owners to delete documents', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/document/${documentId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'You do not have permission to delete this document');
    });
  });
});
