# Deployment Guide for University IT

## Quick Start

This is a **static website** - no server-side processing required. Simply upload files to your web server.

## Requirements

### Server Requirements
- **Type**: Static file hosting (Apache, Nginx, or any HTTP server)
- **HTTPS**: Required (for Service Worker functionality)
- **No backend needed**: No PHP, Node.js, Python, or database required
- **No special permissions**: Standard web hosting sufficient

### MIME Types
Ensure these MIME types are configured:
- `.js` → `application/javascript`
- `.py` → `text/plain`  
- `.css` → `text/css`
- `.html` → `text/html`
- `.json` → `application/json`

## Deployment Steps

### Method 1: Direct Upload (Simplest)

1. **Upload entire folder** to your web directory:
   ```
   /var/www/html/eda-tool/
   ```

2. **Set permissions**:
   ```bash
   chmod -R 755 /var/www/html/eda-tool/
   ```

3. **Test**: Visit `https://yourdomain.edu/eda-tool/`

### Method 2: Apache Configuration

1. Upload files to `/var/www/html/eda-tool/`

2. Create `.htaccess` (if not already present):
   ```apache
   # Enable HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # MIME types
   AddType application/javascript .js
   AddType text/plain .py
   AddType text/css .css
   
   # Caching for static assets
   <FilesMatch "\.(js|css|py)$">
       Header set Cache-Control "max-age=86400, public"
   </FilesMatch>
   
   # Enable compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/css application/javascript
   </IfModule>
   ```

3. Restart Apache:
   ```bash
   sudo systemctl restart apache2
   ```

### Method 3: Nginx Configuration

1. Upload files to `/usr/share/nginx/html/eda-tool/`

2. Add to nginx config (`/etc/nginx/sites-available/default`):
   ```nginx
   location /eda-tool/ {
       alias /usr/share/nginx/html/eda-tool/;
       
       # Force HTTPS
       if ($scheme = http) {
           return 301 https://$server_name$request_uri;
       }
       
       # MIME types
       types {
           application/javascript js;
           text/plain py;
           text/css css;
       }
       
       # Caching
       location ~* \.(js|css|py)$ {
           expires 1d;
           add_header Cache-Control "public, immutable";
       }
       
       # Compression
       gzip on;
       gzip_types text/css application/javascript;
   }
   ```

3. Reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Post-Deployment Verification

### 1. Check HTTPS
Visit: `https://yourdomain.edu/eda-tool/`
- Should NOT redirect to HTTP
- Should show green padlock in browser

### 2. Test Service Worker
1. Open browser console (F12)
2. Go to Application tab → Service Workers
3. Should see "ServiceWorker registered"

### 3. Test Core Functionality
1. Wait for Python environment to load (30-60 seconds)
2. Try loading sample dataset
3. Verify all stages work

### 4. Check Browser Console
- No errors should appear in console
- If errors, check MIME types and file paths

## Firewall & Security

### Ports
- **443 (HTTPS)**: Must be open
- **80 (HTTP)**: Can redirect to 443

### Security Headers (Recommended)
Add to Apache/Nginx config:
```
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

### CSP (Content Security Policy)
```
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.plot.ly; style-src 'self' 'unsafe-inline'; connect-src 'self' https://cdn.jsdelivr.net;"
```

Note: `unsafe-eval` required for Pyodide (Python in browser)

## Resource Usage

### Server Load
- **CPU**: Negligible (static files only)
- **RAM**: Minimal (<100MB)
- **Bandwidth**: ~100MB per user (first load), then cached
- **Storage**: ~5MB for application files

### User Resource Usage
- **First Load**: Downloads ~100MB (Python runtime + packages)
- **Subsequent Loads**: ~5MB (cached)
- **Browser RAM**: 2-4GB during analysis
- **CPU**: High during analysis (60 seconds)

## Scaling Considerations

### Expected Load
- **Concurrent Users**: Unlimited (no server processing)
- **Peak Usage**: Only affects bandwidth, not server CPU
- **CDN**: Can be used for static assets

### Performance Optimization
1. **Enable Gzip/Brotli compression**
2. **Set cache headers** for static files
3. **Use CDN** (optional) for JS/CSS
4. **Enable HTTP/2** for multiplexing

## Monitoring

### What to Monitor
- **HTTP 200 responses**: Should be >99%
- **Load times**: First load ~30-60s, repeat loads <5s
- **Error logs**: Watch for 404s or MIME type issues

### Common Issues
| Issue | Symptom | Solution |
|-------|---------|----------|
| Service Worker not loading | "Not available offline" | Enable HTTPS |
| Python not loading | Stuck at "Loading Python..." | Check MIME types for .js files |
| Analysis fails | "Analysis failed" error | Check browser console for errors |

## Backup & Updates

### Backup
```bash
tar -czf eda-tool-backup-$(date +%Y%m%d).tar.gz /var/www/html/eda-tool/
```

### Updates
1. Download new version
2. Test locally first
3. Backup current version
4. Upload new files
5. Clear browser cache for testing

## User Support

### Common User Issues
1. **"Tool won't load"** → Check browser version (Chrome 90+, Firefox 89+, Safari 15.2+)
2. **"Slow performance"** → Close other tabs, use desktop not mobile
3. **"File too large"** → Maximum 500MB, suggest sampling data

### Support Resources
- README.md: Complete user guide
- Browser console: Technical error messages
- Network tab: Check file loading issues

## Maintenance

### Regular Tasks
- **None required** - static site needs no maintenance
- Optional: Check access logs for usage patterns
- Optional: Monitor error logs

### Updates Needed When
- New Pyodide version released
- Security updates for dependencies
- Feature requests from users

## Cost Estimate

### University Hosting
- **Server cost**: $0 (using existing infrastructure)
- **Bandwidth**: ~10GB/month for 100 users (first month), ~1GB/month after (cached)
- **Maintenance**: 0 hours/month (static site)

### Alternative: GitHub Pages
- **Cost**: Free
- **Bandwidth**: Unlimited (within reason)
- **Maintenance**: Git push to update

## Troubleshooting for IT

### Service Worker Not Registering
**Cause**: Not served over HTTPS
**Fix**: Enable HTTPS and redirect HTTP to HTTPS

### Pyodide Fails to Load
**Cause**: CDN blocked or MIME types wrong
**Fix**: 
1. Check firewall allows cdn.jsdelivr.net
2. Verify .js files have correct MIME type

### Users Report "Out of Memory"
**Cause**: Dataset too large for browser
**Fix**: Add warning on upload for files >200MB

### CORS Errors
**Cause**: Trying to load resources from different domain
**Fix**: Ensure all resources served from same domain or enable CORS

## Contact for Issues

Technical issues with deployment:
- **Email**: [Your IT support email]
- **Phone**: [Your support number]
- **Escalation**: [Senior IT contact]

---

**This is a zero-maintenance, zero-server-load solution. Once deployed, it runs entirely in users' browsers.**
