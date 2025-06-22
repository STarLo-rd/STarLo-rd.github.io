# API Reference

## 📚 Core API Documentation

This comprehensive API reference covers all classes, interfaces, and methods available in Chainly SDK.

## 🔧 Core Classes

### Workflow<TContext, TResult>

The main orchestration class for managing task execution and dependencies.

```typescript
class Workflow<TContext = any, TResult = any> {
  constructor(config: WorkflowConfig);
  
  // Task Management
  addTask<T>(task: Task<T>, options?: TaskOptions): void;
  addParallelGroup(group: ParallelGroup, options?: GroupOptions): void;
  addConditionalBranch(branch: ConditionalBranch): void;
  
  // Execution
  execute(context: TContext): Promise<WorkflowResult<TResult>>;
  executeAsync(context: TContext): Promise<WorkflowExecution>;
  
  // State Management
  getState(): WorkflowState;
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
  
  // Event Handling
  on(event: WorkflowEvent, handler: EventHandler): void;
  off(event: WorkflowEvent, handler: EventHandler): void;
  emit(event: WorkflowEvent, data: any): void;
  
  // Utility
  getExecutionPlan(): ExecutionPlan;
  getMetrics(): WorkflowMetrics;
  serialize(): SerializedWorkflow;
}
```

#### WorkflowConfig Interface
```typescript
interface WorkflowConfig {
  name: string;
  description?: string;
  version?: string;
  
  // Execution settings
  maxConcurrentTasks?: number;
  defaultTimeout?: number;
  defaultRetryPolicy?: RetryPolicy;
  
  // Error handling
  errorHandlingStrategy?: 'fail-fast' | 'continue-on-error' | 'custom';
  customErrorHandler?: ErrorHandler;
  
  // Middleware
  middleware?: Middleware[];
  
  // Monitoring
  enableMetrics?: boolean;
  enableTracing?: boolean;
  metricsCollector?: MetricsCollector;
  
  // Persistence
  enablePersistence?: boolean;
  persistenceAdapter?: PersistenceAdapter;
}
```

#### Usage Examples
```typescript
// Basic workflow creation
const workflow = new Workflow({
  name: 'data-processing',
  maxConcurrentTasks: 5,
  defaultTimeout: 30000
});

// With middleware
const workflow = new Workflow({
  name: 'secure-workflow',
  middleware: [
    new SecurityMiddleware(),
    new LoggingMiddleware(),
    new MetricsMiddleware()
  ]
});

// Execute workflow
const result = await workflow.execute({
  input: 'data',
  userId: 'user-123'
});
```

### Task<TInput, TOutput>

Represents an individual unit of work within a workflow.

```typescript
class Task<TInput = any, TOutput = any> {
  constructor(
    name: string,
    handler: TaskHandler<TInput, TOutput>,
    options?: TaskOptions
  );
  
  // Execution
  execute(context: WorkflowContext): Promise<TOutput>;
  
  // Dependencies
  dependsOn(...tasks: string[] | Task[]): Task<TInput, TOutput>;
  getDependencies(): string[];
  
  // Configuration
  setTimeout(timeout: number): Task<TInput, TOutput>;
  setRetryPolicy(policy: RetryPolicy): Task<TInput, TOutput>;
  setValidator(validator: Validator<TInput>): Task<TInput, TOutput>;
  
  // State
  getState(): TaskState;
  getMetrics(): TaskMetrics;
  
  // Events
  on(event: TaskEvent, handler: TaskEventHandler): void;
  off(event: TaskEvent, handler: TaskEventHandler): void;
}
```

#### TaskHandler Type
```typescript
type TaskHandler<TInput, TOutput> = (
  context: TaskExecutionContext<TInput>
) => Promise<TOutput> | TOutput;

interface TaskExecutionContext<TInput> {
  input: TInput;
  workflowContext: WorkflowContext;
  taskMetadata: TaskMetadata;
  
  // Utility methods
  getResult<T>(taskName: string): T | undefined;
  setResult(key: string, value: any): void;
  log(level: LogLevel, message: string, meta?: any): void;
  metric(name: string, value: number, tags?: Record<string, string>): void;
}
```

