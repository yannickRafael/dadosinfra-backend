const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'dadosinfra API',
      version: '1.0.0',
      description: 'Mozambique Infrastructure Disclosure Portal — Backend API'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'Returns the status of MongoDB and MinIO. Use this to verify all dependencies are running before making other requests.',
          tags: ['Health'],
          responses: {
            200: { description: 'MongoDB and MinIO are up' },
            503: { description: 'One or more dependencies are down' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login and get JWT token',
          description: 'Authenticate with email and password. Returns a JWT token valid for 8 hours. Pass this token as `Authorization: Bearer <token>` on protected endpoints.',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@dadosinfra.mz' },
                    password: { type: 'string', example: 'Admin1234!' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Returns JWT token' },
            400: { description: 'Missing email or password' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/api/projects': {
        get: {
          summary: 'List projects with filters and pagination',
          description: 'Returns a paginated list of projects. Filter by sector, province, status, or visibility. Default page size is 10. Does not include nested tenders, contracts or documents — use GET /api/projects/:id for the full record.',
          tags: ['Projects'],
          parameters: [
            { name: 'sector', in: 'query', schema: { type: 'string' } },
            { name: 'province', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'isPublic', in: 'query', schema: { type: 'boolean' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: { description: 'Paginated list of projects' }
          }
        },
        post: {
          summary: 'Create a new project',
          description: 'Creates a new infrastructure project. Requires a valid JWT token. The `ocid` field must be unique and follow the OC4IDS format (e.g. ocds-abc123-MZ-0001).',
          tags: ['Projects'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['ocid', 'title'],
                  properties: {
                    ocid: { type: 'string', example: 'ocds-abc123-MZ-0051' },
                    title: { type: 'string', example: 'Maputo Ring Road' },
                    sector: { type: 'string', example: 'transport' },
                    province: { type: 'string', example: 'Maputo' },
                    status: { type: 'string', example: 'identification' },
                    isPublic: { type: 'boolean', example: true }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Project created' },
            400: { description: 'Missing required fields' },
            401: { description: 'No token provided' },
            409: { description: 'ocid already exists' }
          }
        }
      },
      '/api/projects/{id}': {
        get: {
          summary: 'Get single project with tenders, contracts and documents',
          description: 'Returns the full project record assembled with all related tenders, contracts and documents. Use the MongoDB `_id` from the list endpoint as the `id` parameter.',
          tags: ['Projects'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Full project with nested data' },
            400: { description: 'Invalid project ID format' },
            404: { description: 'Project not found' }
          }
        }
      },
      '/api/projects/{id}/documents': {
        post: {
          summary: 'Upload a PDF document to a project',
          description: 'Uploads a PDF file and attaches it to the project. The file is stored in MinIO. Only PDF files are accepted — validated by magic bytes, not just file extension. Requires a valid JWT token.',
          tags: ['Documents'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    title: { type: 'string' },
                    documentType: { type: 'string', example: 'feasibilityStudy' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Document uploaded and record created' },
            400: { description: 'No file or invalid file type' },
            401: { description: 'No token provided' },
            404: { description: 'Project not found' }
          }
        }
      },
      '/api/documents/{id}/file': {
        get: {
          summary: 'Stream a document PDF file',
          description: 'Streams the PDF file stored in MinIO back to the client. The `id` is the Document `_id` returned by the upload endpoint. The `url` field on any document record points here.',
          tags: ['Documents'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'PDF file stream', content: { 'application/pdf': {} } },
            404: { description: 'Document not found' }
          }
        }
      }
    }
  },
  apis: []
}

module.exports = swaggerJsdoc(options)
