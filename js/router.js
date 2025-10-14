// Simple Client-Side Router for ArticleHub
class SimpleRouter {
    constructor() {
        this.init();
    }
    
    init() {
        // Handle page load
        this.handleRoute();
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }
    
    handleRoute() {
        const path = window.location.pathname;
        const hash = window.location.hash;
        
        // Check if it's an article URL pattern
        if (path.includes('/out/') || hash.includes('#/out/')) {
            this.handleArticleRoute();
        }
    }
    
    handleArticleRoute() {
        let id, slug;
        
        // Try to get from hash first (for file:// protocol)
        const hash = window.location.hash;
        if (hash.includes('#/out/')) {
            const hashMatch = hash.match(/#\/out\/([^\/]+)\/(.+)$/);
            if (hashMatch) {
                id = hashMatch[1];
                slug = hashMatch[2];
            }
        }
        
        // Try to get from pathname
        if (!id || !slug) {
            const pathMatch = window.location.pathname.match(/\/out\/([^\/]+)\/(.+)$/);
            if (pathMatch) {
                id = pathMatch[1];
                slug = pathMatch[2];
            }
        }
        
        // Try to get from URL parameters
        if (!id || !slug) {
            const urlParams = new URLSearchParams(window.location.search);
            id = urlParams.get('id');
            slug = urlParams.get('slug');
        }
        
        if (id && slug) {
            this.loadArticlePage(id, slug);
        }
    }
    
    loadArticlePage(id, slug) {
        // Show loading immediately
        this.showLoading();
        
        // Get stored URLs from localStorage
        const urls = JSON.parse(localStorage.getItem('adminUrls') || '[]');
        const urlData = urls.find(url => url.id === id);
        
        if (!urlData) {
            setTimeout(() => this.show404(), 500);
            return;
        }
        
        // Generate and display article immediately after loading
        setTimeout(() => {
            this.generateArticlePage(urlData);
        }, 800);
    }
    
    showLoading() {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 100px 20px; font-family: Inter, sans-serif;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h2 style="color: #333; margin-bottom: 10px;">Loading Article...</h2>
                <p style="color: #666;">Preparing your content...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }
    
    generateArticlePage(urlData) {
        document.title = `${urlData.title} - ArticleHub`;
        
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = `Read about ${urlData.title} on ArticleHub. Professional insights and analysis.`;
        }
        
        // Generate article content
        const articleContent = this.generateArticleContent(urlData.title);
        
        // Replace page content
        document.body.innerHTML = this.getArticleHTML(urlData.title, articleContent, urlData.targetUrl);
        
        // Initialize article functionality
        setTimeout(() => {
            // Set target URL globally
            window.articleTargetUrl = urlData.targetUrl;
            
            // Initialize ArticlePage class
            if (typeof ArticlePage !== 'undefined') {
                new ArticlePage();
            } else {
                // Fallback: initialize manually
                this.initializeArticleFlow(urlData.targetUrl);
            }
        }, 500);
    }
    
    generateArticleContent(title) {
        const topics = this.extractTopics(title);
        
        return {
            introduction: this.generateIntroduction(title, topics),
            sections: this.generateSections(topics),
            conclusion: this.generateConclusion(title)
        };
    }
    
    extractTopics(title) {
        const commonTopics = {
            'business': ['strategy', 'growth', 'management', 'leadership'],
            'technology': ['innovation', 'digital', 'software', 'development'],
            'marketing': ['advertising', 'social media', 'branding', 'content'],
            'finance': ['investment', 'money', 'banking', 'economics'],
            'health': ['wellness', 'fitness', 'nutrition', 'medical'],
            'education': ['learning', 'training', 'skills', 'knowledge']
        };
        
        const titleLower = title.toLowerCase();
        let relevantTopics = [];
        
        for (const [category, topics] of Object.entries(commonTopics)) {
            if (titleLower.includes(category) || topics.some(topic => titleLower.includes(topic))) {
                relevantTopics = [...relevantTopics, ...topics];
            }
        }
        
        return relevantTopics.length > 0 ? relevantTopics.slice(0, 4) : ['general', 'information', 'insights', 'analysis'];
    }
    
    generateIntroduction(title, topics) {
        const intros = [
            `In today's rapidly evolving landscape, understanding ${title.toLowerCase()} has become increasingly important for professionals and enthusiasts alike.`,
            `This comprehensive guide explores the key aspects of ${title.toLowerCase()} and provides valuable insights for readers.`,
            `Whether you're new to ${title.toLowerCase()} or looking to deepen your knowledge, this article offers practical information and expert analysis.`
        ];
        
        return intros[Math.floor(Math.random() * intros.length)];
    }
    
    generateSections(topics) {
        const sections = [];
        
        topics.forEach((topic, index) => {
            sections.push({
                title: this.capitalizeWords(`Understanding ${topic} in Modern Context`),
                content: [
                    `The role of ${topic} has evolved significantly in recent years, driven by technological advances and changing market dynamics.`,
                    `Key considerations when approaching ${topic} include strategic planning, implementation best practices, and measuring success.`,
                    `Industry experts recommend a systematic approach that balances innovation with proven methodologies.`,
                    `By focusing on ${topic}, organizations can achieve better results and maintain competitive advantages in their respective markets.`
                ]
            });
        });
        
        return sections;
    }
    
    generateConclusion(title) {
        return `In conclusion, ${title.toLowerCase()} represents both opportunities and challenges in today's environment. By staying informed and adopting best practices, individuals and organizations can navigate this landscape successfully. Remember to continue learning and adapting as new developments emerge in this field.`;
    }
    
    capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
    
    getArticleHTML(title, content, targetUrl) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ArticleHub</title>
    <meta name="description" content="Read about ${title} on ArticleHub. Professional insights and analysis.">
    <link rel="stylesheet" href="css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <a href="index.html" class="logo">ArticleHub</a>
                </div>
                <div class="nav-menu" id="navMenu">
                    <ul class="nav-list">
                        <li><a href="index.html" class="nav-link">Home</a></li>
                        <li><a href="about.html" class="nav-link">About</a></li>
                        <li><a href="contact.html" class="nav-link">Contact</a></li>
                    </ul>
                </div>
                <div class="nav-toggle" id="navToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    </header>

    <section class="article-header">
        <div class="container">
            <h1 class="article-title-main">${title}</h1>
            <p class="article-meta-main">Published on ${new Date().toLocaleDateString()} | Professional Analysis</p>
        </div>
    </section>

    <main class="article-body">
        <div class="container">
            <div class="article-content-main">
                <p>${content.introduction}</p>
                
                ${content.sections.map(section => `
                    <h2>${section.title}</h2>
                    ${section.content.map(paragraph => `<p>${paragraph}</p>`).join('')}
                `).join('')}
                
                <div class="countdown-container">
                    <div class="countdown-timer">15</div>
                    <p class="countdown-text">Please wait while we prepare your content...</p>
                </div>
                
                <h2>Key Takeaways</h2>
                <p>Understanding the nuances of this topic requires careful consideration of multiple factors and perspectives. The insights shared in this article provide a foundation for further exploration and practical application.</p>
                
                <h2>Looking Forward</h2>
                <p>As this field continues to evolve, staying informed about new developments and best practices will be crucial for success. We encourage readers to continue their learning journey and apply these insights in their professional endeavors.</p>
                
                <p>${content.conclusion}</p>
                
                <button class="continue-btn" id="continueBtn" style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 500; cursor: pointer; opacity: 0; transform: translateY(20px); transition: all 0.5s ease;">Continue to Read</button>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3 class="footer-title">ArticleHub</h3>
                    <p class="footer-text">Your trusted source for professional articles and insights.</p>
                </div>
                <div class="footer-section">
                    <h4 class="footer-subtitle">Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 class="footer-subtitle">Legal</h4>
                    <ul class="footer-links">
                        <li><a href="privacy.html">Privacy Policy</a></li>
                        <li><a href="terms.html">Terms & Conditions</a></li>
                        <li><a href="disclaimer.html">Disclaimer</a></li>
                        <li><a href="dmca.html">DMCA</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 ArticleHub. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Set target URL for redirect
        window.articleTargetUrl = '${targetUrl}';
    </script>
    <script src="js/main.js"></script>
</body>
</html>`;
    }
    
    initializeArticleFlow(targetUrl) {
        let hasClickedButton = false;
        let hasScrolledToBottom = false;
        
        // Start countdown
        this.startCountdown();
        
        // Setup scroll detection
        this.setupScrollDetection(hasClickedButton, hasScrolledToBottom, targetUrl);
    }
    
    startCountdown() {
        const countdownContainer = document.querySelector('.countdown-container');
        if (!countdownContainer) return;
        
        let timeLeft = 15;
        const timerElement = countdownContainer.querySelector('.countdown-timer');
        
        const countdown = setInterval(() => {
            if (timerElement) {
                timerElement.textContent = timeLeft;
            }
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
            <button class="click-here-btn" id="clickHereBtn" style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 500; cursor: pointer; margin: 1rem 0; display: inline-block; transition: all 0.3s ease;">Read Article</button>
        `;
        
        document.getElementById('clickHereBtn').addEventListener('click', () => {
            this.handleClickHere();
        });
    }
    
    handleClickHere() {
        window.hasClickedButton = true;
        const countdownContainer = document.querySelector('.countdown-container');
        if (countdownContainer) {
            countdownContainer.innerHTML = `
                <button style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 500; cursor: default; margin: 1rem 0; display: inline-block;">Scroll down and continue</button>
            `;
        }
        
        this.checkShowContinueButton();
    }
    
    setupScrollDetection(hasClickedButton, hasScrolledToBottom, targetUrl) {
        let ticking = false;
        
        const checkScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Check if user has scrolled to bottom (with some tolerance)
            if (scrollTop + windowHeight >= documentHeight - 100) {
                window.hasScrolledToBottom = true;
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
        if (window.hasClickedButton && window.hasScrolledToBottom) {
            this.showContinueButton();
        }
    }
    
    showContinueButton() {
        const continueBtn = document.querySelector('.continue-btn');
        if (continueBtn && window.articleTargetUrl) {
            continueBtn.style.opacity = '1';
            continueBtn.style.transform = 'translateY(0)';
            continueBtn.addEventListener('click', () => {
                window.open(window.articleTargetUrl, '_blank');
            });
        }
    }
    
    show404() {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 100px 20px; font-family: Inter, sans-serif;">
                <h1 style="font-size: 3rem; color: #333; margin-bottom: 1rem;">404</h1>
                <h2 style="color: #666; margin-bottom: 2rem;">Article Not Found</h2>
                <p style="color: #999; margin-bottom: 2rem;">The article you're looking for doesn't exist or has been removed.</p>
                <a href="index.html" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Go Home</a>
            </div>
        `;
    }
}

// Initialize router
new SimpleRouter();
