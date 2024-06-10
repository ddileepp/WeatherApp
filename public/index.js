document.getElementById('login')?.addEventListener('submit', async function(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  console.log('Submitting login form:', { email, password });

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      console.log('Login successful:', data);
      window.location.href = data.redirectUrl; // Redirect to dashboard
    } else {
      alert('Login failed: ' + data.message);
      console.log('Login failed:', data);
    }
  } catch (error) {
    alert('An error occurred during login');
    console.error('Login error:', error);
  }
});

document.getElementById('signup')?.addEventListener('submit', async function(event) {
  event.preventDefault();
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  console.log('Submitting signup form:', { username, email, password });

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (data.success) {

      console.log('Signup successful:', data);
      window.location.href = data.redirectUrl; // Redirect to dashboard
    } else {
      alert('Signup failed: ' + data.message);
      console.log('Signup failed:', data);
    }
  } catch (error) {
    alert('An error occurred during signup');
    console.error('Signup error:', error);
  }
});
