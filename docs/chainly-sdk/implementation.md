# Implementation Guide

## 🚀 Getting Started

This comprehensive guide walks through implementing Chainly SDK in your TypeScript applications, from basic setup to advanced enterprise patterns.

## 📦 Installation & Setup

### Package Installation
```bash
# Install the SDK
npm install chainly-sdk

# Install peer dependencies for TypeScript projects
npm install --save-dev typescript @types/node

# Optional: Install additional integrations
npm install @chainly/express-middleware @chainly/metrics-collector
```

### Basic Configuration
```typescript
// chainly.config.ts
import { ChainlyConfig } from 'chainly-sdk';

export const config: ChainlyConfig = {
  // Global retry policy
  defaultRetryPolicy: {
    maxRetries: 3,
    backoffStrategy: 'exponential',
    initialDelay: 1000
  },
  
  // Concurrency limits
  maxConcurrentTasks: 10,
  maxConcurrentWorkflows: 5,
  
  // Memory management
  memoryLimit: 512, // MB
  contextCleanupThreshold: 100, // Number of completed tasks
  
  // Monitoring
  enableMetrics: true,
  enableTracing: true,
  
  // Error handling
  defaultErrorHandler: 'log-and-continue',
  enableCircuitBreaker: true
};
```

## 🔧 Core Implementation Patterns

### 1. Basic Workflow Creation

#### Simple Sequential Workflow
```typescript
import { Workflow, Task } from 'chainly-sdk';

interface UserRegistrationContext {
  email: string;
  password: string;
  profile: UserProfile;
}

interface UserRegistrationResult {
  userId: string;
  verified: boolean;
  welcomeEmailSent: boolean;
}

// Define individual tasks
const validateUserTask = new Task<UserRegistrationContext, boolean>(
  'validate-user',
  async (context) => {
    // Validation logic
    if (!context.email || !context.password) {
      throw new Error('Missing required fields');
    }
    
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(context.email);
    if (!isValidEmail) {
      throw new Error('Invalid email format');
    }
    
    return true;
  },
  {
    timeout: 5000,
    retryPolicy: {
      maxRetries: 2,
      backoffStrategy: 'linear'
    }
  }
);

const createUserTask = new Task<UserRegistrationContext, string>(
  'create-user',
  async (context) => {
    // Database operation
    const hashedPassword = await hashPassword(context.password);
    const user = await userRepository.create({
      email: context.email,
      password: hashedPassword,
      profile: context.profile
    });
    
    return user.id;
  },
  {
    timeout: 10000,
    retryPolicy: {
      maxRetries: 3,
      backoffStrategy: 'exponential',
      retryCondition: (error) => error.code === 'DATABASE_ERROR'
    }
  }
);

const sendWelcomeEmailTask = new Task<{ userId: string; email: string }, boolean>(
  'send-welcome-email',
  async (context) => {
    await emailService.sendWelcomeEmail(context.email, context.userId);
    return true;
  },
  {
    timeout: 15000,
    retryPolicy: {
      maxRetries: 5,
      backoffStrategy: 'exponential'
    }
  }
);

// Create and configure workflow
const userRegistrationWorkflow = new Workflow<UserRegistrationContext, UserRegistrationResult>({
  name: 'user-registration',
  description: 'Complete user registration process'
});

// Add tasks with dependencies
userRegistrationWorkflow.addTask(validateUserTask);
userRegistrationWorkflow.addTask(createUserTask, { dependsOn: ['validate-user'] });
userRegistrationWorkflow.addTask(sendWelcomeEmailTask, { dependsOn: ['create-user'] });

// Execute workflow
async function registerUser(userData: UserRegistrationContext): Promise<UserRegistrationResult> {
  try {
    const result = await userRegistrationWorkflow.execute(userData);
    
    return {
      userId: result.get('create-user'),
      verified: result.get('validate-user'),
      welcomeEmailSent: result.get('send-welcome-email')
    };
  } catch (error) {
    console.error('User registration failed:', error);
    throw error;
  }
}
```

### 2. Parallel Task Execution

