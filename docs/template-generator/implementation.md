# Implementation Guide - Template Generator

> **Comprehensive guide to building and deploying the AI-powered form generation system**

## 🚀 Project Setup & Installation

### **Prerequisites**

```bash
# Required Software
Node.js >= 18.0.0
PostgreSQL >= 14.0
npm >= 8.0.0
Git >= 2.30.0

# Development Tools (Recommended)
VS Code with TypeScript extension
PostgreSQL GUI (pgAdmin or similar)
Postman for API testing
```

### **Environment Configuration**

```bash
# Clone the repository
git clone https://github.com/STarLo-rd/template-generator.git
cd template-generator

# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

```env
# server/.env
DATABASE_URL=postgresql://username:password@localhost:5432/template_generator
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=5000

# client/.env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### **Database Setup**

```sql
-- Create database
CREATE DATABASE template_generator;

-- Connect to database and run migrations
\c template_generator;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Run schema creation
\i database/schema.sql
\i database/seed.sql
```

## 🔧 Backend Implementation

### **Core Server Setup**

```typescript
// server/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authRoutes } from './routes/auth';
import { schemaRoutes } from './routes/schemas';
import { templateRoutes } from './routes/templates';
import { uploadRoutes } from './routes/upload';

class Application {
  private app: express.Application;
  private server: http.Server;
  private io: SocketServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketServer(this.server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
      }
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(rateLimiter);
  }

  private setupRoutes(): void {
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/schemas', schemaRoutes);
    this.app.use('/api/v1/templates', templateRoutes);
    this.app.use('/api/v1/upload', uploadRoutes);
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
      });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public start(port: number): void {
    this.server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  }
}

export default new Application();
```

### **AI Service Implementation**

```typescript
// server/src/services/AIService.ts
import OpenAI from 'openai';
import { JSONSchema7 } from 'json-schema';
import ExcelJS from 'exceljs';

export class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateSchemaFromExcel(buffer: Buffer): Promise<SchemaGenerationResult> {
    try {
      // Parse Excel file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.getWorksheet(1);
      const excelData = this.extractExcelData(worksheet);
      
      // Generate schema using AI
      const schema = await this.generateSchema(excelData);
      
      return {
        success: true,
        schema,
        confidence: 0.95,
        suggestions: []
      };
      
    } catch (error) {
      throw new Error(`Schema generation failed: ${error.message}`);
    }
  }

  private extractExcelData(worksheet: ExcelJS.Worksheet): ExcelData {
    const data: ExcelData = {
      headers: [],
      rows: [],
      metadata: {
        totalRows: worksheet.rowCount,
        totalColumns: worksheet.columnCount
      }
    };

    // Extract headers from first row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      data.headers.push({
        name: cell.value?.toString() || `Column${colNumber}`,
        index: colNumber,
        type: this.inferColumnType(worksheet, colNumber)
      });
    });

    // Extract sample data rows (first 10 rows)
    for (let rowNumber = 2; rowNumber <= Math.min(11, worksheet.rowCount); rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData: any[] = [];
      
      row.eachCell((cell, colNumber) => {
        rowData[colNumber - 1] = cell.value;
      });
      
      data.rows.push(rowData);
    }

    return data;
  }

  private async generateSchema(excelData: ExcelData): Promise<JSONSchema7> {
    const prompt = this.buildSchemaPrompt(excelData);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert data analyst and JSON schema architect. 
          Generate a comprehensive JSON schema based on Excel data analysis.
          Focus on accuracy, validation rules, and user-friendly field names.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000
    });

    const aiResponse = response.choices[0].message.content;
    return this.parseSchemaFromResponse(aiResponse);
  }

  private buildSchemaPrompt(data: ExcelData): string {
    return `
    Analyze this Excel data and generate a JSON Schema:
    
    Headers: ${data.headers.map(h => `${h.name} (${h.type})`).join(', ')}
    
    Sample Data:
    ${data.rows.slice(0, 3).map(row => 
      data.headers.map((h, i) => `${h.name}: ${row[i]}`).join(', ')
    ).join('\n')}
    
    Requirements:
    1. Create appropriate field types (string, number, boolean, date, email, etc.)
    2. Add validation rules based on data patterns
    3. Set required fields based on data completeness
    4. Generate user-friendly titles and descriptions
    5. Include format specifications for special types
    6. Return only valid JSON schema, no explanations
    `;
  }

  private parseSchemaFromResponse(response: string): JSONSchema7 {
    try {
      // Extract JSON from response (remove code blocks if present)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/```\n([\s\S]*?)\n```/) ||
                       [null, response];
      
      const jsonString = jsonMatch[1] || response;
      const schema = JSON.parse(jsonString.trim());
      
      // Validate schema structure
      this.validateSchemaStructure(schema);
      
      return schema as JSONSchema7;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  private validateSchemaStructure(schema: any): void {
    if (!schema.type || schema.type !== 'object') {
      throw new Error('Schema must be of type object');
    }
    
    if (!schema.properties || typeof schema.properties !== 'object') {
      throw new Error('Schema must have properties');
    }
    
    // Additional validation rules...
  }
}
```

