// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const userTypeSelect = document.querySelector('#user-type');
const studentForm = document.querySelector('#student-form');
const schoolForm = document.querySelector('#school-form');
const employerForm = document.querySelector('#employer-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
navToggle?.addEventListener('click', toggleMobileMenu);
userTypeSelect?.addEventListener('change', showRegistrationForm);

// Initialize Application
function initApp() {
  // Check authentication status
  checkAuthState();
  
  // Load appropriate content based on route
  loadPageContent();
}

// Toggle Mobile Navigation Menu
function toggleMobileMenu() {
  navMenu.classList.toggle('hidden');
}

// Show Appropriate Registration Form
function showRegistrationForm(e) {
  const userType = e.target.value;
  
  studentForm.classList.add('hidden');
  schoolForm.classList.add('hidden');
  employerForm.classList.add('hidden');
  
  if (userType === 'student') {
    studentForm.classList.remove('hidden');
  } else if (userType === 'school') {
    schoolForm.classList.remove('hidden');
  } else if (userType === 'employer') {
    employerForm.classList.remove('hidden');
  }
}

// Check Authentication State
function checkAuthState() {
  const token = localStorage.getItem('edopportunity_token');
  
  if (token) {
    // User is logged in
    document.querySelectorAll('.guest').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.authenticated').forEach(el => el.classList.remove('hidden'));
  } else {
    // User is not logged in
    document.querySelectorAll('.guest').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.authenticated').forEach(el => el.classList.add('hidden'));
  }
}

// Load Page Content Based on Route
function loadPageContent() {
  const path = window.location.pathname;
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) return;

  if (path === '/login') {
    mainContent.innerHTML = `
      <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
        <form id="login-form" class="space-y-4">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="login-email" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" required>
          </div>
          <button type="submit" class="btn btn-primary w-full">Login</button>
        </form>
      </div>
    `;
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  } else if (path === '/register') {
    mainContent.innerHTML = `
      <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
        <div class="form-group">
          <label class="form-label">I am a:</label>
          <select id="user-type" class="form-input">
            <option value="student">Student</option>
            <option value="school">School</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        <div id="registration-forms">
          <!-- Forms will be loaded dynamically based on user type -->
        </div>
      </div>
    `;
    showRegistrationForm({ target: document.getElementById('user-type') });
    document.getElementById('user-type')?.addEventListener('change', showRegistrationForm);
  } else if (path === '/dashboard') {
    mainContent.innerHTML = `
      <div class="container mx-auto p-4">
        <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
        <div id="dashboard-content">
          <!-- Dashboard content will be loaded based on user role -->
        </div>
      </div>
    `;
    loadDashboardContent();
  } else {
    // Default to home page
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    mainContent.innerHTML = document.getElementById('home-template')?.innerHTML || '';
  }
}

// Load Dashboard Content Based on User Role
function loadDashboardContent() {
  const token = localStorage.getItem('edopportunity_token');
  if (!token) return;
  
  const payload = JSON.parse(atob(token.split('.')[1]));
  const dashboardContent = document.getElementById('dashboard-content');
  
  if (!dashboardContent) return;

  if (payload.role === 'student') {
    dashboardContent.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold mb-4">Student Dashboard</h3>
        <!-- Student dashboard content -->
      </div>
    `;
  } else if (payload.role === 'school') {
    dashboardContent.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold mb-4">School Dashboard</h3>
        <!-- School dashboard content -->
      </div>
    `;
  } else if (payload.role === 'employer') {
    dashboardContent.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold mb-4">Employer Dashboard</h3>
        <!-- Employer dashboard content -->
      </div>
    `;
  }
}

// API Helper Functions
async function apiRequest(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('edopportunity_token') || ''
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`/api${url}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Login Function
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.querySelector('#login-email').value;
  const password = document.querySelector('#login-password').value;
  
  try {
    const { token } = await apiRequest('/auth/login', 'POST', { email, password });
    localStorage.setItem('edopportunity_token', token);
    window.location.href = '/dashboard';
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Registration Function
async function handleRegister(e) {
  e.preventDefault();
  
  const formType = document.querySelector('#user-type').value;
  let formData;
  
  if (formType === 'student') {
    formData = getStudentFormData();
  } else if (formType === 'school') {
    formData = getSchoolFormData();
  } else if (formType === 'employer') {
    formData = getEmployerFormData();
  }
  
  try {
    const { token } = await apiRequest('/auth/register', 'POST', formData);
    localStorage.setItem('edopportunity_token', token);
    window.location.href = '/dashboard';
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Helper Functions
function getStudentFormData() {
  // Implementation for collecting student form data
}

function getSchoolFormData() {
  // Implementation for collecting school form data
}

function getEmployerFormData() {
  // Implementation for collecting employer form data
}

function showAlert(message, type = 'success') {
  // Implementation for showing alerts/notifications
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);