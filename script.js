// ================================
// Zyntiq Verification Portal - Main Script
// ================================

const API_URL = 'https://sheetdb.io/api/v1/h7tx1qdz2buz1';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultSection = document.getElementById('resultSection');
const loadingState = document.getElementById('loadingState');
const tabBtns = document.querySelectorAll('.tab-btn');

// State
let currentSearchType = 'uid';
let cachedData = null;

// ================================
// Initialize
// ================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Fetch initial data to get member count
    try {
        const data = await fetchData();
        if (data) {
            cachedData = data;
        }
    } catch (error) {
        console.error('Failed to fetch initial data:', error);
    }

    // Setup event listeners
    setupEventListeners();
}

// ================================
// Event Listeners
// ================================
function setupEventListeners() {
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => handleTabSwitch(btn));
    });

    // Search button click
    searchBtn.addEventListener('click', handleSearch);

    // Enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Input animation
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('focused');
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('focused');
    });
}

function handleTabSwitch(btn) {
    // Update active state
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update search type
    currentSearchType = btn.dataset.tab;

    // Update placeholder
    if (currentSearchType === 'uid') {
        searchInput.placeholder = 'Enter your UID (e.g., ZYNTIQ-75050)';
    } else {
        searchInput.placeholder = 'Enter your full name';
    }

    // Clear input and results
    searchInput.value = '';
    hideResults();
}

// ================================
// API Functions
// ================================
async function fetchData() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return await response.json();
}

// ================================
// Search Functions
// ================================
async function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        shakeInput();
        return;
    }

    // Show loading
    showLoading();
    hideResults();

    try {
        // Use cached data or fetch new
        const data = cachedData || await fetchData();

        if (!cachedData) {
            cachedData = data;
        }

        // Search based on type
        let results;
        if (currentSearchType === 'uid') {
            results = data.filter(item =>
                item.uid && item.uid.toLowerCase() === query.toLowerCase()
            );
        } else {
            results = data.filter(item =>
                item.name && item.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Simulate network delay for better UX
        await delay(800);

        // Display results
        if (results.length > 0) {
            displayResults(results);
        } else {
            displayNotFound(query);
        }
    } catch (error) {
        console.error('Search error:', error);
        displayError();
    } finally {
        hideLoading();
    }
}

// ================================
// Display Functions
// ================================
function displayResults(results) {
    resultSection.innerHTML = '';
    resultSection.classList.remove('hidden');

    results.forEach((user, index) => {
        const card = createResultCard(user, index);
        resultSection.appendChild(card);
    });

    // Animate cards
    const cards = resultSection.querySelectorAll('.result-card');
    cards.forEach((card, i) => {
        card.style.animation = `fadeInUp 0.4s ease ${i * 0.1}s both`;
    });
}

function createResultCard(user, index) {
    const card = document.createElement('div');
    card.className = 'result-card verified';

    card.innerHTML = `
        <div class="result-header">
            <div class="result-icon verified">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <div class="result-title-section">
                <h3 class="result-title">${escapeHtml(user.name || 'N/A')}</h3>
                <p class="result-subtitle">Verified Zyntiq Member</p>
            </div>
            <div class="result-badge verified">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Verified
            </div>
        </div>
        <div class="result-details">
            <div class="detail-item">
                <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/>
                    </svg>
                </div>
                <div class="detail-content">
                    <span class="detail-label">Full Name</span>
                    <span class="detail-value">${escapeHtml(user.name || 'N/A')}</span>
                </div>
            </div>
            ${user.email ? `
            <div class="detail-item">
                <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </div>
                <div class="detail-content">
                    <span class="detail-label">Email Address</span>
                    <span class="detail-value">${escapeHtml(user.email)}</span>
                </div>
            </div>
            ` : ''}
            <div class="detail-item">
                <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="16" rx="2"/>
                        <line x1="7" y1="9" x2="17" y2="9"/>
                        <line x1="7" y1="13" x2="13" y2="13"/>
                    </svg>
                </div>
                <div class="detail-content">
                    <span class="detail-label">Unique ID</span>
                    <span class="detail-value">${escapeHtml(user.uid || 'N/A')}</span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <div class="detail-content">
                    <span class="detail-label">Registration Date</span>
                    <span class="detail-value">${escapeHtml(formatDate(user.date) || 'N/A')}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

function displayNotFound(query) {
    resultSection.innerHTML = '';
    resultSection.classList.remove('hidden');

    const card = document.createElement('div');
    card.className = 'result-card not-found';

    card.innerHTML = `
        <div class="result-header">
            <div class="result-icon not-found">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            </div>
            <div class="result-title-section">
                <h3 class="result-title">No Record Found</h3>
                <p class="result-subtitle">We couldn't find any matching credentials</p>
            </div>
            <div class="result-badge not-found">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Not Found
            </div>
        </div>
        <div class="not-found-message">
            <p>No record was found for "<strong>${escapeHtml(query)}</strong>". Please check your ${currentSearchType === 'uid' ? 'UID' : 'name'} and try again.</p>
            <button class="retry-btn" onclick="retrySearch()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg>
                Try Again
            </button>
        </div>
    `;

    resultSection.appendChild(card);
}

function displayError() {
    resultSection.innerHTML = '';
    resultSection.classList.remove('hidden');

    const card = document.createElement('div');
    card.className = 'result-card not-found';

    card.innerHTML = `
        <div class="result-header">
            <div class="result-icon not-found">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <div class="result-title-section">
                <h3 class="result-title">Connection Error</h3>
                <p class="result-subtitle">Unable to verify at this moment</p>
            </div>
        </div>
        <div class="not-found-message">
            <p>We're having trouble connecting to our servers. Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="handleSearch()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                </svg>
                Retry
            </button>
        </div>
    `;

    resultSection.appendChild(card);
}

// ================================
// Helper Functions
// ================================
function showLoading() {
    loadingState.classList.remove('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function hideResults() {
    resultSection.classList.add('hidden');
    resultSection.innerHTML = '';
}

function shakeInput() {
    searchInput.parentElement.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        searchInput.parentElement.style.animation = '';
    }, 500);
}

function retrySearch() {
    searchInput.value = '';
    searchInput.focus();
    hideResults();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return null;

    // Handle various date formats
    // The API returns dates in DD/MM/YYYY or D/M/YYYY format
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (month >= 1 && month <= 12) {
        return `${months[month - 1]} ${day}, ${year}`;
    }

    return dateStr;
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-8px); }
        80% { transform: translateX(8px); }
    }
`;
document.head.appendChild(style);

// Make functions available globally
window.handleSearch = handleSearch;
window.retrySearch = retrySearch;