### **Schema Management Service**

```typescript
// server/src/services/SchemaService.ts
import { JSONSchema7 } from 'json-schema';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export class SchemaService {
  private ajv: Ajv;
  
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
  }

  async validateSchema(schema: JSONSchema7): Promise<ValidationResult> {
    try {
      // Validate JSON Schema syntax
      const isValid = this.ajv.validateSchema(schema);
      
      if (!isValid) {
        return {
          valid: false,
          errors: this.ajv.errors || [],
          warnings: []
        };
      }

      // Additional custom validations
      const warnings = this.performCustomValidations(schema);
      
      return {
        valid: true,
        errors: [],
        warnings
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [{ message: error.message }],
        warnings: []
      };
    }
  }

  async optimizeSchema(schema: JSONSchema7): Promise<JSONSchema7> {
    const optimized = { ...schema };
    
    // Add default values where appropriate
    this.addDefaultValues(optimized);
    
    // Optimize field ordering
    this.optimizeFieldOrder(optimized);
    
    // Add UI hints
    this.addUIHints(optimized);
    
    return optimized;
  }

  private performCustomValidations(schema: JSONSchema7): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // Check for missing titles
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        if (typeof prop === 'object' && !prop.title) {
          warnings.push({
            field: key,
            message: `Field '${key}' is missing a title`,
            severity: 'warning'
          });
        }
      });
    }
    
    // Check for overly complex validation
    this.checkComplexity(schema, warnings);
    
    return warnings;
  }

  generateUISchema(schema: JSONSchema7): UISchema {
    const uiSchema: UISchema = {};
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        if (typeof prop === 'object') {
          uiSchema[key] = this.generateFieldUISchema(prop);
        }
      });
    }
    
    return uiSchema;
  }

  private generateFieldUISchema(field: JSONSchema7): FieldUISchema {
    const uiSchema: FieldUISchema = {};
    
    // Set widget based on field type and format
    if (field.type === 'string') {
      if (field.format === 'email') {
        uiSchema['ui:widget'] = 'email';
      } else if (field.format === 'date') {
        uiSchema['ui:widget'] = 'date';
      } else if (field.maxLength && field.maxLength > 100) {
        uiSchema['ui:widget'] = 'textarea';
      }
    }
    
    // Add help text
    if (field.description) {
      uiSchema['ui:help'] = field.description;
    }
    
    // Set field ordering
    uiSchema['ui:order'] = this.calculateFieldOrder(field);
    
    return uiSchema;
  }
}
```

## 🎨 Frontend Implementation

### **React Component Structure**

