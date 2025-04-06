document.addEventListener('DOMContentLoaded', () => {
  // Mock API for testing
  const mockApi = {
    register: (data) => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token',
          user: { id: 'mock-user-id', role: data.role }
        });
      }, 1000);
    })
  };

  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  document.getElementById('role').value = type || 'student';

  const form = document.getElementById('registerForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    const formData = {
      email: form.email.value,
      password: form.password.value,
      role: form.role.value
    };

    try {
      // Try real API first, fallback to mock
      let response;
      try {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch {
        console.log('Using mock API');
        const data = await mockApi.register(formData);
        localStorage.setItem('token', data.token);
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/';
      } else {
        alert(data.msg || 'Registration failed');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Registration failed. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  });
});
