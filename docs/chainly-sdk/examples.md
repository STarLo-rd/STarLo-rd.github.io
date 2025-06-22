# Examples & Tutorials

## 🎓 Learning Path

This section provides hands-on examples and tutorials to master Chainly SDK, from basic concepts to advanced enterprise patterns.

## 🚀 Quick Start Examples

### Example 1: Simple Sequential Workflow

Let's start with a basic file processing workflow that validates, processes, and saves a file.

```typescript
import { Workflow, Task } from 'chainly-sdk';

interface FileProcessingContext {
  filePath: string;
  outputPath: string;
  options: ProcessingOptions;
}

// Step 1: Define individual tasks
const validateFileTask = new Task('validate-file', async (context) => {
  const { filePath } = context.input;
  
  // Check if file exists
  if (!await fileExists(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  // Check file size
  const stats = await getFileStats(filePath);
  if (stats.size > 100 * 1024 * 1024) { // 100MB limit
    throw new Error('File too large');
  }
  
  return { valid: true, size: stats.size };
});

const processFileTask = new Task('process-file', async (context) => {
  const { filePath, options } = context.input;
  const validationResult = context.getResult('validate-file');
  
  console.log(`Processing file of size: ${validationResult.size} bytes`);
  
  // Simulate file processing
  const processedData = await processFile(filePath, options);
  
  return { 
    processedData, 
    processingTime: Date.now() 
  };
});

const saveFileTask = new Task('save-file', async (context) => {
  const { outputPath } = context.input;
  const processResult = context.getResult('process-file');
  
  await saveToFile(outputPath, processResult.processedData);
  
  return { 
    saved: true, 
    outputPath,
    timestamp: new Date()
  };
});

// Step 2: Create and configure workflow
const fileProcessingWorkflow = new Workflow<FileProcessingContext>({
  name: 'file-processing-pipeline',
  description: 'Validates, processes, and saves files'
});

// Step 3: Add tasks with dependencies
fileProcessingWorkflow.addTask(validateFileTask);
fileProcessingWorkflow.addTask(processFileTask, { dependsOn: ['validate-file'] });
fileProcessingWorkflow.addTask(saveFileTask, { dependsOn: ['process-file'] });

// Step 4: Execute workflow
async function processFile(filePath: string, outputPath: string) {
  try {
    const result = await fileProcessingWorkflow.execute({
      filePath,
      outputPath,
      options: { quality: 'high', format: 'json' }
    });
    
    console.log('File processing completed:', result);
    return result;
  } catch (error) {
    console.error('File processing failed:', error);
    throw error;
  }
}

// Usage
await processFile('./input.txt', './output.json');
```

### Example 2: Parallel Data Processing

This example shows how to process multiple data sources concurrently.

```typescript
import { Workflow, Task, ParallelGroup } from 'chainly-sdk';

interface DataAggregationContext {
  sources: DataSource[];
  aggregationRules: AggregationRules;
}

// Define data fetching tasks
const fetchUserDataTask = new Task('fetch-users', async (context) => {
  const userSource = context.input.sources.find(s => s.type === 'users');
  return await fetchFromAPI(userSource.url, userSource.auth);
});

const fetchOrderDataTask = new Task('fetch-orders', async (context) => {
  const orderSource = context.input.sources.find(s => s.type === 'orders');
  return await fetchFromAPI(orderSource.url, orderSource.auth);
});

const fetchProductDataTask = new Task('fetch-products', async (context) => {
  const productSource = context.input.sources.find(s => s.type === 'products');
  return await fetchFromAPI(productSource.url, productSource.auth);
});

// Create parallel group for concurrent data fetching
const dataFetchingGroup = new ParallelGroup([
  fetchUserDataTask,
  fetchOrderDataTask,
  fetchProductDataTask
], {
  maxConcurrency: 3,
  failFast: false, // Continue even if one source fails
  timeout: 30000
});

// Aggregation task that runs after all data is fetched
const aggregateDataTask = new Task('aggregate-data', async (context) => {
  const users = context.getResult('fetch-users') || [];
  const orders = context.getResult('fetch-orders') || [];
  const products = context.getResult('fetch-products') || [];
  
  // Perform data aggregation
  const aggregatedData = {
    userCount: users.length,
    orderCount: orders.length,
    productCount: products.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    topProducts: findTopProducts(orders, products),
    userMetrics: calculateUserMetrics(users, orders)
  };
  
  return aggregatedData;
});

// Create workflow
const dataAggregationWorkflow = new Workflow<DataAggregationContext>({
  name: 'data-aggregation',
  maxConcurrentTasks: 5
});

dataAggregationWorkflow.addParallelGroup(dataFetchingGroup);
dataAggregationWorkflow.addTask(aggregateDataTask, { 
  dependsOn: ['fetch-users', 'fetch-orders', 'fetch-products'] 
});

// Execute workflow
const result = await dataAggregationWorkflow.execute({
  sources: [
    { type: 'users', url: 'https://api.example.com/users', auth: 'token123' },
    { type: 'orders', url: 'https://api.example.com/orders', auth: 'token123' },
    { type: 'products', url: 'https://api.example.com/products', auth: 'token123' }
  ],
  aggregationRules: { includeMetrics: true }
});

console.log('Aggregated data:', result);
```