#### TaskOptions Interface
```typescript
interface TaskOptions {
  timeout?: number;
  retryPolicy?: RetryPolicy;
  validator?: Validator;
  middleware?: Middleware[];
  requiredPermissions?: string[];
  tags?: Record<string, string>;
  description?: string;
}
```

#### Usage Examples
```typescript
// Simple task
const validateTask = new Task('validate', async (context) => {
  return await validateInput(context.input);
});

// Task with options
const apiTask = new Task('api-call', async (context) => {
  return await fetchData(context.input.url);
}, {
  timeout: 10000,
  retryPolicy: {
    maxRetries: 3,
    backoffStrategy: 'exponential'
  },
  validator: urlValidator
});

// Task with dependencies
const processTask = new Task('process', handler)
  .dependsOn('validate', 'fetch-data')
  .setTimeout(15000);
```

### EventDrivenWorkflow

Extension of Workflow for event-based execution patterns.

```typescript
class EventDrivenWorkflow extends Workflow {
  constructor(config: EventDrivenWorkflowConfig);
  
  // Event Management
  on<T>(trigger: EventTrigger<T>, tasks: Task[] | TaskHandler): void;
  off<T>(trigger: EventTrigger<T>): void;
  emit<T>(eventType: string, payload: T): void;
  
  // Lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
  
  // Event Sources
  addEventSource(source: EventSource): void;
  removeEventSource(source: EventSource): void;
  
  // Filtering
  addGlobalFilter(filter: EventFilter): void;
  removeGlobalFilter(filter: EventFilter): void;
}
```

#### EventTrigger Class
```typescript
class EventTrigger<T = any> {
  constructor(config: EventTriggerConfig<T>);
  
  readonly type: string;
  readonly filter?: EventFilter<T>;
  readonly transform?: EventTransform<T>;
  readonly debounce?: number;
  readonly throttle?: number;
}

interface EventTriggerConfig<T> {
  type: string;
  filter?: (event: T) => boolean | Promise<boolean>;
  transform?: (event: T) => any;
  debounce?: number; // milliseconds
  throttle?: number; // milliseconds
}
```

#### Usage Examples
```typescript
// Event-driven workflow
const eventWorkflow = new EventDrivenWorkflow({
  name: 'payment-processor'
});

// Payment completion trigger
const paymentTrigger = new EventTrigger({
  type: 'payment.completed',
  filter: (event) => event.amount > 0 && event.status === 'success',
  transform: (event) => ({ orderId: event.orderId, amount: event.amount })
});

// Register event handler
eventWorkflow.on(paymentTrigger, [
  updateOrderTask,
  sendReceiptTask,
  updateInventoryTask
]);

// Start listening
await eventWorkflow.start();

// Emit events
eventWorkflow.emit('payment.completed', {
  orderId: 'order-123',
  amount: 99.99,
  status: 'success'
});
```

## 🔧 Utility Classes

### ParallelGroup

Groups tasks for concurrent execution.

```typescript
class ParallelGroup {
  constructor(tasks: Task[], options?: ParallelGroupOptions);
  
  addTask(task: Task): void;
  removeTask(taskName: string): void;
  getTasks(): Task[];
  
  execute(context: WorkflowContext): Promise<ParallelGroupResult>;
}

interface ParallelGroupOptions {
  maxConcurrency?: number;
  failFast?: boolean;
  aggregateResults?: boolean;
  timeout?: number;
}

interface ParallelGroupResult {
  success: boolean;
  results: Map<string, any>;
  errors: Map<string, Error>;
  executionTime: number;
}
```

### ConditionalBranch

Implements conditional workflow execution.

```typescript
class ConditionalBranch {
  constructor(config: ConditionalBranchConfig);
  
  addCondition(condition: BranchCondition): void;
  setFallback(tasks: Task[]): void;
  
  evaluate(context: WorkflowContext): Promise<Task[]>;
}

interface ConditionalBranchConfig {
  name: string;
  conditions: BranchCondition[];
  fallback?: Task[];
  evaluationStrategy?: 'first-match' | 'all-match' | 'priority';
}

interface BranchCondition {
  condition: (context: WorkflowContext) => boolean | Promise<boolean>;
  tasks: Task[];
  priority?: number;
  description?: string;
}
```

