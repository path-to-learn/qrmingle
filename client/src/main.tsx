// Import only the styles, no React
import "./index.css";

// This is a pure JS approach without any React dependencies
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  // Apply Tailwind classes
  root.innerHTML = `
    <div class="p-8 max-w-2xl mx-auto">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-blue-600 mb-2">QrMingle</h1>
        <p class="text-xl text-gray-600">The Digital Networking Platform</p>
      </header>
      
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Welcome to QrMingle</h2>
        <p class="text-gray-600 mb-6">
          Our React application is experiencing technical difficulties. 
          In the meantime, you can access your profiles through our static pages.
        </p>
        
        <div class="flex flex-wrap gap-4 justify-center">
          <a href="/direct.html" class="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Access Static Pages
          </a>
          <a href="/profile.html" class="px-5 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            View Sample Profile
          </a>
        </div>
      </div>
      
      <div class="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Available Pages</h3>
        <ul class="space-y-2 text-gray-600">
          <li class="flex items-center">
            <span class="w-4 h-4 inline-block bg-blue-600 rounded-full mr-3"></span>
            <a href="/direct.html" class="hover:text-blue-600 transition-colors">Direct Profile Access</a>
          </li>
          <li class="flex items-center">
            <span class="w-4 h-4 inline-block bg-blue-600 rounded-full mr-3"></span>
            <a href="/profile.html" class="hover:text-blue-600 transition-colors">Sample Profile</a>
          </li>
          <li class="flex items-center">
            <span class="w-4 h-4 inline-block bg-blue-600 rounded-full mr-3"></span>
            <a href="/direct-profile/demo" class="hover:text-blue-600 transition-colors">Demo Profile</a>
          </li>
        </ul>
      </div>
      
      <footer class="mt-8 text-center text-gray-500 text-sm">
        <p>QrMingle © ${new Date().getFullYear()}</p>
      </footer>
    </div>
  `;
});
