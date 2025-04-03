// Debug loader script
console.log('DEBUG LOADER INITIALIZED');

function checkMainJS() {
  if (typeof initApp === 'function') {
    console.log('main.js loaded correctly - initApp exists');
    return true;
  } else {
    console.error('main.js not loaded properly - initApp missing');
    return false;
  }
}

// Check every 500ms for main.js to load
const checkInterval = setInterval(() => {
  if (checkMainJS()) {
    clearInterval(checkInterval);
  }
}, 500);

// Timeout after 5 seconds
setTimeout(() => {
  clearInterval(checkInterval);
  if (!checkMainJS()) {
    document.body.innerHTML += `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff0000;
        color: white;
        padding: 10px;
        z-index: 9999;
        font-family: Arial;
      ">
        Debug: main.js failed to load properly
      </div>
    `;
  }
}, 5000);