### RetryPolicy

Configures retry behavior for tasks and workflows.

```typescript
class RetryPolicy {
  constructor(config: RetryPolicyConfig);
  
  shouldRetry(error: Error, attempt: number): boolean;
  getDelay(attempt: number): number;
  getMaxRetries(): number;
}

interface RetryPolicyConfig {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed' | 'custom';
  initialDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
  customBackoff?: (attempt: number) => number;
}

// Usage examples
const exponentialRetry = new RetryPolicy({
  maxRetries: 5,
  backoffStrategy: 'exponential',
  initialDelay: 1000,
  maxDelay: 30000,
  retryCondition: (error) => error.code === 'NETWORK_ERROR'
});

const customRetry = new RetryPolicy({
  maxRetries: 3,
  backoffStrategy: 'custom',
  customBackoff: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000)
});
```

## 🛠️ Middleware System

### Middleware Base Class

```typescript
abstract class Middleware {
  abstract before(context: MiddlewareContext): Promise<void>;
  abstract after(context: MiddlewareContext, result: any): Promise<void>;
  abstract onError(error: Error, context: MiddlewareContext): Promise<void>;
  
  // Optional lifecycle methods
  onWorkflowStart?(workflow: Workflow): Promise<void>;
  onWorkflowComplete?(workflow: Workflow, result: any): Promise<void>;
  onWorkflowError?(workflow: Workflow, error: Error): Promise<void>;
}

interface MiddlewareContext {
  task: Task;
  workflow: Workflow;
  context: WorkflowContext;
  metadata: MiddlewareMetadata;
}

interface MiddlewareMetadata {
  executionId: string;
  startTime: Date;
  attempt: number;
  previousResults: Map<string, any>;
  tags: Record<string, string>;
}
```

### Built-in Middleware

#### LoggingMiddleware
```typescript
class LoggingMiddleware extends Middleware {
  constructor(config?: LoggingConfig);
  
  setLogLevel(level: LogLevel): void;
  setFormatter(formatter: LogFormatter): void;
  addTransport(transport: LogTransport): void;
}

interface LoggingConfig {
  level?: LogLevel;
  format?: 'json' | 'text' | 'structured';
  includeContext?: boolean;
  includeMetrics?: boolean;
  transports?: LogTransport[];
}
```

#### MetricsMiddleware
```typescript
class MetricsMiddleware extends Middleware {
  constructor(collector: MetricsCollector);
  
  recordCustomMetric(name: string, value: number, tags?: Record<string, string>): void;
  getMetrics(): MetricsSnapshot;
}

interface MetricsCollector {
  increment(metric: string, tags?: Record<string, string>): void;
  histogram(metric: string, value: number, tags?: Record<string, string>): void;
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  timer(metric: string): Timer;
}
```

#### SecurityMiddleware
```typescript
class SecurityMiddleware extends Middleware {
  constructor(config: SecurityConfig);
  
  validatePermissions(userId: string, permissions: string[]): Promise<boolean>;
  sanitizeInput(input: any): any;
  sanitizeOutput(output: any): any;
}

interface SecurityConfig {
  authenticationRequired?: boolean;
  permissionValidator?: PermissionValidator;
  inputSanitizer?: InputSanitizer;
  outputSanitizer?: OutputSanitizer;
  rateLimiter?: RateLimiter;
}
```

## 📊 Monitoring & Observability

### MetricsCollector Interface

```typescript
interface MetricsCollector {
  // Counter metrics
  increment(name: string, value?: number, tags?: Tags): void;
  decrement(name: string, value?: number, tags?: Tags): void;
  
  // Histogram metrics
  histogram(name: string, value: number, tags?: Tags): void;
  
  // Gauge metrics
  gauge(name: string, value: number, tags?: Tags): void;
  
  // Timing metrics
  timer(name: string, tags?: Tags): Timer;
  timing(name: string, duration: number, tags?: Tags): void;
  
  // Snapshot
  getSnapshot(): MetricsSnapshot;
  reset(): void;
}

interface Timer {
  stop(): number;
}

interface MetricsSnapshot {
  counters: Map<string, CounterMetric>;
  histograms: Map<string, HistogramMetric>;
  gauges: Map<string, GaugeMetric>;
  timers: Map<string, TimerMetric>;
  timestamp: Date;
}

type Tags = Record<string, string>;
```

