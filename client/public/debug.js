// Debug script to verify basic JavaScript execution
console.log('Debug script loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  document.body.innerHTML += '<h1 style="color:red;position:fixed;top:0;left:0;z-index:9999">DEBUG: Scripts Working</h1>';
});