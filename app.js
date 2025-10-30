// App State
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    currentLocation: null,
    sosActive: false
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('jeevanConnectUser');
    
    // Show loading animation elements
    setTimeout(() => {
        showLoadingElements();
    }, 100);
    
    // After loading animation completes (8 seconds)
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        
        if (savedUser) {
            AppState.currentUser = JSON.parse(savedUser);
            AppState.isLoggedIn = true;
            showSOSPage();
        } else {
            showLoginPage();
        }
    }, 8000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize geolocation
    initGeolocation();
    
    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
}

function showLoadingElements() {
    // Elements appear based on CSS animations timing
    // Ambulance starts immediately
    document.getElementById('ambulance').classList.remove('hidden');
    
    // WiFi signal after ambulance (2.5s)
    setTimeout(() => {
        document.getElementById('wifiSignal').classList.remove('hidden');
    }, 2500);
    
    // Data points (3s)
    setTimeout(() => {
        document.getElementById('dataPoints').classList.remove('hidden');
    }, 3000);
    
    // Logo C (4s)
    setTimeout(() => {
        document.getElementById('logoC').classList.remove('hidden');
    }, 4000);
    
    // Logo text (5.5s)
    setTimeout(() => {
        document.getElementById('logoText').classList.remove('hidden');
    }, 5500);
}

function setupEventListeners() {
    // Login form toggle
    document.getElementById('showRegisterBtn')?.addEventListener('click', showRegisterForm);
    document.getElementById('showLoginBtn')?.addEventListener('click', showLoginForm);
    
    // Login submit
    document.getElementById('loginSubmitBtn')?.addEventListener('click', handleLogin);
    
    // Register submit
    document.getElementById('registerSubmitBtn')?.addEventListener('click', handleRegister);
    
    // OTP verification
    document.getElementById('verifyOTPBtn')?.addEventListener('click', handleOTPVerification);
    document.getElementById('resendOTPBtn')?.addEventListener('click', resendOTP);
    
    // Emergency SOS from login page
    document.getElementById('emergencySOSBtn')?.addEventListener('click', handleEmergencySOS);
    
    // SOS button
    document.getElementById('sosButton')?.addEventListener('click', handleSOSPress);
    
    // Cancel SOS
    document.getElementById('cancelSOSBtn')?.addEventListener('click', cancelSOS);
    
    // Feature cards
    document.getElementById('medicalProfileBtn')?.addEventListener('click', () => openModal('medicalProfileModal'));
    document.getElementById('firstAidBtn')?.addEventListener('click', () => openModal('firstAidModal'));
    document.getElementById('emergencyContactsBtn')?.addEventListener('click', showEmergencyContacts);
    document.getElementById('hospitalFinderBtn')?.addEventListener('click', findNearbyHospitals);
    
    // Save medical profile
    document.getElementById('saveMedicalProfile')?.addEventListener('click', saveMedicalProfile);
    
    // Menu button (for logout)
    document.getElementById('menuBtn')?.addEventListener('click', showMenu);
    
    // Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    // OTP input auto-focus
    setupOTPInputs();
    
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
}

// Login/Register Functions
function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('otpForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('otpForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function handleLogin() {
    const phone = document.getElementById('loginPhone').value;
    
    if (!phone || phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('jeevanConnectUsers') || '{}');
    
    if (users[phone]) {
        // User exists, send OTP
        sendOTP(phone);
        showOTPForm(phone);
    } else {
        alert('Phone number not registered. Please create an account.');
        showRegisterForm();
    }
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    
    if (!name || !email || !phone || phone.length !== 10) {
        alert('Please fill all fields correctly');
        return;
    }
    
    // Save user data
    const users = JSON.parse(localStorage.getItem('jeevanConnectUsers') || '{}');
    users[phone] = { name, email, phone };
    localStorage.setItem('jeevanConnectUsers', JSON.stringify(users));
    
    // Send OTP
    sendOTP(phone);
    showOTPForm(phone);
}

function showOTPForm(phone) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('otpForm').classList.remove('hidden');
    document.getElementById('phoneDisplay').textContent = `+91 ${phone}`;
    
    // Focus first OTP box
    document.querySelector('.otp-box').focus();
}

