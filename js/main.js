// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Cookie Consent
    initCookieConsent();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Cookie Consent Functionality
function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');
    
    if (!cookieConsent) return;
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice) {
        // Show cookie banner after 2 seconds
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 2000);
    }
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.remove('show');
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'declined');
            cookieConsent.classList.remove('show');
        });
    }
}

// Admin Panel Functionality
class AdminPanel {
    constructor() {
        this.urls = [];
        this.isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
        this.adminPassword = 'admin123'; // fallback
        this.init();
    }
    
    async init() {
        if (window.location.pathname.includes('admin')) {
            // Test Supabase connection
            await this.initializeDatabase();
            
            if (!this.isAuthenticated) {
                this.showLoginForm();
            } else {
                await this.showAdminPanel();
            }
        }
    }
    
    async initializeDatabase() {
        try {
            // Test connection and get admin password
            const connected = await SupabaseDB.testConnection();
            if (connected) {
                this.adminPassword = await SupabaseDB.getAdminPassword();
                console.log('✅ Database initialized successfully');
            } else {
                console.warn('⚠️ Using fallback mode (localStorage)');
            }
        } catch (err) {
            console.warn('⚠️ Database initialization failed, using fallback mode');
        }
    }
    
    showLoginForm() {
        const container = document.querySelector('.admin-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-panel">
                <h2 class="admin-title">Admin Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Password:</label>
                        <input type="password" id="adminPassword" class="form-input" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Login</button>
                </form>
            </div>
        `;
        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.authenticate();
        });
    }
    
    async authenticate() {
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.adminPassword) {
            sessionStorage.setItem('adminAuth', 'true');
            this.isAuthenticated = true;
            await this.showAdminPanel();
        } else {
            alert('Invalid password');
        }
    }
    
    async showAdminPanel() {
        const container = document.querySelector('.admin-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-panel">
                <h2 class="admin-title">Admin Panel</h2>
                <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #0066cc;">
                        <strong>🔗 Database:</strong> Connected to Supabase
                        <span style="float: right;">
                            <button onclick="adminPanel.refreshData()" class="btn btn-sm" style="padding: 4px 8px; font-size: 0.8rem;">🔄 Refresh</button>
                        </span>
                    </p>
                </div>
                <form id="urlForm">
                    <div class="form-group">
                        <label class="form-label">Target URL:</label>
                        <input type="url" id="targetUrl" class="form-input" required placeholder="https://example.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Title:</label>
                        <input type="text" id="urlTitle" class="form-input" required placeholder="Article Title">
                    </div>
                    <button type="submit" class="btn btn-primary">Add URL</button>
                </form>
                <div class="url-list" id="urlList"></div>
            </div>
        `;
        
        document.getElementById('urlForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUrl();
        });
        
        // Load URLs from database
        await this.loadUrls();
        this.displayUrls();
    }
    
    async loadUrls() {
        try {
            this.urls = await SupabaseDB.getAllUrls();
        } catch (err) {
            console.warn('Failed to load URLs from database, using localStorage fallback');
            this.urls = JSON.parse(localStorage.getItem('adminUrls') || '[]');
        }
    }
    