## 🔄 Advanced Workflow Patterns

### Example 3: Conditional Workflow with Dynamic Branching

This example demonstrates dynamic workflow execution based on runtime conditions.

```typescript
import { Workflow, Task, ConditionalBranch } from 'chainly-sdk';

interface OrderProcessingContext {
  order: Order;
  customer: Customer;
  inventory: InventoryStatus;
}

// Define different processing paths
const standardProcessingTask = new Task('standard-processing', async (context) => {
  const { order } = context.input;
  
  // Standard processing logic
  await validateOrder(order);
  await reserveInventory(order.items);
  await calculateShipping(order);
  
  return {
    processingType: 'standard',
    estimatedDelivery: addDays(new Date(), 5),
    shippingCost: 9.99
  };
});

const expressProcessingTask = new Task('express-processing', async (context) => {
  const { order } = context.input;
  
  // Express processing logic
  await validateOrder(order);
  await reserveInventory(order.items, { priority: 'high' });
  await calculateExpressShipping(order);
  
  return {
    processingType: 'express',
    estimatedDelivery: addDays(new Date(), 2),
    shippingCost: 24.99
  };
});

const premiumProcessingTask = new Task('premium-processing', async (context) => {
  const { order, customer } = context.input;
  
  // Premium processing with additional services
  await validateOrder(order);
  await reserveInventory(order.items, { priority: 'highest' });
  await assignPersonalShopper(customer.id);
  await calculatePremiumShipping(order);
  
  return {
    processingType: 'premium',
    estimatedDelivery: addDays(new Date(), 1),
    shippingCost: 0, // Free for premium
    personalShopper: true
  };
});

const inventoryCheckTask = new Task('inventory-check', async (context) => {
  const { order, inventory } = context.input;
  
  // Check if all items are available
  const availability = await checkItemAvailability(order.items, inventory);
  
  return {
    allAvailable: availability.every(item => item.available),
    partiallyAvailable: availability.some(item => item.available),
    unavailableItems: availability.filter(item => !item.available)
  };
});

// Create conditional branches
const processingBranch = new ConditionalBranch({
  name: 'processing-type-selection',
  conditions: [
    {
      condition: (context) => {
        const { customer, order } = context.input;
        return customer.tier === 'premium' && order.total > 500;
      },
      tasks: [premiumProcessingTask],
      priority: 1
    },
    {
      condition: (context) => {
        const { order } = context.input;
        return order.expressShipping === true;
      },
      tasks: [expressProcessingTask],
      priority: 2
    }
  ],
  fallback: [standardProcessingTask]
});

const inventoryBranch = new ConditionalBranch({
  name: 'inventory-handling',
  conditions: [
    {
      condition: (context) => {
        const inventoryResult = context.getResult('inventory-check');
        return !inventoryResult.allAvailable;
      },
      tasks: [
        new Task('handle-backorder', async (context) => {
          const inventoryResult = context.getResult('inventory-check');
          await createBackorder(inventoryResult.unavailableItems);
          await notifyCustomer(context.input.customer, 'backorder');
          return { backorderCreated: true };
        })
      ]
    }
  ],
  fallback: [] // No action needed if all items available
});

// Create workflow
const orderProcessingWorkflow = new Workflow<OrderProcessingContext>({
  name: 'conditional-order-processing'
});

orderProcessingWorkflow.addTask(inventoryCheckTask);
orderProcessingWorkflow.addConditionalBranch(inventoryBranch, { dependsOn: ['inventory-check'] });
orderProcessingWorkflow.addConditionalBranch(processingBranch, { dependsOn: ['inventory-check'] });

// Execute workflow
const orderResult = await orderProcessingWorkflow.execute({
  order: {
    id: 'order-123',
    items: [{ id: 'item-1', quantity: 2 }],
    total: 750,
    expressShipping: false
  },
  customer: {
    id: 'customer-456',
    tier: 'premium',
    email: 'customer@example.com'
  },
  inventory: {
    warehouse: 'main',
    lastUpdated: new Date()
  }
});

console.log('Order processing result:', orderResult);
```

