// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import './custom.css'; // Import your custom CSS
import "./resume.css"
import Layout from './Layout.vue'
import IronManProjects from './components/IronManProjects.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Add any custom Vue components or global functionality here
    app.component('IronManProjects', IronManProjects)
  },
};