function sendOTP(phone) {
    console.log(`Sending OTP to ${phone}`);
    // In production, call SMS API
    alert(`OTP sent to +91 ${phone}\nDummy OTP: 123456`);
}

function resendOTP() {
    const phone = document.getElementById('phoneDisplay').textContent.replace('+91 ', '');
    sendOTP(phone);
}

function handleOTPVerification() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    const otp = Array.from(otpBoxes).map(box => box.value).join('');
    
    if (otp.length !== 6) {
        alert('Please enter complete OTP');
        return;
    }
    
    // Dummy OTP verification
    if (otp === '123456') {
        const phone = document.getElementById('phoneDisplay').textContent.replace('+91 ', '');
        const users = JSON.parse(localStorage.getItem('jeevanConnectUsers') || '{}');
        const user = users[phone];
        
        AppState.currentUser = user;
        AppState.isLoggedIn = true;
        localStorage.setItem('jeevanConnectUser', JSON.stringify(user));
        
        showSOSPage();
    } else {
        alert('Invalid OTP. Please try again.\nDummy OTP: 123456');
    }
}

function setupOTPInputs() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    
    otpBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpBoxes.length - 1) {
                otpBoxes[index + 1].focus();
            }
        });
        
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpBoxes[index - 1].focus();
            }
        });
    });
}

// Emergency SOS without login
function handleEmergencySOS() {
    // Create temporary guest user
    AppState.currentUser = {
        name: 'Guest User',
        phone: 'Emergency',
        isGuest: true
    };
    AppState.isLoggedIn = true;
    
    showSOSPage();
    
    // Automatically trigger SOS
    setTimeout(() => {
        handleSOSPress();
    }, 500);
}

// Navigation
function showLoginPage() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('sosPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

function showSOSPage() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('sosPage').classList.remove('hidden');
    
    // Update user info
    if (AppState.currentUser) {
        document.getElementById('userName').textContent = AppState.currentUser.name || 'User';
    }
    
    // Start location tracking
    updateLocation();
}

// SOS Functionality
function handleSOSPress() {
    if (AppState.sosActive) {
        alert('SOS already active!');
        return;
    }
    
    if (!AppState.currentLocation) {
        alert('Detecting your location...');
        getCurrentLocation(() => {
            activateSOS();
        });
    } else {
        activateSOS();
    }
}

function activateSOS() {
    AppState.sosActive = true;
    
    // Update UI
    document.getElementById('sosStatus').innerHTML = '<p class="status-text" style="color: #f44336;">🚨 SOS ACTIVATED</p>';
    document.getElementById('trackingSection').classList.remove('hidden');
    
    // Simulate ambulance dispatch
    alert('🚨 EMERGENCY ACTIVATED!\n\nAmbulance dispatched to your location.\nETA: 7 minutes\n\nStay calm, help is on the way!');
    
    // In production: Send SOS to backend
    sendSOSToBackend();
    
    // Simulate ETA countdown
    simulateAmbulanceTracking();
}

function cancelSOS() {
    if (confirm('Are you sure you want to cancel the SOS request?')) {
        AppState.sosActive = false;
        document.getElementById('sosStatus').innerHTML = '<p class="status-text">Ready for Emergency</p>';
        document.getElementById('trackingSection').classList.add('hidden');
        alert('SOS cancelled');
    }
}

function sendSOSToBackend() {
    console.log('Sending SOS to backend:', {
        user: AppState.currentUser,
        location: AppState.currentLocation,
        timestamp: new Date().toISOString()
    });
    
    // In production: API call to backend
    // fetch('/api/sos', { method: 'POST', body: JSON.stringify(data) })
}

function simulateAmbulanceTracking() {
    let eta = 7;
    const etaElement = document.getElementById('etaTime');
    
    const interval = setInterval(() => {
        eta--;
        etaElement.textContent = `${eta} mins`;
        
        if (eta <= 0) {
            clearInterval(interval);
            etaElement.textContent = 'Arriving now!';
            alert('🚑 Ambulance has arrived!');
        }
    }, 10000); // Update every 10 seconds (for demo)
}

// Geolocation
function initGeolocation() {
    if ('geolocation' in navigator) {
        getCurrentLocation();
    } else {
        console.log('Geolocation not supported');
    }
}