### Example 4: Event-Driven Workflow

This example shows how to create reactive workflows that respond to real-time events.

```typescript
import { EventDrivenWorkflow, EventTrigger, Task } from 'chainly-sdk';

interface PaymentEventData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: Date;
}

interface UserEventData {
  userId: string;
  action: 'login' | 'logout' | 'purchase' | 'support_request';
  metadata: Record<string, any>;
  timestamp: Date;
}

// Define event-triggered tasks
const processPaymentTask = new Task('process-payment', async (context) => {
  const { paymentId, orderId, amount } = context.input;
  
  // Update order status
  await updateOrderStatus(orderId, 'paid');
  
  // Send confirmation email
  await sendPaymentConfirmation(paymentId);
  
  // Update analytics
  await recordPaymentMetrics(amount);
  
  return { processed: true, orderId, amount };
});

const handlePaymentFailureTask = new Task('handle-payment-failure', async (context) => {
  const { paymentId, orderId } = context.input;
  
  // Update order status
  await updateOrderStatus(orderId, 'payment-failed');
  
  // Notify customer
  await sendPaymentFailureNotification(paymentId);
  
  // Create support ticket
  await createSupportTicket({
    type: 'payment-failure',
    paymentId,
    orderId
  });
  
  return { handled: true, supportTicketCreated: true };
});

const processRefundTask = new Task('process-refund', async (context) => {
  const { paymentId, orderId, amount } = context.input;
  
  // Process refund
  await initiateRefund(paymentId, amount);
  
  // Update order status
  await updateOrderStatus(orderId, 'refunded');
  
  // Send refund confirmation
  await sendRefundConfirmation(paymentId);
  
  return { refunded: true, amount };
});

const trackUserActivityTask = new Task('track-user-activity', async (context) => {
  const { userId, action, metadata } = context.input;
  
  // Record activity
  await recordUserActivity(userId, action, metadata);
  
  // Update user profile
  await updateUserLastActivity(userId);
  
  // Trigger recommendations if purchase
  if (action === 'purchase') {
    await triggerRecommendationEngine(userId, metadata.items);
  }
  
  return { tracked: true, action };
});

// Create event-driven workflow
const eventProcessingWorkflow = new EventDrivenWorkflow({
  name: 'real-time-event-processor',
  description: 'Processes payment and user events in real-time'
});

// Define event triggers with filters
const paymentCompletedTrigger = new EventTrigger<PaymentEventData>({
  type: 'payment.completed',
  filter: (event) => event.status === 'completed' && event.amount > 0,
  transform: (event) => ({
    paymentId: event.paymentId,
    orderId: event.orderId,
    amount: event.amount
  })
});

const paymentFailedTrigger = new EventTrigger<PaymentEventData>({
  type: 'payment.failed',
  filter: (event) => event.status === 'failed',
  debounce: 5000 // Wait 5 seconds to avoid duplicate processing
});

const paymentRefundedTrigger = new EventTrigger<PaymentEventData>({
  type: 'payment.refunded',
  filter: (event) => event.status === 'refunded'
});

const userActivityTrigger = new EventTrigger<UserEventData>({
  type: 'user.activity',
  throttle: 1000 // Limit to once per second per user
});

// Register event handlers
eventProcessingWorkflow.on(paymentCompletedTrigger, [processPaymentTask]);
eventProcessingWorkflow.on(paymentFailedTrigger, [handlePaymentFailureTask]);
eventProcessingWorkflow.on(paymentRefundedTrigger, [processRefundTask]);
eventProcessingWorkflow.on(userActivityTrigger, [trackUserActivityTask]);

// Start the event-driven workflow
await eventProcessingWorkflow.start();

// Simulate events (in real applications, these would come from external systems)
setTimeout(() => {
  eventProcessingWorkflow.emit('payment.completed', {
    paymentId: 'pay_123',
    orderId: 'order_456',
    amount: 99.99,
    currency: 'USD',
    status: 'completed',
    timestamp: new Date()
  });
}, 1000);

setTimeout(() => {
  eventProcessingWorkflow.emit('user.activity', {
    userId: 'user_789',
    action: 'purchase',
    metadata: { items: ['item1', 'item2'], total: 99.99 },
    timestamp: new Date()
  });
}, 2000);

console.log('Event-driven workflow started and listening for events...');
```

