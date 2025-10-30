# Quick Start Guide - Get Running in 5 Minutes

## Fastest Way to Test (Local)

### Option 1: Python Server (Recommended)
```bash
cd eda-tool
python -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Node.js Server
```bash
cd eda-tool
npx http-server -p 8000
```
Then open: http://localhost:8000

### Option 3: VS Code Live Server
1. Open folder in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## First Test Run

1. **Wait for Python to load** (30-60 seconds on first load)
   - You'll see a progress bar
   - Educational tips display while loading

2. **Load Sample Dataset**
   - Click "Health Survey" button
   - Data preview appears instantly

3. **Select Variables**
   - Drag `life_satisfaction` to **Dependent Variables**
   - Drag `health_score`, `income`, `exercise_hours` to **Independent Variables**
   - Click "Next"

4. **Data Quality** 
   - No issues with sample data
   - Click "Next"

5. **Distributions**
   - Review normality tests
   - Click "Next"

6. **Configuration**
   - Keep defaults (Pearson + Spearman checked)
   - Click "Start Analysis"

7. **Results** (appears after ~30 seconds)
   - Interactive HTML report
   - Download button at top

**Total Time: 3-4 minutes including loading**

## Deploy to GitHub Pages (Free Hosting)

1. Create GitHub repository
2. Upload `eda-tool` folder contents
3. Settings → Pages → Enable Pages
4. Done! Access at: `https://username.github.io/repo-name/`

## File Structure
```
eda-tool/
├── index.html           # Main entry point
├── service-worker.js    # Offline capability
├── README.md            # Full documentation
├── DEPLOYMENT.md        # IT deployment guide
├── css/
│   └── style.css       # All styling
├── js/
│   ├── main.js         # App initialization
│   ├── utils.js        # Utility functions
│   ├── state-manager.js    # State management
│   ├── pyodide-loader.js   # Python loader
│   ├── ui-controller.js    # UI interactions
│   ├── data-handler.js     # Data processing
│   └── visualization.js    # Plotly helpers
├── python/
│   ├── eda_core.py         # Main orchestration
│   ├── preprocessing.py     # Data cleaning
│   ├── distribution.py      # Normality tests
│   ├── correlation.py       # Correlation analysis
│   ├── modeling.py          # Regression models
│   ├── assumptions.py       # Assumption tests
│   └── report_generator.py  # HTML reports
└── assets/
    └── sample_health.csv    # Sample dataset
```

## Customization

### Add Your Logo
Edit `index.html` line 27:
```html
<h1>Your University Logo Here</h1>
```

### Change Colors
Edit `css/style.css` lines 3-15 (CSS variables)

### Update Citation
Edit `README.md` and `python/report_generator.py`

## Common Issues

**"Tool won't load"**
→ Use modern browser (Chrome 90+, Firefox 89+, Safari 15.2+)

**"Python loading forever"**
→ Check internet connection (downloads ~100MB first time)

**"Analysis failed"**
→ Open browser console (F12) for error details

**"File too large"**
→ Maximum 500MB (browser memory limit)

## Next Steps

1. ✅ Test locally with sample data
2. ✅ Try your own CSV file
3. ✅ Read full README.md for details
4. ✅ Review DEPLOYMENT.md for production
5. ✅ Customize for your university

## Support

Questions? Check:
- **README.md**: Complete user guide
- **DEPLOYMENT.md**: IT deployment guide
- Browser console: Technical errors

---

**You're ready to go! Just start a local server and open in browser.**
