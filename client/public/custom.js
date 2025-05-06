// Custom JavaScript to fix React rendering issues
console.log('Custom.js loaded successfully');

// Check if this is the root path
if (window.location.pathname === '/') {
  console.log('Detected root path - showing options');
  
  // Create a modal to let users select where to go
  function createModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.borderRadius = '8px';
    content.style.padding = '24px';
    content.style.maxWidth = '500px';
    content.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    
    content.innerHTML = `
      <h2 style="margin-top: 0; color: #3b82f6; font-size: 24px; font-weight: 600;">QrMingle - Choose Your Destination</h2>
      <p style="color: #4b5563; margin-bottom: 16px;">
        This development environment is experiencing React rendering issues. Please choose an option:
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button id="goto-production" style="background-color: #3b82f6; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 500;">
          Go to Production Site (qrmingle.app)
        </button>
        <button id="stay-dev" style="background-color: #e5e7eb; color: #1f2937; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 500;">
          Stay in Development Mode
        </button>
        <button id="goto-direct" style="background-color: #f3f4f6; color: #6b7280; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 500;">
          Use Direct HTML Version
        </button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add event listeners to buttons
    document.getElementById('goto-production').addEventListener('click', function() {
      window.location.href = 'https://qrmingle.app';
    });
    
    document.getElementById('stay-dev').addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    document.getElementById('goto-direct').addEventListener('click', function() {
      window.location.href = '/direct';
    });
  }
  
  // Create the modal after a short delay to ensure page is loaded
  setTimeout(createModal, 1000);
}