/**
 * Glitch Bistro - Auth & Session Protection
 * Manages login state, credentials check, and route protection across all dashboard pages.
 */

const AUTH_KEY = 'gb_auth_session';

function checkAuth(isLoginPage = false) {
    const session = getAuthSession();
    
    if (isLoginPage) {
        // If already logged in and visiting login page, redirect to main dashboard
        if (session && session.isLoggedIn) {
            window.location.href = 'index.html';
        }
    } else {
        // If visiting protected page and not logged in, redirect to login
        if (!session || !session.isLoggedIn) {
            window.location.href = 'login.html';
        }
    }
}

function getAuthSession() {
    try {
        const sessionStr = localStorage.getItem(AUTH_KEY);
        return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (e) {
        return null;
    }
}

function loginUser(email, password, remember = false) {
    const validEmail = 'admin@restaurant.com';
    const validPassword = 'admin123';

    if (email.trim().toLowerCase() === validEmail && password === validPassword) {
        const session = {
            isLoggedIn: true,
            user: {
                name: 'Alex Vance',
                role: 'General Manager',
                email: validEmail,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            },
            loginTime: new Date().toISOString(),
            remember
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return { success: true };
    } else {
        return { 
            success: false, 
            message: 'Invalid email or password. Please try admin@restaurant.com / admin123' 
        };
    }
}

function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}
