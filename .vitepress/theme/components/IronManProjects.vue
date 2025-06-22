<template>
  <div class="professional-portfolio">
    <!-- Elegant Header -->
    <div class="portfolio-header">
      <div class="header-indicator">
        <div class="status-ring"></div>
        <div class="status-core"></div>
      </div>
      <div class="header-content">
        <h1 class="portfolio-title">Project Portfolio</h1>
        <p class="portfolio-subtitle">Engineering Excellence & Innovation</p>
      </div>
    </div>

    <!-- Clean Project Grid -->
    <div class="projects-container">
      <div 
        v-for="(project, index) in projects" 
        :key="index"
        class="project-card"
        @click="selectProject(index)"
        :class="{ 'selected': selectedProject === index }"
      >
        <div class="card-header">
          <div class="project-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="project-status">
            <div class="status-dot"></div>
            <span>{{ project.status }}</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="project-icon">{{ project.icon }}</div>
          <h3 class="project-name">{{ project.title }}</h3>
          <p class="project-summary">{{ project.summary }}</p>
        </div>
        
        <div class="card-footer">
          <span class="view-details">View Details</span>
          <span class="arrow">→</span>
        </div>
      </div>
    </div>

    <!-- Elegant Detail Modal -->
    <div class="modal-overlay" v-if="selectedProject !== null" @click="closeModal">
      <div class="detail-modal" @click.stop>
        <div class="modal-header">
          <div class="project-meta">
            <span class="project-id">Project {{ String(selectedProject + 1).padStart(2, '0') }}</span>
            <h2 class="modal-title">{{ projects[selectedProject].title }}</h2>
          </div>
          <button class="close-btn" @click="closeModal">
            <span>×</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="project-overview">
            <h3>Overview</h3>
            <p>{{ projects[selectedProject].description }}</p>
          </div>
          
          <div class="project-highlights">
            <div class="highlight-item">
              <span class="highlight-label">Type</span>
              <span class="highlight-value">{{ projects[selectedProject].type }}</span>
            </div>
            <div class="highlight-item">
              <span class="highlight-label">Status</span>
              <span class="highlight-value">{{ projects[selectedProject].status }}</span>
            </div>
            <div class="highlight-item">
              <span class="highlight-label">Scale</span>
              <span class="highlight-value">{{ projects[selectedProject].scale }}</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="primary-btn" @click="navigateToProject(projects[selectedProject].link)">
              <span>Explore Project</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Professional Portfolio Component
 * Clean, elegant design with subtle interactions
 */
import { ref } from 'vue'

/**
 * Project data with summaries for cards and full descriptions for modals
 */
