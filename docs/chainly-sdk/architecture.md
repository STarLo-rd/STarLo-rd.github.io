# Technical Architecture

## 🏗️ System Design Overview

Chainly SDK is built on a modular, event-driven architecture that prioritizes type safety, performance, and extensibility. The system is designed to handle complex workflow orchestration while maintaining simplicity for developers and reliability for production environments.

## 🔧 Core Architecture Patterns

### Event-Driven Architecture
The SDK leverages Node.js EventEmitter patterns for reactive programming:

```typescript
interface WorkflowEvent {
  type: 'task:started' | 'task:completed' | 'task:failed' | 'workflow:completed';
  payload: {
    taskId?: string;
    workflowId: string;
    timestamp: Date;
    context?: any;
    error?: Error;
  };
}

class EventBus extends EventEmitter {
  private static instance: EventBus;
  
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  emit<T extends WorkflowEvent>(event: T['type'], payload: T['payload']): boolean {
    return super.emit(event, payload);
  }
}
```

### Dependency Injection Pattern
```typescript
interface ITaskExecutor {
  execute<T>(task: Task<T>, context: WorkflowContext): Promise<T>;
}

interface IErrorHandler {
  handle(error: Error, context: WorkflowContext): Promise<void>;
}

class WorkflowContainer {
  private services = new Map<string, any>();
  
  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
  }
  
  resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service ${token} not found`);
    }
    return service;
  }
}
```

## 🧩 Core Components Architecture

### 1. Workflow Engine

#### Workflow State Machine
```typescript
enum WorkflowState {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface WorkflowStateMachine {
  currentState: WorkflowState;
  transitions: Map<WorkflowState, WorkflowState[]>;
  
  canTransition(to: WorkflowState): boolean;
  transition(to: WorkflowState): void;
}

class Workflow<TContext = any, TResult = any> {
  private stateMachine: WorkflowStateMachine;
  private tasks: Map<string, Task>;
  private dependencyGraph: DependencyGraph;
  private executionPlan: ExecutionPlan;
  
  constructor(private config: WorkflowConfig) {
    this.stateMachine = new WorkflowStateMachine();
    this.tasks = new Map();
    this.dependencyGraph = new DependencyGraph();
  }
  
  async execute(context: TContext): Promise<TResult> {
    this.stateMachine.transition(WorkflowState.RUNNING);
    
    try {
      const plan = await this.generateExecutionPlan();
      const result = await this.executeplan(plan, context);
      
      this.stateMachine.transition(WorkflowState.COMPLETED);
      return result;
    } catch (error) {
      this.stateMachine.transition(WorkflowState.FAILED);
      throw error;
    }
  }
}
```

#### Dependency Resolution Algorithm
```typescript
class DependencyGraph {
  private adjacencyList: Map<string, Set<string>> = new Map();
  private inDegree: Map<string, number> = new Map();
  
  addDependency(task: string, dependency: string): void {
    if (!this.adjacencyList.has(dependency)) {
      this.adjacencyList.set(dependency, new Set());
    }
    
    this.adjacencyList.get(dependency)!.add(task);
    this.inDegree.set(task, (this.inDegree.get(task) || 0) + 1);
  }
  
  topologicalSort(): string[] {
    const result: string[] = [];
    const queue: string[] = [];
    
    // Find all nodes with no incoming edges
    for (const [task, degree] of this.inDegree) {
      if (degree === 0) {
        queue.push(task);
      }
    }
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      
      const dependents = this.adjacencyList.get(current) || new Set();
      for (const dependent of dependents) {
        this.inDegree.set(dependent, this.inDegree.get(dependent)! - 1);
        
        if (this.inDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      }
    }
    
    // Check for circular dependencies
    if (result.length !== this.inDegree.size) {
      throw new Error('Circular dependency detected');
    }
    
    return result;
  }
}
```

### 2. Task Management System

#### Task Abstraction Layer
```typescript
interface TaskDefinition<TInput = any, TOutput = any> {
  name: string;
  handler: TaskHandler<TInput, TOutput>;
  dependencies?: string[];
  retryPolicy?: RetryPolicy;
  timeout?: number;
  validation?: ValidationSchema;
}

abstract class Task<TInput = any, TOutput = any> {
  protected readonly id: string;
  protected readonly name: string;
  protected state: TaskState = TaskState.PENDING;
  protected retryCount: number = 0;
  
  constructor(protected definition: TaskDefinition<TInput, TOutput>) {
    this.id = generateUUID();
    this.name = definition.name;
  }
  
  abstract execute(context: WorkflowContext): Promise<TOutput>;
  
  protected async validateInput(input: TInput): Promise<void> {
    if (this.definition.validation) {
      await this.definition.validation.validate(input);
    }
  }
  