## 🛠️ Middleware Examples

### Example 5: Custom Middleware Implementation

This example shows how to create and use custom middleware for cross-cutting concerns.

```typescript
import { Middleware, MiddlewareContext, Workflow, Task } from 'chainly-sdk';

// Custom Performance Monitoring Middleware
class PerformanceMiddleware extends Middleware {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  
  async before(context: MiddlewareContext): Promise<void> {
    const { task } = context;
    
    // Start performance tracking
    context.metadata.performanceStart = process.hrtime.bigint();
    context.metadata.memoryStart = process.memoryUsage();
    
    console.log(`🚀 Starting task: ${task.name}`);
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    const { task } = context;
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const executionTime = Number(endTime - context.metadata.performanceStart) / 1000000; // Convert to ms
    const memoryDelta = endMemory.heapUsed - context.metadata.memoryStart.heapUsed;
    
    const metric: PerformanceMetric = {
      taskName: task.name,
      executionTime,
      memoryDelta,
      timestamp: new Date(),
      success: true
    };
    
    this.recordMetric(task.name, metric);
    
    console.log(`✅ Task ${task.name} completed in ${executionTime.toFixed(2)}ms (Memory: ${this.formatBytes(memoryDelta)})`);
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    const { task } = context;
    const endTime = process.hrtime.bigint();
    const executionTime = Number(endTime - context.metadata.performanceStart) / 1000000;
    
    const metric: PerformanceMetric = {
      taskName: task.name,
      executionTime,
      memoryDelta: 0,
      timestamp: new Date(),
      success: false,
      error: error.message
    };
    
    this.recordMetric(task.name, metric);
    
    console.error(`❌ Task ${task.name} failed after ${executionTime.toFixed(2)}ms: ${error.message}`);
  }
  
  private recordMetric(taskName: string, metric: PerformanceMetric): void {
    if (!this.metrics.has(taskName)) {
      this.metrics.set(taskName, []);
    }
    this.metrics.get(taskName)!.push(metric);
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  getMetricsSummary(): Record<string, MetricsSummary> {
    const summary: Record<string, MetricsSummary> = {};
    
    for (const [taskName, metrics] of this.metrics) {
      const successfulMetrics = metrics.filter(m => m.success);
      const failedMetrics = metrics.filter(m => !m.success);
      
      summary[taskName] = {
        totalExecutions: metrics.length,
        successfulExecutions: successfulMetrics.length,
        failedExecutions: failedMetrics.length,
        averageExecutionTime: successfulMetrics.reduce((sum, m) => sum + m.executionTime, 0) / successfulMetrics.length || 0,
        totalMemoryUsage: successfulMetrics.reduce((sum, m) => sum + m.memoryDelta, 0),
        successRate: (successfulMetrics.length / metrics.length) * 100
      };
    }
    
    return summary;
  }
}

// Custom Retry Middleware with Exponential Backoff
class SmartRetryMiddleware extends Middleware {
  private retryAttempts: Map<string, number> = new Map();
  
  constructor(private maxRetries: number = 3) {
    super();
  }
  
  async before(context: MiddlewareContext): Promise<void> {
    const key = `${context.workflow.id}-${context.task.name}`;
    const attempts = this.retryAttempts.get(key) || 0;
    
    if (attempts > 0) {
      const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000); // Exponential backoff, max 10s
      console.log(`⏳ Retrying task ${context.task.name} (attempt ${attempts + 1}) after ${delay}ms delay`);
      await this.sleep(delay);
    }
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    // Reset retry count on success
    const key = `${context.workflow.id}-${context.task.name}`;
    this.retryAttempts.delete(key);
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    const key = `${context.workflow.id}-${context.task.name}`;
    const attempts = this.retryAttempts.get(key) || 0;
    
    if (attempts < this.maxRetries && this.shouldRetry(error)) {
      this.retryAttempts.set(key, attempts + 1);
      console.log(`🔄 Will retry task ${context.task.name} (attempt ${attempts + 1}/${this.maxRetries})`);
      
      // Re-execute the task
      setTimeout(async () => {
        try {
          await context.task.execute(context.context);
        } catch (retryError) {
          await this.onError(retryError, context);
        }
      }, 0);
    } else {
      console.error(`💥 Task ${context.task.name} failed permanently after ${attempts + 1} attempts`);
      this.retryAttempts.delete(key);
    }
  }
  
  private shouldRetry(error: Error): boolean {
    // Define retry conditions
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'TEMPORARY_FAILURE'];
    return retryableErrors.some(errorType => error.message.includes(errorType));
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example with custom middleware
const performanceMiddleware = new PerformanceMiddleware();
const retryMiddleware = new SmartRetryMiddleware(3);

const workflowWithMiddleware = new Workflow({
  name: 'middleware-example',
  middleware: [performanceMiddleware, retryMiddleware]
});

// Add some tasks
const networkTask = new Task('network-call', async (context) => {
  // Simulate network call that might fail
  if (Math.random() < 0.3) {
    throw new Error('NETWORK_ERROR: Connection failed');
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  return { data: 'Network response data' };
});

const processingTask = new Task('data-processing', async (context) => {
  const networkResult = context.getResult('network-call');
  
  // Simulate CPU-intensive processing
  const start = Date.now();
  while (Date.now() - start < 500) {
    // Busy wait to simulate processing
  }
  
  return { processed: true, inputData: networkResult };
});

workflowWithMiddleware.addTask(networkTask);
workflowWithMiddleware.addTask(processingTask, { dependsOn: ['network-call'] });

// Execute workflow
try {
  const result = await workflowWithMiddleware.execute({ input: 'test data' });
  console.log('Workflow completed:', result);
  
  // Print performance summary
  console.log('\n📊 Performance Summary:');
  console.table(performanceMiddleware.getMetricsSummary());
} catch (error) {
  console.error('Workflow failed:', error);
}

interface PerformanceMetric {
  taskName: string;
  executionTime: number;
  memoryDelta: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface MetricsSummary {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalMemoryUsage: number;
  successRate: number;
}
```