const projects = ref([
  {
    icon: '⚡',
    title: 'BrandPulse',
    summary: 'Real-time brand monitoring platform processing 700K+ social media posts per second.',
    description: 'Real-time brand monitoring platform processing 700K+ social media posts per second. Delivers instant sentiment insights using advanced streaming architecture with fault-tolerant distributed architecture.',
    link: '/my-portfolio/docs/brandpulse/',
    type: 'Real-Time Analytics',
    status: 'Production Ready',
    scale: 'Massive Scale'
  },
  {
    icon: '🔧',
    title: 'Chainly SDK',
    summary: 'Enterprise-grade TypeScript workflow orchestration with intelligent dependency resolution.',
    description: 'Enterprise-grade TypeScript workflow orchestration framework that simplifies complex task management. Features intelligent dependency resolution, advanced error handling, and real-time event-driven execution.',
    link: '/my-portfolio/docs/chainly-sdk/',
    type: 'Developer Framework',
    status: 'Production Ready',
    scale: 'Enterprise Grade'
  },
  {
    icon: '🔐',
    title: 'Attestify',
    summary: 'Cryptographically secure payment commitment SDK with military-grade security.',
    description: 'Enterprise-grade TypeScript SDK ecosystem for cryptographically secure payment commitments. Leverages HD wallets, secp256k1 signatures, and distributed trust mechanisms with military-grade security.',
    link: '/my-portfolio/docs/attestify/',
    type: 'Security Framework',
    status: 'Production Ready',
    scale: 'Military Grade'
  },
  {
    icon: '🛡️',
    title: 'Distributed Abuse Detection',
    summary: 'Real-time content moderation processing 2.5M+ events daily with sub-100ms latency.',
    description: 'Real-time content moderation platform processing 2.5M+ events daily with sub-100ms latency. Features multi-modal AI inference (text, image, audio), auto-scaling Kubernetes deployment, and comprehensive observability.',
    link: '/my-portfolio/docs/distributed-abuse-detection/',
    type: 'ML Platform',
    status: 'In Progress',
    scale: 'High Performance'
  },
  {
    icon: '📋',
    title: 'Template Generator',
    summary: 'AI-powered dynamic form generator that transforms Excel files into intelligent schemas and interactive forms.',
    description: 'Revolutionary web application that leverages AI to automatically generate JSON schemas from Excel data and creates dynamic forms using react-jsonschema-form. Features intelligent schema editing, PostgreSQL storage, and seamless integration with OpenAI for advanced data processing.',
    link: '/my-portfolio/docs/template-generator/',
    type: 'Full-Stack Application',
    status: 'Production Ready',
    scale: 'Enterprise Grade'
  },
  {
    icon: '🚀',
    title: 'QuickLinker-ZeroRPM',
    summary: 'High-performance URL shortener with intelligent caching and zero-downtime architecture.',
    description: 'High-performance URL shortener engineered for massive scale. Built with intelligent caching and cost-efficient architecture that handles heavy traffic with zero downtime. Sub-millisecond response times with 99.99% uptime.',
    link: '/my-portfolio/docs/quicklinker-zeroRPM/',
    type: 'Infrastructure',
    status: 'Planning',
    scale: 'Cost Efficient'
  }
])

const selectedProject = ref(null)

const selectProject = (index) => {
  selectedProject.value = index
}

const closeModal = () => {
  selectedProject.value = null
}

const navigateToProject = (link) => {
  window.location.href = link
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.professional-portfolio {
  background: transparent;
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: 'Inter', sans-serif;
  color: var(--vp-c-text-1);
}

/* Dark theme specific styling */
.dark .professional-portfolio {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2a2a2a 100%);
  color: #e5e5e5;
}

/* Light theme specific styling */
html:not(.dark) .professional-portfolio {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  color: #1e293b;
}

/* Elegant Header */
.portfolio-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.header-indicator {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.status-ring {
  width: 60px;
  height: 60px;
  border: 2px solid #444;
  border-top-color: #dc2626;
  border-right-color: #fbbf24;
  border-radius: 50%;
  animation: rotate 8s linear infinite;
}

.status-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #dc2626 0%, #991b1b 100%);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
}

.header-content {
  flex: 1;
}

.portfolio-title {
  font-size: 2.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
  text-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

.portfolio-subtitle {
  font-size: 1.125rem;
  color: var(--vp-c-text-3);
  margin: 0;
  font-weight: 400;
}

/* Clean Project Grid */
.projects-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.project-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--vp-shadow-2);
  position: relative;
  overflow: hidden;
}