#### Concurrent Data Processing
```typescript
import { Workflow, Task, ParallelGroup } from 'chainly-sdk';

interface DataProcessingContext {
  dataSet: DataRecord[];
  processingOptions: ProcessingOptions;
}

// Create parallel processing tasks
const validateDataTask = new Task('validate-data', async (context) => {
  return await dataValidator.validate(context.dataSet);
});

const enrichDataTask = new Task('enrich-data', async (context) => {
  return await dataEnricher.enrich(context.dataSet);
});

const analyzeDataTask = new Task('analyze-data', async (context) => {
  return await dataAnalyzer.analyze(context.dataSet);
});

// Create workflow with parallel execution
const dataProcessingWorkflow = new Workflow<DataProcessingContext>({
  name: 'data-processing-pipeline'
});

// Group tasks for parallel execution
const parallelProcessingGroup = new ParallelGroup([
  validateDataTask,
  enrichDataTask,
  analyzeDataTask
], {
  maxConcurrency: 3,
  failFast: false, // Continue even if one task fails
  aggregateResults: true
});

dataProcessingWorkflow.addParallelGroup(parallelProcessingGroup);

// Add final aggregation task
const aggregateResultsTask = new Task('aggregate-results', async (context) => {
  const validationResult = context.getResult('validate-data');
  const enrichmentResult = context.getResult('enrich-data');
  const analysisResult = context.getResult('analyze-data');
  
  return {
    isValid: validationResult?.isValid || false,
    enrichedRecords: enrichmentResult?.records || [],
    insights: analysisResult?.insights || []
  };
});

dataProcessingWorkflow.addTask(aggregateResultsTask, { 
  dependsOn: ['validate-data', 'enrich-data', 'analyze-data'] 
});
```

### 3. Conditional Workflow Branching

#### Dynamic Workflow Execution
```typescript
import { Workflow, Task, ConditionalBranch } from 'chainly-sdk';

interface OrderProcessingContext {
  order: Order;
  customer: Customer;
  paymentMethod: PaymentMethod;
}

// Define conditional tasks
const standardShippingTask = new Task('standard-shipping', async (context) => {
  return await shippingService.scheduleStandardDelivery(context.order);
});

const expressShippingTask = new Task('express-shipping', async (context) => {
  return await shippingService.scheduleExpressDelivery(context.order);
});

const premiumProcessingTask = new Task('premium-processing', async (context) => {
  return await premiumService.processOrder(context.order);
});

// Create conditional branches
const shippingBranch = new ConditionalBranch({
  name: 'shipping-selection',
  conditions: [
    {
      condition: (context) => context.customer.isPremium && context.order.total > 100,
      tasks: [expressShippingTask]
    },
    {
      condition: (context) => context.customer.isPremium,
      tasks: [premiumProcessingTask, expressShippingTask]
    }
  ],
  fallback: [standardShippingTask]
});

const orderProcessingWorkflow = new Workflow<OrderProcessingContext>({
  name: 'order-processing'
});

orderProcessingWorkflow.addConditionalBranch(shippingBranch);
```

### 4. Event-Driven Workflows

#### Real-time Event Processing
```typescript
import { EventDrivenWorkflow, EventTrigger, EventFilter } from 'chainly-sdk';

interface PaymentEventContext {
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
}

// Define event filters
const paymentCompletedFilter = new EventFilter<PaymentEventContext>({
  type: 'payment.completed',
  condition: (event) => event.status === 'completed' && event.amount > 0
});

const paymentFailedFilter = new EventFilter<PaymentEventContext>({
  type: 'payment.failed',
  condition: (event) => event.status === 'failed'
});

// Define event-triggered tasks
const updateOrderStatusTask = new Task('update-order-status', async (context) => {
  await orderService.updateStatus(context.paymentId, 'paid');
  return { updated: true };
});

const sendReceiptTask = new Task('send-receipt', async (context) => {
  await emailService.sendReceipt(context.paymentId);
  return { sent: true };
});

const handlePaymentFailureTask = new Task('handle-payment-failure', async (context) => {
  await notificationService.notifyPaymentFailure(context.paymentId);
  await orderService.updateStatus(context.paymentId, 'payment-failed');
  return { handled: true };
});

// Create event-driven workflow
const paymentEventWorkflow = new EventDrivenWorkflow({
  name: 'payment-event-handler'
});

// Register event handlers
paymentEventWorkflow.on(paymentCompletedFilter, [
  updateOrderStatusTask,
  sendReceiptTask
]);

paymentEventWorkflow.on(paymentFailedFilter, [
  handlePaymentFailureTask
]);

// Start listening for events
await paymentEventWorkflow.start();

// Emit events (typically from external systems)
paymentEventWorkflow.emit('payment.completed', {
  paymentId: 'pay_123',
  amount: 99.99,
  currency: 'USD',
  status: 'completed'
});
```

## 🛠️ Advanced Implementation Patterns

### 1. Custom Middleware Development

