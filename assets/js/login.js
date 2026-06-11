// Login Page Script

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginSuccess = document.getElementById('loginSuccess');
    const loginSpinner = document.getElementById('loginSpinner');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear previous messages
        loginError.classList.add('hidden');
        loginSuccess.classList.add('hidden');

        // Validate input
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        // Show spinner
        loginSpinner.classList.remove('hidden');
        loginForm.style.opacity = '0.5';
        loginForm.style.pointerEvents = 'none';

        try {
            // Attempt login
            const result = await auth.login(email, password);

            if (result.success) {
                showSuccess('Login successful! Redirecting...');
                
                // Save remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberEmail', email);
                }

                // Redirect based on role
                setTimeout(() => {
                    const dashboardPath = CONFIG.ROLE_PATHS[result.user.role];
                    window.location.href = dashboardPath;
                }, 1500);
            }
        } catch (error) {
            showError(error.message || 'Login failed. Please try again.');
        } finally {
            loginSpinner.classList.add('hidden');
            loginForm.style.opacity = '1';
            loginForm.style.pointerEvents = 'auto';
        }
    });

    // Load remembered email
    const rememberEmail = localStorage.getItem('rememberEmail');
    if (rememberEmail) {
        document.getElementById('email').value = rememberEmail;
        document.getElementById('rememberMe').checked = true;
    }

    // Forgot password handler
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Password reset functionality coming soon!\nPlease contact support for assistance.');
    });

    function showError(message) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }

    function showSuccess(message) {
        loginSuccess.textContent = message;
        loginSuccess.classList.remove('hidden');
    }
});