## 🏢 Enterprise Integration Examples

### Example 6: Database Transaction Workflow

This example shows how to integrate Chainly SDK with database transactions for ACID compliance.

```typescript
import { Workflow, Task, TransactionMiddleware } from 'chainly-sdk';
import { Pool } from 'pg';

interface OrderCreationContext {
  customerId: string;
  items: OrderItem[];
  paymentInfo: PaymentInfo;
}

// Database transaction middleware
class DatabaseTransactionMiddleware extends Middleware {
  constructor(private dbPool: Pool) {
    super();
  }
  
  async before(context: MiddlewareContext): Promise<void> {
    // Start transaction for the entire workflow
    if (!context.context.transaction) {
      const client = await this.dbPool.connect();
      await client.query('BEGIN');
      context.context.transaction = client;
    }
  }
  
  async after(context: MiddlewareContext, result: any): Promise<void> {
    // Commit transaction after successful workflow completion
    if (context.task.name === 'finalize-order') { // Last task
      await context.context.transaction.query('COMMIT');
      context.context.transaction.release();
    }
  }
  
  async onError(error: Error, context: MiddlewareContext): Promise<void> {
    // Rollback transaction on any error
    if (context.context.transaction) {
      await context.context.transaction.query('ROLLBACK');
      context.context.transaction.release();
    }
  }
}

// Define transactional tasks
const validateCustomerTask = new Task('validate-customer', async (context) => {
  const { customerId } = context.input;
  const { transaction } = context.context;
  
  const result = await transaction.query(
    'SELECT id, status, credit_limit FROM customers WHERE id = $1',
    [customerId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Customer not found');
  }
  
  const customer = result.rows[0];
  if (customer.status !== 'active') {
    throw new Error('Customer account is not active');
  }
  
  return customer;
});

const checkInventoryTask = new Task('check-inventory', async (context) => {
  const { items } = context.input;
  const { transaction } = context.context;
  
  const inventoryChecks = await Promise.all(
    items.map(async (item) => {
      const result = await transaction.query(
        'SELECT quantity FROM inventory WHERE product_id = $1 FOR UPDATE',
        [item.productId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const available = result.rows[0].quantity;
      if (available < item.quantity) {
        throw new Error(`Insufficient inventory for product ${item.productId}`);
      }
      
      return { productId: item.productId, available, requested: item.quantity };
    })
  );
  
  return inventoryChecks;
});

const createOrderTask = new Task('create-order', async (context) => {
  const { customerId, items } = context.input;
  const { transaction } = context.context;
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Create order record
  const orderResult = await transaction.query(
    'INSERT INTO orders (customer_id, total, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
    [customerId, total, 'pending']
  );
  
  const orderId = orderResult.rows[0].id;
  
  // Create order items
  await Promise.all(
    items.map(item =>
      transaction.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.quantity, item.price]
      )
    )
  );
  
  return { orderId, total };
});

const updateInventoryTask = new Task('update-inventory', async (context) => {
  const { items } = context.input;
  const { transaction } = context.context;
  
  // Update inventory quantities
  await Promise.all(
    items.map(item =>
      transaction.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
        [item.quantity, item.productId]
      )
    )
  );
  
  return { inventoryUpdated: true };
});

const processPaymentTask = new Task('process-payment', async (context) => {
  const { paymentInfo } = context.input;
  const orderResult = context.getResult('create-order');
  const { transaction } = context.context;
  
  // Simulate payment processing
  const paymentResult = await processPayment(paymentInfo, orderResult.total);
  
  if (!paymentResult.success) {
    throw new Error('Payment processing failed');
  }
  
  // Record payment
  await transaction.query(
    'INSERT INTO payments (order_id, amount, payment_method, transaction_id, status) VALUES ($1, $2, $3, $4, $5)',
    [orderResult.orderId, orderResult.total, paymentInfo.method, paymentResult.transactionId, 'completed']
  );
  
  return paymentResult;
});

const finalizeOrderTask = new Task('finalize-order', async (context) => {
  const orderResult = context.getResult('create-order');
  const { transaction } = context.context;
  
  // Update order status to confirmed
  await transaction.query(
    'UPDATE orders SET status = $1, confirmed_at = NOW() WHERE id = $2',
    ['confirmed', orderResult.orderId]
  );
  
  return { orderConfirmed: true, orderId: orderResult.orderId };
});

// Create workflow with transaction middleware
const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
const transactionMiddleware = new DatabaseTransactionMiddleware(dbPool);

const orderCreationWorkflow = new Workflow<OrderCreationContext>({
  name: 'transactional-order-creation',
  middleware: [transactionMiddleware]
});

// Add tasks with dependencies
orderCreationWorkflow.addTask(validateCustomerTask);
orderCreationWorkflow.addTask(checkInventoryTask);
orderCreationWorkflow.addTask(createOrderTask, { 
  dependsOn: ['validate-customer', 'check-inventory'] 
});
orderCreationWorkflow.addTask(updateInventoryTask, { 
  dependsOn: ['create-order'] 
});
orderCreationWorkflow.addTask(processPaymentTask, { 
  dependsOn: ['create-order'] 
});
orderCreationWorkflow.addTask(finalizeOrderTask, { 
  dependsOn: ['update-inventory', 'process-payment'] 
});

// Execute transactional workflow
async function createOrder(orderData: OrderCreationContext) {
  try {
    const result = await orderCreationWorkflow.execute(orderData);
    console.log('Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('Order creation failed, transaction rolled back:', error);
    throw error;
  }
}

// Usage
await createOrder({
  customerId: 'customer-123',
  items: [
    { productId: 'product-1', quantity: 2, price: 29.99 },
    { productId: 'product-2', quantity: 1, price: 49.99 }
  ],
  paymentInfo: {
    method: 'credit_card',
    cardNumber: '****-****-****-1234',
    amount: 109.97
  }
});
```

These examples demonstrate the flexibility and power of Chainly SDK for building sophisticated workflow orchestration systems. Each pattern can be combined and extended to meet specific business requirements while maintaining clean, maintainable code. 