#### Comprehensive Logging Middleware
```typescript
import { Middleware, MiddlewareContext, Logger } from 'chainly-sdk';

class AdvancedLoggingMiddleware extends Middleware {
  private logger: Logger;
  
  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }
  
  async before(context: MiddlewareContext): Promise<void> {
    const { task, workflow, context: workflowContext } = context;
    
    this.logger.info('Task execution started', {
      taskId: task.id,
      taskName: task.name,
      workflowId: workflow.id,
      workflowName: workflow.name,
      correlationId: workflowContext.metadata.correlationId,
      traceId: workflowContext.metadata.traceId,
      timestamp: new Date().toISOString(),
      inputSize: JSON.stringify(workflowContext.data).length
    });
    
    // Add performance tracking
    context.metadata.performanceStart = process.hrtime.bigint();
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    const performanceEnd = process.hrtime.bigint();
    const executionTime = Number(performanceEnd - context.metadata.performanceStart) / 1000000; // Convert to ms
    
    this.logger.info('Task execution completed', {
      taskId: context.task.id,
      taskName: context.task.name,
      workflowId: context.workflow.id,
      executionTimeMs: executionTime,
      resultSize: JSON.stringify(result).length,
      success: true,
      timestamp: new Date().toISOString()
    });
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    const performanceEnd = process.hrtime.bigint();
    const executionTime = Number(performanceEnd - context.metadata.performanceStart) / 1000000;
    
    this.logger.error('Task execution failed', {
      taskId: context.task.id,
      taskName: context.task.name,
      workflowId: context.workflow.id,
      executionTimeMs: executionTime,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### Security Validation Middleware
```typescript
import { Middleware, MiddlewareContext, SecurityValidator } from 'chainly-sdk';

class SecurityMiddleware extends Middleware {
  private validator: SecurityValidator;
  
  constructor(validator: SecurityValidator) {
    super();
    this.validator = validator;
  }
  
  async before(context: MiddlewareContext): Promise<void> {
    // Validate user permissions
    const userId = context.context.metadata.userId;
    const taskPermissions = context.task.getRequiredPermissions();
    
    if (taskPermissions.length > 0) {
      const hasPermission = await this.validator.validatePermissions(userId, taskPermissions);
      if (!hasPermission) {
        throw new SecurityError(`User ${userId} lacks required permissions for task ${context.task.name}`);
      }
    }
    
    // Validate input data
    await this.validator.validateInput(context.context.data);
    
    // Rate limiting
    await this.validator.checkRateLimit(userId, context.task.name);
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    // Sanitize output data
    const sanitizedResult = await this.validator.sanitizeOutput(result);
    
    // Update rate limiting counters
    const userId = context.context.metadata.userId;
    await this.validator.updateRateLimit(userId, context.task.name);
    
    return sanitizedResult;
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    // Log security events
    if (error instanceof SecurityError) {
      await this.validator.logSecurityEvent({
        userId: context.context.metadata.userId,
        taskName: context.task.name,
        error: error.message,
        timestamp: new Date(),
        severity: 'high'
      });
    }
  }
}
```

### 2. Enterprise Integration Patterns

#### Database Transaction Management
```typescript
import { Workflow, Task, TransactionManager } from 'chainly-sdk';

class DatabaseTransactionWorkflow extends Workflow {
  private transactionManager: TransactionManager;
  
  constructor(config: WorkflowConfig, transactionManager: TransactionManager) {
    super(config);
    this.transactionManager = transactionManager;
  }
  
  async execute<TContext, TResult>(context: TContext): Promise<TResult> {
    const transaction = await this.transactionManager.begin();
    
    try {
      // Add transaction context to all tasks
      const transactionalContext = {
        ...context,
        transaction: transaction
      };
      
      const result = await super.execute(transactionalContext);
      
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

// Usage example
const orderProcessingWorkflow = new DatabaseTransactionWorkflow(
  { name: 'order-processing' },
  new PostgresTransactionManager(dbConnection)
);

const createOrderTask = new Task('create-order', async (context) => {
  return await context.transaction.query(
    'INSERT INTO orders (customer_id, total) VALUES ($1, $2) RETURNING id',
    [context.customerId, context.total]
  );
});

const updateInventoryTask = new Task('update-inventory', async (context) => {
  for (const item of context.items) {
    await context.transaction.query(
      'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
      [item.quantity, item.productId]
    );
  }
});

orderProcessingWorkflow.addTask(createOrderTask);
orderProcessingWorkflow.addTask(updateInventoryTask, { dependsOn: ['create-order'] });
```

#### Message Queue Integration
```typescript
import { EventDrivenWorkflow, MessageQueueAdapter } from 'chainly-sdk';

class MessageQueueWorkflow extends EventDrivenWorkflow {
  private messageQueue: MessageQueueAdapter;
  
  constructor(config: WorkflowConfig, messageQueue: MessageQueueAdapter) {
    super(config);
    this.messageQueue = messageQueue;
  }
  
  async start(): Promise<void> {
    await super.start();
    
    // Subscribe to message queue events
    await this.messageQueue.subscribe('workflow.events', (message) => {
      this.emit(message.type, message.payload);
    });
  }
  
  async publishResult(taskName: string, result: any): Promise<void> {
    await this.messageQueue.publish('workflow.results', {
      workflowId: this.id,
      taskName,
      result,
      timestamp: new Date()
    });
  }
}

// Redis implementation
class RedisMessageQueueAdapter implements MessageQueueAdapter {
  private redis: Redis;
  
  constructor(redis: Redis) {
    this.redis = redis;
  }
  
  async subscribe(channel: string, handler: (message: any) => void): Promise<void> {
    await this.redis.subscribe(channel);
    this.redis.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        handler(JSON.parse(message));
      }
    });
  }
  