function getCurrentLocation(callback) {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                AppState.currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                updateLocationDisplay();
                if (callback) callback();
            },
            (error) => {
                console.error('Geolocation error:', error);
                document.getElementById('currentLocation').textContent = 'Location unavailable';
            }
        );
    }
}

function updateLocation() {
    getCurrentLocation();
    // Update location every 30 seconds
    setInterval(getCurrentLocation, 30000);
}

function updateLocationDisplay() {
    if (AppState.currentLocation) {
        const { latitude, longitude } = AppState.currentLocation;
        document.getElementById('currentLocation').textContent = `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`;
        
        // In production: Reverse geocode to get address
        // fetchAddress(latitude, longitude);
    }
}

// Modals
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Medical Profile
function saveMedicalProfile() {
    const profile = {
        bloodGroup: document.getElementById('bloodGroup').value,
        allergies: document.getElementById('allergies').value,
        medicalConditions: document.getElementById('medicalConditions').value,
        emergencyContactName: document.getElementById('emergencyContactName').value,
        emergencyContactPhone: document.getElementById('emergencyContactPhone').value
    };
    
    // Save to localStorage
    if (AppState.currentUser) {
        const phone = AppState.currentUser.phone;
        const users = JSON.parse(localStorage.getItem('jeevanConnectUsers') || '{}');
        
        if (users[phone]) {
            users[phone].medicalProfile = profile;
            localStorage.setItem('jeevanConnectUsers', JSON.stringify(users));
            
            // Update current user
            AppState.currentUser.medicalProfile = profile;
            localStorage.setItem('jeevanConnectUser', JSON.stringify(AppState.currentUser));
        }
    }
    
    alert('Medical profile saved successfully!');
    closeModal('medicalProfileModal');
}

// Emergency Contacts
function showEmergencyContacts() {
    const contacts = `
    🚨 EMERGENCY CONTACTS:
    
    Ambulance: 108
    Police: 100
    Fire: 101
    Women Helpline: 1091
    Child Helpline: 1098
    Disaster Management: 108
    National Emergency Number: 112
    `;
    
    alert(contacts);
}

// Hospital Finder
function findNearbyHospitals() {
    if (!AppState.currentLocation) {
        alert('Please enable location services');
        return;
    }
    
    alert('🏥 Finding nearby hospitals...\n\nThis feature will show hospitals with available beds in the production version.');
    
    // In production: API call to find nearby hospitals
    // fetch(`/api/hospitals/nearby?lat=${lat}&lng=${lng}`)
}

// Menu (Logout)
function showMenu() {
    const menuOptions = confirm('Logout and switch user?\n\nClick OK to logout');
    
    if (menuOptions) {
        handleLogout();
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear current user session
        localStorage.removeItem('jeevanConnectUser');
        
        // Reset app state
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        AppState.sosActive = false;
        
        // Show login page
        showLoginPage();
        
        alert('Logged out successfully!');
    }
}

// Bottom Navigation
function handleNavigation(e) {
    const page = e.currentTarget.getAttribute('data-page');
    
    // Remove active from all
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active to clicked
    e.currentTarget.classList.add('active');
    
    // Handle navigation
    switch(page) {
        case 'home':
            // Already on home
            break;
        case 'history':
            alert('History: View your past emergency requests');
            break;
        case 'profile':
            openModal('medicalProfileModal');
            break;
        case 'settings':
            showSettingsMenu();
            break;
    }
}

function showSettingsMenu() {
    const settings = `Settings:\n\n1. Notifications\n2. Language\n3. Privacy\n4. About\n\nFor logout, click the menu button (☰) in the top left`;
    alert(settings);
}

// Service Worker Registration
function registerServiceWorker() {
    navigator.serviceWorker.register('sw.js')
        .then((registration) => {
            console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
}

// Offline Detection
window.addEventListener('online', () => {
    console.log('Back online');
    removeOfflineIndicator();
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
    showOfflineIndicator();
});

function showOfflineIndicator() {
    if (!document.querySelector('.offline-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.textContent = '⚠️ Offline Mode - SMS fallback active';
        document.body.appendChild(indicator);
    }
}

function removeOfflineIndicator() {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
        indicator.remove();
    }
}
