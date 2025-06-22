<template>
  <div class="iron-man-enhanced">
    <div class="showcase-header">
      <h2 class="iron-title">
        <span class="title-main">PROJECT</span>
        <span class="title-accent">STATUS</span>
      </h2>
      <div class="power-indicator">
        <div class="power-core"></div>
        <span class="power-text">SYSTEMS ONLINE</span>
      </div>
    </div>
    
    <div class="project-grid">
      <div class="project-card" data-status="planning">
        <div class="card-header">
          <span class="project-number">01</span>
          <span class="status-badge planning">PLANNING</span>
        </div>
        <h3>QUICKLINKER-ZERORPM</h3>
        <p>High-performance URL shortener</p>
      </div>
      
      <div class="project-card" data-status="operational">
        <div class="card-header">
          <span class="project-number">02</span>
          <span class="status-badge operational">OPERATIONAL</span>
        </div>
        <h3>BRANDPULSE</h3>
        <p>Real-time analytics platform</p>
      </div>
      
      <div class="project-card" data-status="operational">
        <div class="card-header">
          <span class="project-number">03</span>
          <span class="status-badge operational">OPERATIONAL</span>
        </div>
        <h3>CHAINLY SDK</h3>
        <p>Workflow orchestration framework</p>
      </div>
      
      <div class="project-card" data-status="in-progress">
        <div class="card-header">
          <span class="project-number">04</span>
          <span class="status-badge in-progress">IN PROGRESS</span>
        </div>
        <h3>ABUSE DETECTION</h3>
        <p>AI content moderation</p>
      </div>
      
      <div class="project-card" data-status="operational">
        <div class="card-header">
          <span class="project-number">05</span>
          <span class="status-badge operational">OPERATIONAL</span>
        </div>
        <h3>ATTESTIFY</h3>
        <p>Cryptographic security SDK</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Iron Man Project Showcase Component
// No reactive data needed for static showcase
</script>

<style scoped>
/* Iron Man Enhanced Styling */
.iron-man-enhanced {
  margin: 4rem 0;
  padding: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #333;
  position: relative;
}

.iron-man-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #dc2626, #f59e0b, #dc2626, transparent);
  animation: pulse-line 3s ease-in-out infinite;
}

.showcase-header {
  padding: 2rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(220, 38, 38, 0.05);
}

.iron-title {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.title-main {
  color: #dc2626;
}

.title-accent {
  color: #f59e0b;
  margin-left: 0.5rem;
}

.power-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.power-core {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
  animation: power-pulse 2s ease-in-out infinite;
}

.power-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #22c55e;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
  transition: left 0.5s ease;
}

.project-card:hover::before {
  left: 100%;
}

.project-card:hover {
  border-color: #dc2626;
  transform: translateY(-5px);
  background: rgba(220, 38, 38, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: #dc2626;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  font-family: 'JetBrains Mono', monospace;
}

.status-badge.planning {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.in-progress {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-badge.operational {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.project-card h3 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.05em;
}

.project-card p {
  color: #a3a3a3;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

@keyframes pulse-line {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes power-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .showcase-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
  
  .iron-title {
    font-size: 1.4rem;
  }
}
</style>