```typescript
// client/src/components/SchemaEditor/SchemaEditor.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { JSONSchema7 } from 'json-schema';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert
} from '@mui/material';

import { SchemaBuilder } from './SchemaBuilder';
import { FormPreview } from './FormPreview';
import { CodeEditor } from './CodeEditor';
import { useSchemaValidation } from '../../hooks/useSchemaValidation';

interface SchemaEditorProps {
  initialSchema?: JSONSchema7;
  onSchemaChange: (schema: JSONSchema7) => void;
  onSave: (schema: JSONSchema7) => Promise<void>;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  initialSchema,
  onSchemaChange,
  onSave
}) => {
  const [schema, setSchema] = useState<JSONSchema7>(
    initialSchema || { type: 'object', properties: {} }
  );
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const { validation, validateSchema } = useSchemaValidation();

  useEffect(() => {
    validateSchema(schema);
  }, [schema, validateSchema]);

  const handleSchemaUpdate = useCallback((updatedSchema: JSONSchema7) => {
    setSchema(updatedSchema);
    onSchemaChange(updatedSchema);
  }, [onSchemaChange]);

  const handleSave = async () => {
    if (!validation.valid) {
      return;
    }
    
    setSaving(true);
    try {
      await onSave(schema);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Schema Editor</Typography>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!validation.valid || saving}
            loading={saving}
          >
            Save Schema
          </Button>
        </Box>
        
        {/* Validation Status */}
        {!validation.valid && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Schema has validation errors. Please fix them before saving.
          </Alert>
        )}
      </Paper>

      {/* Tabs */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Visual Builder" />
          <Tab label="Form Preview" />
          <Tab label="JSON Editor" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ flexGrow: 1, p: 2 }}>
          {activeTab === 0 && (
            <SchemaBuilder
              schema={schema}
              onChange={handleSchemaUpdate}
              validation={validation}
            />
          )}
          
          {activeTab === 1 && (
            <FormPreview
              schema={schema}
              onFormSubmit={(data) => console.log('Form data:', data)}
            />
          )}
          
          {activeTab === 2 && (
            <CodeEditor
              value={JSON.stringify(schema, null, 2)}
              onChange={(value) => {
                try {
                  const parsedSchema = JSON.parse(value);
                  handleSchemaUpdate(parsedSchema);
                } catch (error) {
                  // Handle JSON parse errors
                }
              }}
              language="json"
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};
```

### **Custom Hooks Implementation**

```typescript
// client/src/hooks/useSchemaGeneration.ts
import { useState, useCallback } from 'react';
import { JSONSchema7 } from 'json-schema';
import { apiClient } from '../services/apiClient';
import { useWebSocket } from './useWebSocket';

interface SchemaGenerationState {
  loading: boolean;
  progress: number;
  error: string | null;
  schema: JSONSchema7 | null;
  jobId: string | null;
}

export const useSchemaGeneration = () => {
  const [state, setState] = useState<SchemaGenerationState>({
    loading: false,
    progress: 0,
    error: null,
    schema: null,
    jobId: null
  });

  const { subscribe, unsubscribe } = useWebSocket();

  const generateSchema = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      loading: true,
      progress: 0,
      error: null,
      schema: null
    }));

    try {
      // Upload file and start generation
      const response = await apiClient.uploadAndGenerate(file);
      const { jobId } = response.data;
      
      setState(prev => ({ ...prev, jobId }));

      // Subscribe to progress updates
      subscribe(jobId, (event) => {
        switch (event.type) {
          case 'progress':
            setState(prev => ({ ...prev, progress: event.progress }));
            break;
            
          case 'schema-complete':
            setState(prev => ({
              ...prev,
              loading: false,
              schema: event.schema,
              progress: 100
            }));
            unsubscribe(jobId);
            break;
            
          case 'schema-error':
            setState(prev => ({
              ...prev,
              loading: false,
              error: event.error,
              progress: 0
            }));
            unsubscribe(jobId);
            break;
        }
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [subscribe, unsubscribe]);

  const resetState = useCallback(() => {
    setState({
      loading: false,
      progress: 0,
      error: null,
      schema: null,
      jobId: null
    });
  }, []);

  return {
    ...state,
    generateSchema,
    resetState
  };
};
```