  protected async handleRetry(error: Error): Promise<boolean> {
    if (!this.definition.retryPolicy) return false;
    
    const { maxRetries, backoffStrategy, retryCondition } = this.definition.retryPolicy;
    
    if (this.retryCount >= maxRetries) return false;
    if (retryCondition && !retryCondition(error)) return false;
    
    this.retryCount++;
    
    const delay = this.calculateBackoffDelay(backoffStrategy, this.retryCount);
    await this.sleep(delay);
    
    return true;
  }
  
  private calculateBackoffDelay(strategy: BackoffStrategy, attempt: number): number {
    switch (strategy) {
      case 'linear':
        return attempt * 1000;
      case 'exponential':
        return Math.pow(2, attempt) * 1000;
      case 'fixed':
        return 1000;
      default:
        return 1000;
    }
  }
}
```

#### Task Execution Engine
```typescript
class TaskExecutor {
  private readonly concurrencyLimit: number;
  private readonly activeExecutions: Map<string, Promise<any>>;
  private readonly executionPool: Semaphore;
  
  constructor(concurrencyLimit: number = 10) {
    this.concurrencyLimit = concurrencyLimit;
    this.activeExecutions = new Map();
    this.executionPool = new Semaphore(concurrencyLimit);
  }
  
  async execute<T>(task: Task<T>, context: WorkflowContext): Promise<T> {
    await this.executionPool.acquire();
    
    try {
      const execution = this.executeWithTimeout(task, context);
      this.activeExecutions.set(task.id, execution);
      
      const result = await execution;
      return result;
    } finally {
      this.activeExecutions.delete(task.id);
      this.executionPool.release();
    }
  }
  
  private async executeWithTimeout<T>(
    task: Task<T>, 
    context: WorkflowContext
  ): Promise<T> {
    const timeout = task.definition.timeout || 30000;
    
    return Promise.race([
      task.execute(context),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TimeoutError(`Task ${task.name} timed out`)), timeout);
      })
    ]);
  }
}
```

### 3. Context Management

#### Context Propagation System
```typescript
interface WorkflowContext {
  readonly id: string;
  readonly startTime: Date;
  data: Record<string, any>;
  metadata: ContextMetadata;
}

interface ContextMetadata {
  userId?: string;
  correlationId: string;
  traceId: string;
  parentSpanId?: string;
}

class ContextManager {
  private contextStack: WorkflowContext[] = [];
  
  createContext(initialData: Record<string, any> = {}): WorkflowContext {
    const context: WorkflowContext = {
      id: generateUUID(),
      startTime: new Date(),
      data: { ...initialData },
      metadata: {
        correlationId: generateUUID(),
        traceId: generateTraceId(),
        parentSpanId: this.getCurrentSpanId()
      }
    };
    
    this.contextStack.push(context);
    return context;
  }
  
  getCurrentContext(): WorkflowContext | null {
    return this.contextStack[this.contextStack.length - 1] || null;
  }
  
  updateContext(updates: Partial<WorkflowContext['data']>): void {
    const current = this.getCurrentContext();
    if (current) {
      Object.assign(current.data, updates);
    }
  }
  
  destroyContext(): void {
    this.contextStack.pop();
  }
}
```

### 4. Middleware Pipeline

#### Middleware Architecture
```typescript
interface MiddlewareContext {
  task: Task;
  workflow: Workflow;
  context: WorkflowContext;
  metadata: MiddlewareMetadata;
}

interface MiddlewareMetadata {
  startTime: Date;
  executionId: string;
  previousResults: Map<string, any>;
}

abstract class Middleware {
  abstract before(context: MiddlewareContext): Promise<void>;
  abstract after(context: MiddlewareContext, result: any): Promise<void>;
  abstract onError(error: Error, context: MiddlewareContext): Promise<void>;
}

class MiddlewarePipeline {
  private middlewares: Middleware[] = [];
  
  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }
  
  async executeBefore(context: MiddlewareContext): Promise<void> {
    for (const middleware of this.middlewares) {
      await middleware.before(context);
    }
  }
  
  async executeAfter(context: MiddlewareContext, result: any): Promise<void> {
    // Execute in reverse order
    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      await this.middlewares[i].after(context, result);
    }
  }
  
  async executeOnError(error: Error, context: MiddlewareContext): Promise<void> {
    for (const middleware of this.middlewares) {
      await middleware.onError(error, context);
    }
  }
}
```

#### Built-in Middleware Examples
```typescript
class LoggingMiddleware extends Middleware {
  async before(context: MiddlewareContext): Promise<void> {
    console.log(`[${context.metadata.executionId}] Starting task: ${context.task.name}`);
    context.metadata.startTime = new Date();
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    const duration = Date.now() - context.metadata.startTime.getTime();
    console.log(`[${context.metadata.executionId}] Task ${context.task.name} completed in ${duration}ms`);
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    console.error(`[${context.metadata.executionId}] Task ${context.task.name} failed:`, error);
  }
}

class MetricsMiddleware extends Middleware {
  private metrics: MetricsCollector;
  