  async publish(channel: string, message: any): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(message));
  }
}
```

## 🧪 Testing Strategies

### Unit Testing Workflows
```typescript
import { WorkflowTestRunner, MockTask, TestContext } from 'chainly-sdk/testing';

describe('User Registration Workflow', () => {
  let testRunner: WorkflowTestRunner;
  let mockEmailService: jest.MockedObject<EmailService>;
  let mockUserRepository: jest.MockedObject<UserRepository>;
  
  beforeEach(() => {
    mockEmailService = createMockEmailService();
    mockUserRepository = createMockUserRepository();
    
    testRunner = new WorkflowTestRunner(userRegistrationWorkflow, {
      mocks: {
        emailService: mockEmailService,
        userRepository: mockUserRepository
      }
    });
  });
  
  it('should complete user registration successfully', async () => {
    // Arrange
    const testContext: UserRegistrationContext = {
      email: 'test@example.com',
      password: 'securePassword123',
      profile: { firstName: 'John', lastName: 'Doe' }
    };
    
    mockUserRepository.create.mockResolvedValue({ id: 'user-123' });
    mockEmailService.sendWelcomeEmail.mockResolvedValue(true);
    
    // Act
    const result = await testRunner.execute(testContext);
    
    // Assert
    expect(result.userId).toBe('user-123');
    expect(result.verified).toBe(true);
    expect(result.welcomeEmailSent).toBe(true);
    
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: expect.any(String), // hashed password
      profile: testContext.profile
    });
    
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      'test@example.com',
      'user-123'
    );
  });
  
  it('should handle validation errors gracefully', async () => {
    // Arrange
    const invalidContext: UserRegistrationContext = {
      email: 'invalid-email',
      password: '',
      profile: { firstName: 'John', lastName: 'Doe' }
    };
    
    // Act & Assert
    await expect(testRunner.execute(invalidContext))
      .rejects
      .toThrow('Invalid email format');
    
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
  });
});
```

### Integration Testing
```typescript
import { WorkflowIntegrationTester } from 'chainly-sdk/testing';

describe('Order Processing Integration', () => {
  let integrationTester: WorkflowIntegrationTester;
  let testDatabase: TestDatabase;
  let testMessageQueue: TestMessageQueue;
  
  beforeAll(async () => {
    testDatabase = await createTestDatabase();
    testMessageQueue = await createTestMessageQueue();
    
    integrationTester = new WorkflowIntegrationTester({
      database: testDatabase,
      messageQueue: testMessageQueue,
      timeout: 30000
    });
  });
  
  afterAll(async () => {
    await testDatabase.cleanup();
    await testMessageQueue.cleanup();
  });
  
  it('should process order end-to-end', async () => {
    // Arrange
    const orderData = await testDatabase.createTestOrder();
    
    // Act
    const result = await integrationTester.executeWorkflow(
      orderProcessingWorkflow,
      { orderId: orderData.id }
    );
    
    // Assert
    expect(result.success).toBe(true);
    
    const updatedOrder = await testDatabase.getOrder(orderData.id);
    expect(updatedOrder.status).toBe('processed');
    
    const queueMessages = await testMessageQueue.getMessages('order.events');
    expect(queueMessages).toHaveLength(3); // start, processing, completed
  });
});
```

This implementation guide provides comprehensive patterns for building robust, scalable workflows with Chainly SDK while maintaining enterprise-grade reliability and developer productivity. 