### **Form Renderer Implementation**

```typescript
// client/src/components/FormRenderer/FormRenderer.tsx
import React from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { JSONSchema7 } from 'json-schema';
import { Box, Paper, Typography } from '@mui/material';

import { CustomFieldTemplate } from './CustomFieldTemplate';
import { CustomObjectFieldTemplate } from './CustomObjectFieldTemplate';
import { CustomWidgets } from './CustomWidgets';

interface FormRendererProps {
  schema: JSONSchema7;
  uiSchema?: any;
  formData?: any;
  onSubmit: (data: any) => void;
  onChange?: (data: any) => void;
  disabled?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  uiSchema = {},
  formData = {},
  onSubmit,
  onChange,
  disabled = false
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Generated Form
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          validator={validator}
          onSubmit={({ formData }) => onSubmit(formData)}
          onChange={({ formData }) => onChange?.(formData)}
          disabled={disabled}
          templates={{
            FieldTemplate: CustomFieldTemplate,
            ObjectFieldTemplate: CustomObjectFieldTemplate
          }}
          widgets={CustomWidgets}
          showErrorList={false}
          liveValidate
        />
      </Box>
    </Paper>
  );
};
```

## 📊 Testing Implementation

### **Backend Testing**

```typescript
// server/tests/services/AIService.test.ts
import { AIService } from '../../src/services/AIService';
import { readFileSync } from 'fs';
import path from 'path';

describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    aiService = new AIService();
  });

  describe('generateSchemaFromExcel', () => {
    it('should generate valid schema from simple Excel file', async () => {
      const excelBuffer = readFileSync(
        path.join(__dirname, '../fixtures/simple-form.xlsx')
      );
      
      const result = await aiService.generateSchemaFromExcel(excelBuffer);
      
      expect(result.success).toBe(true);
      expect(result.schema).toBeDefined();
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle complex Excel files with multiple data types', async () => {
      const excelBuffer = readFileSync(
        path.join(__dirname, '../fixtures/complex-form.xlsx')
      );
      
      const result = await aiService.generateSchemaFromExcel(excelBuffer);
      
      expect(result.success).toBe(true);
      expect(Object.keys(result.schema.properties!)).toHaveLength(8);
      
      // Verify specific field types
      const properties = result.schema.properties as any;
      expect(properties.email.format).toBe('email');
      expect(properties.age.type).toBe('number');
      expect(properties.birthDate.format).toBe('date');
    });
  });
});
```

### **Frontend Testing**

```typescript
// client/src/components/SchemaEditor/SchemaEditor.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SchemaEditor } from './SchemaEditor';
import { mockSchema } from '../../__mocks__/schemas';

const mockOnSchemaChange = jest.fn();
const mockOnSave = jest.fn();

describe('SchemaEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial schema', () => {
    render(
      <SchemaEditor
        initialSchema={mockSchema}
        onSchemaChange={mockOnSchemaChange}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Schema Editor')).toBeInTheDocument();
    expect(screen.getByText('Visual Builder')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(
      <SchemaEditor
        initialSchema={mockSchema}
        onSchemaChange={mockOnSchemaChange}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Form Preview'));
    expect(screen.getByText('Generated Form')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('JSON Editor'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    mockOnSave.mockResolvedValue(undefined);
    
    render(
      <SchemaEditor
        initialSchema={mockSchema}
        onSchemaChange={mockOnSchemaChange}
        onSave={mockOnSave}
      />
    );
    
    fireEvent.click(screen.getByText('Save Schema'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(mockSchema);
    });
  });
});
```

## 🚀 Deployment Guide

### **Docker Configuration**

```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: template_generator
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/template_generator
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

This comprehensive implementation guide provides everything needed to build, test, and deploy the Template Generator application. The modular architecture ensures scalability and maintainability while the AI integration delivers intelligent form generation capabilities.

---

*Implementation guide by Mohanpathi - January 2025* 