  constructor(metrics: MetricsCollector) {
    super();
    this.metrics = metrics;
  }
  
  async before(context: MiddlewareContext): Promise<void> {
    this.metrics.increment('task.started', {
      taskName: context.task.name,
      workflowId: context.workflow.id
    });
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    const duration = Date.now() - context.metadata.startTime.getTime();
    
    this.metrics.histogram('task.duration', duration, {
      taskName: context.task.name,
      workflowId: context.workflow.id
    });
    
    this.metrics.increment('task.completed', {
      taskName: context.task.name,
      workflowId: context.workflow.id
    });
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    this.metrics.increment('task.failed', {
      taskName: context.task.name,
      workflowId: context.workflow.id,
      errorType: error.constructor.name
    });
  }
}
```

## 🔄 Advanced Patterns

### Conditional Execution Engine
```typescript
interface ConditionalBranch<T = any> {
  condition: (context: WorkflowContext) => boolean | Promise<boolean>;
  tasks: Task<T>[];
  fallback?: Task<T>[];
}

class ConditionalExecutor {
  async evaluateBranches<T>(
    branches: ConditionalBranch<T>[], 
    context: WorkflowContext
  ): Promise<Task<T>[]> {
    for (const branch of branches) {
      const shouldExecute = await branch.condition(context);
      if (shouldExecute) {
        return branch.tasks;
      }
    }
    
    // Return fallback if no conditions match
    const fallbackBranch = branches.find(b => b.fallback);
    return fallbackBranch?.fallback || [];
  }
}
```

### Parallel Execution Coordinator
```typescript
class ParallelExecutor {
  async executeParallel<T>(
    tasks: Task<T>[], 
    context: WorkflowContext,
    options: ParallelExecutionOptions = {}
  ): Promise<T[]> {
    const { maxConcurrency = Infinity, failFast = true } = options;
    
    const semaphore = new Semaphore(maxConcurrency);
    const promises = tasks.map(async (task) => {
      await semaphore.acquire();
      try {
        return await task.execute(context);
      } finally {
        semaphore.release();
      }
    });
    
    if (failFast) {
      return Promise.all(promises);
    } else {
      return Promise.allSettled(promises).then(results => 
        results.map(result => 
          result.status === 'fulfilled' ? result.value : null
        ).filter(Boolean)
      );
    }
  }
}
```

## 📊 Performance Optimizations

### Memory Management
```typescript
class MemoryManager {
  private readonly maxMemoryUsage: number;
  private readonly gcThreshold: number;
  
  constructor(maxMemoryMB: number = 512) {
    this.maxMemoryUsage = maxMemoryMB * 1024 * 1024;
    this.gcThreshold = this.maxMemoryUsage * 0.8;
  }
  
  checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > this.gcThreshold) {
      global.gc?.();
    }
    
    if (usage.heapUsed > this.maxMemoryUsage) {
      throw new Error('Memory limit exceeded');
    }
  }
  
  optimizeContext(context: WorkflowContext): void {
    // Remove large objects from context after task completion
    for (const [key, value] of Object.entries(context.data)) {
      if (this.isLargeObject(value)) {
        delete context.data[key];
      }
    }
  }
  
  private isLargeObject(obj: any): boolean {
    const size = JSON.stringify(obj).length;
    return size > 1024 * 1024; // 1MB threshold
  }
}
```

### Execution Plan Optimization
```typescript
class ExecutionPlanOptimizer {
  optimize(tasks: Task[], dependencies: DependencyGraph): ExecutionPlan {
    const sortedTasks = dependencies.topologicalSort();
    const parallelGroups = this.identifyParallelGroups(sortedTasks, dependencies);
    
    return new ExecutionPlan(parallelGroups);
  }
  
  private identifyParallelGroups(
    sortedTasks: string[], 
    dependencies: DependencyGraph
  ): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();
    
    for (const task of sortedTasks) {
      if (processed.has(task)) continue;
      
      const group = this.findParallelGroup(task, sortedTasks, dependencies, processed);
      groups.push(group);
      
      group.forEach(t => processed.add(t));
    }
    
    return groups;
  }
  
  private findParallelGroup(
    startTask: string,
    allTasks: string[],
    dependencies: DependencyGraph,
    processed: Set<string>
  ): string[] {
    const group = [startTask];
    const startDeps = dependencies.getDependencies(startTask);
    
    for (const task of allTasks) {
      if (processed.has(task) || task === startTask) continue;
      
      const taskDeps = dependencies.getDependencies(task);
      
      // Can run in parallel if dependencies are the same or subset
      if (this.canRunInParallel(startDeps, taskDeps)) {
        group.push(task);
      }
    }
    
    return group;
  }
}
```

This architecture ensures Chainly SDK provides enterprise-grade workflow orchestration while maintaining developer-friendly APIs and high-performance execution patterns. 