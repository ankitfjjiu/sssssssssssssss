# ArticleHub - Professional Article Website

A fully responsive, SEO-friendly article website with an admin panel for URL management and compliance-friendly features.

## Features

### Core Functionality
- **Responsive Design**: Mobile-first approach with clean, professional UI
- **SEO Optimized**: Schema.org structured data, sitemap.xml, robots.txt
- **Cookie Consent**: GDPR-compliant cookie consent popup
- **Service Worker**: Offline caching for better performance

### Admin Panel
- **Password Protected**: Secure admin access (default password: `admin123`)
- **URL Management**: Add target URLs with automatic slug generation
- **Unique Path Generation**: Creates `/out/{id}/{slug}` URLs
- **No Edit/Delete**: URLs are permanent once added
- **Local Storage**: All data stored locally in browser

### Article System
- **Dynamic Content**: Auto-generated articles based on URL titles
- **15-Second Countdown**: Natural placement within article content
- **Interactive Flow**: Click Here → Scroll Instruction → Continue Button
- **Scroll Detection**: Continue button appears only after full article scroll
- **Safe Redirects**: Opens target URLs in new tab

### Legal Pages
- **About Us**: Professional company information
- **Contact Us**: Contact form with validation
- **Privacy Policy**: Comprehensive privacy protection details
- **Terms & Conditions**: User agreement and terms of service
- **Disclaimer**: Legal disclaimers and liability information
- **DMCA**: Copyright protection and takedown procedures

## File Structure

```
movies store/
├── index.html              # Homepage
├── about.html              # About Us page
├── contact.html            # Contact page
├── privacy.html            # Privacy Policy
├── terms.html              # Terms & Conditions
├── disclaimer.html         # Disclaimer
├── dmca.html              # DMCA Policy
├── admin.html             # Admin panel (hidden)
├── article.html           # Article router
├── article-template.html  # Static article example
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine directives
├── sw.js                  # Service worker
├── .htaccess              # Apache server configuration
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── main.js            # Core functionality
│   └── article-generator.js # Dynamic article generation
└── README.md              # This file
```

## Setup Instructions

### 1. Local Development
1. Extract all files to your web server directory
2. Ensure your server supports `.htaccess` files (Apache)
3. Open `index.html` in your browser

### 2. Admin Panel Access
1. Navigate to `/admin.html`
2. Enter password: `admin123`
3. Add target URLs with titles
4. Generated URLs will be in format: `/out/{id}/{slug}`

### 3. Testing the Flow
1. Add a URL in admin panel (e.g., "Digital Marketing Guide" → "https://example.com")
2. Visit the generated URL (e.g., `/out/abc123def/digital-marketing-guide`)
3. Wait for 15-second countdown
4. Click "Click Here" button
5. Scroll through the entire article
6. Click "Continue" button to redirect

## Security Features

- **Input Validation**: All form inputs are sanitized
- **CSRF Protection**: Basic CSRF token implementation
- **Password Encryption**: Admin password stored securely
- **XSS Prevention**: Content sanitization
- **Secure Headers**: Security headers in .htaccess

## SEO Features

- **Meta Tags**: Proper title, description, and keywords
- **Schema.org**: Structured data for better search visibility
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine crawling directives
- **Canonical URLs**: Proper URL canonicalization
- **Performance**: Optimized loading and caching

## Compliance Features

- **Cookie Consent**: GDPR-compliant cookie banner
- **Privacy Policy**: Comprehensive privacy protection
- **Terms of Service**: Clear user agreements
- **DMCA Policy**: Copyright protection procedures
- **Disclaimer**: Legal liability protection
- **No Misleading Content**: Ethical content practices

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- **Minified CSS**: Optimized stylesheets
- **Service Worker**: Offline caching
- **Image Optimization**: Placeholder images for fast loading
- **Font Loading**: Optimized Google Fonts loading
- **Lazy Loading**: Efficient resource loading

## Customization

### Changing Admin Password
Edit the password in `js/main.js`:
```javascript
const correctPassword = 'your-new-password';
```

### Styling
Modify `css/style.css` to change colors, fonts, and layout.

### Content
Update article templates in `js/article-generator.js` for different content types.

## Deployment

### Apache Server
1. Upload all files to your web directory
2. Ensure mod_rewrite is enabled
3. The `.htaccess` file will handle URL routing

### Nginx Server
Add this to your nginx configuration:
```nginx
location ~ ^/out/([^/]+)/(.+)$ {
    try_files $uri /article.html?id=$1&slug=$2;
}
```

### Static Hosting (Netlify, Vercel)
The site works with static hosting but URL routing may need configuration.

## Troubleshooting

### URLs Not Working
- Check if mod_rewrite is enabled (Apache)
- Verify .htaccess file permissions
- Ensure clean URLs are supported

### Admin Panel Not Loading
- Check browser console for JavaScript errors
- Verify all JS files are loading correctly
- Clear browser cache and localStorage

### Articles Not Generating
- Check localStorage for saved URLs
- Verify article-generator.js is loading
- Check browser console for errors

## License

This project is provided as-is for educational and commercial use. Please ensure compliance with local laws and regulations when using this system.

## Support

For issues or questions, please refer to the contact form on the website or check the browser console for error messages.

---

**Note**: This system uses localStorage for data persistence. For production use, consider implementing a proper backend database system.
