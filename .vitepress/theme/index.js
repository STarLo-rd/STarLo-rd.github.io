// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import './custom.css'; // Import your custom CSS
import "./resume.css"
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // Optional: Add custom Vue components or logic here if needed
  },
};