/* Dark theme project cards */
.dark .project-card {
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  border: 1px solid #404040;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Light theme project cards */
html:not(.dark) .project-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, 
    rgba(220, 38, 38, 0.05) 0%, 
    rgba(251, 191, 36, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover {
  border-color: #dc2626;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(220, 38, 38, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.project-card:hover::before {
  opacity: 1;
}

.project-card.selected {
  border-color: #dc2626;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(220, 38, 38, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.project-card.selected::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem 0 1.5rem;
  position: relative;
  z-index: 2;
}

.project-number {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
  font-family: 'Inter', monospace;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Status colors based on project status */
.project-card:nth-child(1) .project-status,
.project-card:nth-child(2) .project-status,
.project-card:nth-child(3) .project-status,
.project-card:nth-child(4) .project-status {
  color: #10b981; /* Green for Production Ready */
}

.project-card:nth-child(5) .project-status {
  color: #fbbf24; /* Gold for In Progress */
}

.project-card:nth-child(6) .project-status {
  color: #dc2626; /* Red for Planning */
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}

/* Status dot colors */
.project-card:nth-child(1) .status-dot,
.project-card:nth-child(2) .status-dot,
.project-card:nth-child(3) .status-dot,
.project-card:nth-child(4) .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.project-card:nth-child(5) .status-dot {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}

.project-card:nth-child(6) .status-dot {
  background: #dc2626;
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.6);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.card-body {
  padding: 1.5rem;
  text-align: left;
  position: relative;
  z-index: 2;
}

.project-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.4));
}

.project-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.project-summary {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem 1.25rem 1.5rem;
  position: relative;
  z-index: 2;
}

.view-details {
  font-size: 0.875rem;
  color: #fbbf24;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}

.arrow {
  color: var(--vp-c-text-3);
  font-weight: 500;
  transition: all 0.3s ease;
}

.project-card:hover .arrow {
  transform: translateX(3px);
  color: #dc2626;
}

/* Elegant Detail Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.detail-modal {
  max-width: 700px;
  width: 100%;
  background: var(--vp-c-bg-elv);
  border: 1px solid #dc2626;
  border-radius: 16px;
  box-shadow: var(--vp-shadow-5);
  animation: slideIn 0.4s ease-out;
  position: relative;
  overflow: hidden;
}

/* Dark theme modal */
.dark .detail-modal {
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(220, 38, 38, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Light theme modal */
html:not(.dark) .detail-modal {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 40px rgba(220, 38, 38, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.detail-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, 
    rgba(220, 38, 38, 0.05) 0%, 
    rgba(251, 191, 36, 0.05) 100%);
  pointer-events: none;
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: scale(0.9) translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 0 2rem;
  border-bottom: 1px solid #404040;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.project-meta {
  flex: 1;
}

.project-id {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 1.5rem 0;
  line-height: 1.3;
  text-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dc2626;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 8px;
  color: #dc2626;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -0.5rem;
}

.close-btn:hover {
  background: rgba(220, 38, 38, 0.2);
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.4);
}

.modal-content {
  padding: 0 2rem 2rem 2rem;
  position: relative;
  z-index: 2;
}

.project-overview h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fbbf24;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
}

.project-overview p {
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0 0 2rem 0;
}

.project-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Dark theme highlight items */
.dark .highlight-item {
  background: rgba(42, 42, 42, 0.8);
  border: 1px solid #404040;
}

/* Light theme highlight items */
html:not(.dark) .highlight-item {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.highlight-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.highlight-value {
  font-size: 0.875rem;
  color: #fbbf24;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(145deg, #dc2626 0%, #991b1b 100%);
  border: 1px solid #dc2626;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 14px rgba(220, 38, 38, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.primary-btn:hover {
  background: linear-gradient(145deg, #b91c1c 0%, #7f1d1d 100%);
  transform: translateY(-1px);
  box-shadow: 
    0 6px 20px rgba(220, 38, 38, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.primary-btn:hover .btn-arrow {
  transform: translateX(3px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .professional-portfolio {
    padding: 2rem 1rem;
  }
  
  .portfolio-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .portfolio-title {
    font-size: 1.875rem;
  }
  
  .projects-container {
    grid-template-columns: 1fr;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .close-btn {
    align-self: flex-end;
  }
  
  .project-highlights {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .portfolio-title {
    font-size: 1.5rem;
  }
  
  .portfolio-subtitle {
    font-size: 1rem;
  }
  
  .card-body {
    padding: 1.25rem;
  }
  
  .modal-content {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
}
</style> 