### TraceCollector Interface

```typescript
interface TraceCollector {
  startSpan(name: string, parentSpan?: Span): Span;
  finishSpan(span: Span): void;
  
  addEvent(span: Span, name: string, attributes?: Record<string, any>): void;
  setTag(span: Span, key: string, value: any): void;
  
  getActiveSpan(): Span | null;
  setActiveSpan(span: Span): void;
}

interface Span {
  readonly id: string;
  readonly traceId: string;
  readonly parentId?: string;
  readonly name: string;
  readonly startTime: Date;
  
  setTag(key: string, value: any): void;
  addEvent(name: string, attributes?: Record<string, any>): void;
  finish(): void;
}
```

## 🔧 Configuration & Setup

### ChainlyConfig Interface

```typescript
interface ChainlyConfig {
  // Global settings
  maxConcurrentWorkflows?: number;
  maxConcurrentTasks?: number;
  defaultTimeout?: number;
  
  // Memory management
  memoryLimit?: number; // MB
  gcThreshold?: number; // Percentage
  contextCleanupThreshold?: number;
  
  // Error handling
  defaultRetryPolicy?: RetryPolicy;
  globalErrorHandler?: ErrorHandler;
  enableCircuitBreaker?: boolean;
  
  // Monitoring
  enableMetrics?: boolean;
  enableTracing?: boolean;
  metricsCollector?: MetricsCollector;
  traceCollector?: TraceCollector;
  
  // Persistence
  enablePersistence?: boolean;
  persistenceAdapter?: PersistenceAdapter;
  
  // Security
  enableSecurity?: boolean;
  securityConfig?: SecurityConfig;
  
  // Development
  enableDebugMode?: boolean;
  logLevel?: LogLevel;
}
```

### Initialization

```typescript
import { Chainly, ChainlyConfig } from 'chainly-sdk';

// Initialize with configuration
const config: ChainlyConfig = {
  maxConcurrentWorkflows: 10,
  maxConcurrentTasks: 50,
  enableMetrics: true,
  enableTracing: true,
  defaultRetryPolicy: {
    maxRetries: 3,
    backoffStrategy: 'exponential'
  }
};

Chainly.initialize(config);

// Create workflow factory
const workflowFactory = Chainly.createWorkflowFactory();

// Create workflow
const workflow = workflowFactory.create({
  name: 'my-workflow'
});
```

## 🔍 Error Handling

### Error Types

```typescript
// Base error class
class ChainlyError extends Error {
  readonly code: string;
  readonly context?: any;
  readonly timestamp: Date;
  
  constructor(message: string, code: string, context?: any);
}

// Specific error types
class TaskExecutionError extends ChainlyError {}
class DependencyResolutionError extends ChainlyError {}
class ValidationError extends ChainlyError {}
class TimeoutError extends ChainlyError {}
class SecurityError extends ChainlyError {}
class ConfigurationError extends ChainlyError {}
```

### Error Handler Interface

```typescript
interface ErrorHandler {
  handle(error: Error, context: ErrorContext): Promise<ErrorHandlingResult>;
}

interface ErrorContext {
  task?: Task;
  workflow: Workflow;
  workflowContext: WorkflowContext;
  attempt: number;
  previousErrors: Error[];
}

interface ErrorHandlingResult {
  action: 'retry' | 'skip' | 'fail' | 'fallback';
  delay?: number;
  fallbackResult?: any;
  metadata?: Record<string, any>;
}
```

## 📝 Type Definitions

### Core Types

```typescript
// Workflow states
enum WorkflowState {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Task states
enum TaskState {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying'
}

// Log levels
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Event types
type WorkflowEvent = 'started' | 'completed' | 'failed' | 'paused' | 'resumed' | 'cancelled';
type TaskEvent = 'started' | 'completed' | 'failed' | 'retrying' | 'skipped';
```

This API reference provides comprehensive documentation for all Chainly SDK components, enabling developers to build sophisticated workflow orchestration systems with confidence. 