    async refreshData() {
        await this.loadUrls();
        this.displayUrls();
        
        // Show success message
        const refreshBtn = document.querySelector('button[onclick="adminPanel.refreshData()"]');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '✅ Updated';
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
            }, 1500);
        }
    }
    
    async addUrl() {
        const targetUrl = document.getElementById('targetUrl').value;
        const title = document.getElementById('urlTitle').value;
        
        if (!this.isValidUrl(targetUrl)) {
            alert('Please enter a valid URL');
            return;
        }
        
        const urlData = {
            id: this.generateId(),
            targetUrl: targetUrl,
            title: title,
            slug: this.generateSlug(title),
            createdAt: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = document.querySelector('#urlForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Adding...';
        submitBtn.disabled = true;
        
        try {
            // Save to Supabase
            const saved = await SupabaseDB.saveGeneratedUrl(urlData);
            
            if (saved) {
                this.urls.push(urlData);
                
                // Also save to localStorage as backup
                localStorage.setItem('adminUrls', JSON.stringify(this.urls));
                
                // Clear form
                document.getElementById('targetUrl').value = '';
                document.getElementById('urlTitle').value = '';
                
                this.displayUrls();
                alert('✅ URL added successfully to database!');
            } else {
                // Fallback to localStorage only
                this.urls.push(urlData);
                localStorage.setItem('adminUrls', JSON.stringify(this.urls));
                
                document.getElementById('targetUrl').value = '';
                document.getElementById('urlTitle').value = '';
                
                this.displayUrls();
                alert('⚠️ URL added to local storage (database unavailable)');
            }
        } catch (err) {
            console.error('Error adding URL:', err);
            alert('❌ Failed to add URL. Please try again.');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    generateSlug(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    
    displayUrls() {
        const urlList = document.getElementById('urlList');
        if (!urlList) return;
        
        if (this.urls.length === 0) {
            urlList.innerHTML = '<p>No URLs added yet.</p>';
            return;
        }
        
        const baseUrl = window.location.origin;
        
        urlList.innerHTML = '<h3>Added URLs:</h3>' + this.urls.map(url => {
            // Create both hash-based and query-based URLs for compatibility
            const hashUrl = `${baseUrl}/article.html#/out/${url.id}/${url.slug}`;
            const queryUrl = `${baseUrl}/article.html?id=${url.id}&slug=${url.slug}`;
            
            return `
            <div class="url-item">
                <h4>${url.title}</h4>
                <p><strong>Target:</strong> ${url.targetUrl}</p>
                <p><strong>Generated URL:</strong></p>
                <div class="generated-url-container">
                    <div class="generated-url">${queryUrl}</div>
                    <div class="url-actions">
                        <button class="btn btn-primary btn-sm" onclick="openArticle('${url.id}', '${url.slug}')">
                            <span>🔗</span> Open
                        </button>
                        <button class="btn btn-success btn-sm" onclick="copyToClipboard('${queryUrl}', this)">
                            <span>📋</span> Copy
                        </button>
                    </div>
                </div>
                <p><strong>Created:</strong> ${new Date(url.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        }).join('');
    }
}

// Article Page Functionality
class ArticlePage {
    constructor() {
        this.hasClickedButton = false;
        this.hasScrolledToBottom = false;
        this.targetUrl = window.articleTargetUrl || '';
        this.init();
    }
    
    init() {
        // Check if this is an article page or if target URL is set
        if (window.location.pathname.startsWith('/out/') || this.targetUrl) {
            this.setupArticlePage();
        }
    }
    
    show404() {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h1>404 - Article Not Found</h1>
                <p>The article you're looking for doesn't exist.</p>
                <a href="/" class="btn btn-primary">Go Home</a>
            </div>
        `;
    }
    
    setupArticlePage() {
        this.startCountdown();
        this.setupScrollDetection();
    }
    
    startCountdown() {
        const countdownContainer = document.querySelector('.countdown-container');
        if (!countdownContainer) return;
        
        let timeLeft = 15;
        const timerElement = countdownContainer.querySelector('.countdown-timer');
        
        const countdown = setInterval(() => {
            timerElement.textContent = timeLeft;
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(countdown);
                this.showClickButton();
            }
        }, 1000);
    }
    
    showClickButton() {
        const countdownContainer = document.querySelector('.countdown-container');
        if (!countdownContainer) return;
        
        countdownContainer.innerHTML = `
            <button class="click-here-btn" id="clickHereBtn">Click Here</button>
        `;
        
        document.getElementById('clickHereBtn').addEventListener('click', () => {
            this.handleClickHere();
        });
    }
    
    handleClickHere() {
        this.hasClickedButton = true;
        const countdownContainer = document.querySelector('.countdown-container');
        if (countdownContainer) {
            countdownContainer.innerHTML = `
                <div class="scroll-instruction">Scroll down and continue</div>
            `;
        }
        
        this.checkShowContinueButton();
    }
    
    setupScrollDetection() {
        let ticking = false;
        
        const checkScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Check if user has scrolled to bottom (with some tolerance)
            if (scrollTop + windowHeight >= documentHeight - 100) {
                this.hasScrolledToBottom = true;
                this.checkShowContinueButton();
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(checkScroll);
                ticking = true;
            }
        });
    }
    
    checkShowContinueButton() {
        if (this.hasClickedButton && this.hasScrolledToBottom) {
            this.showContinueButton();
        }
    }
    
    showContinueButton() {
        const continueBtn = document.querySelector('.continue-btn');
        if (continueBtn && this.targetUrl) {
            continueBtn.classList.add('show');
            continueBtn.addEventListener('click', () => {
                window.open(this.targetUrl, '_blank');
            });
        }
    }
}

// Security and Validation
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateCSRF() {
    // Basic CSRF protection - in production, use proper tokens
    const token = sessionStorage.getItem('csrfToken') || Math.random().toString(36);
    sessionStorage.setItem('csrfToken', token);
    return token;
}

// Open article function
function openArticle(id, slug) {
    const url = `article.html?id=${id}&slug=${slug}`;
    window.open(url, '_blank');
}

// Copy to clipboard function
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(function() {
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✅</span> Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(function(err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✅</span> Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    });
}

// Initialize components based on page
if (window.location.pathname.includes('admin')) {
    new AdminPanel();
} else if (window.location.pathname.startsWith('/out/')) {
    new ArticlePage();
}

// Form validation
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.classList.contains('needs-validation')) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = '#28a745';
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert('Please fill in all required fields.');
        }
    }
});

// Performance optimization - Only register service worker on HTTP/HTTPS
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function(error) {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}
