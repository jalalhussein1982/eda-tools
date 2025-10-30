# Statistical EDA Tool

A browser-based exploratory data analysis tool for researchers. Performs comprehensive statistical analysis entirely in the browser using Python (via Pyodide).

## Features

- **Client-Side Processing**: All computation happens in your browser - your data never leaves your computer
- **Comprehensive EDA**: Distribution analysis, correlation matrices, regression modeling, assumption testing
- **Multiple Statistical Methods**: Pearson, Spearman, Kendall correlations; Linear and polynomial regression; VIF calculation
- **Assumption Testing**: Normality, homoscedasticity, independence, linearity tests
- **Interactive Reports**: HTML reports with visualizations and plain-language interpretations
- **Offline Capable**: Works offline after first load (via Service Worker)
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- **Configuration Save/Load**: Export and import analysis configurations for reproducibility

## System Requirements

- **Modern Browser**: Chrome 90+, Firefox 89+, Safari 15.2+, or Edge 90+
- **RAM**: Minimum 4GB (8GB+ recommended for larger datasets)
- **Dataset Size**: Up to 500MB (practical limit depends on available RAM)

## Installation

### Option 1: Local Development Server

1. Clone or download this repository
2. Navigate to the project directory
3. Start a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # OR using Node.js
   npx http-server -p 8000
   ```
4. Open http://localhost:8000 in your browser

### Option 2: Deploy to University Server

1. Upload all files to your web server maintaining the directory structure:
   ```
   /eda-tool/
   ├── index.html
   ├── service-worker.js
   ├── css/
   │   └── style.css
   ├── js/
   │   ├── main.js
   │   ├── utils.js
   │   ├── state-manager.js
   │   ├── pyodide-loader.js
   │   ├── ui-controller.js
   │   ├── data-handler.js
   │   └── visualization.js
   ├── python/
   │   ├── eda_core.py
   │   ├── preprocessing.py
   │   ├── distribution.py
   │   ├── correlation.py
   │   ├── modeling.py
   │   ├── assumptions.py
   │   └── report_generator.py
   └── assets/ (optional sample datasets)
   ```

2. Ensure MIME types are configured:
   - `.js` → `application/javascript`
   - `.py` → `text/plain`
   - `.css` → `text/css`

3. Enable HTTPS (required for Service Worker)

### Option 3: GitHub Pages (Recommended)

1. Create a GitHub repository
2. Upload all files
3. Enable GitHub Pages in repository settings
4. Access via `https://username.github.io/repository-name/`

## Usage Guide

### Step 1: Upload Data
- Drag and drop a CSV or Excel file (.csv, .xlsx, .xls)
- Or load a sample dataset to explore the tool
- Maximum file size: 500 MB

### Step 2: Select Variables
- Choose **Independent Variables (IVs)**: Your predictors
- Choose **Dependent Variables (DVs)**: Your outcomes
- Drag variables between sections or click to add

### Step 3: Data Quality Check
- Review missing values and outliers
- Make decisions on how to handle them:
  - Missing data: Drop, impute with median, or impute with mean
  - Outliers: Keep or remove

### Step 4: Distribution Analysis
- Review normality tests for each variable
- Consider transformations if needed
- Tool will use appropriate tests based on normality

### Step 5: Configure Analysis
- Select correlation methods (Pearson, Spearman, Kendall)
- Enable VIF calculation for multicollinearity detection
- Choose regression models (linear, polynomial)
- Set significance level (α = 0.05 standard)
- Select report detail level

### Step 6: Run Analysis
- Click "Start Analysis"
- Wait for completion (typically 30-60 seconds)
- Review interactive HTML report

### Step 7: Results
- Download full HTML report
- Save configuration for future analyses
- Share results with collaborators

## Configuration Save/Load

### Save Configuration
1. Complete all analysis steps
2. Click "Save Configuration" button
3. Downloads a `.json` file with all your settings

### Load Configuration
1. Click "Load Previous Configuration"
2. Select your saved `.json` file
3. Analysis settings will be restored
4. Upload your data and proceed

Configuration includes:
- Variable selections (IVs/DVs)
- Missing data strategies
- Outlier decisions
- Analysis settings
- Report preferences

## Tips for Best Results

### Data Preparation
- **Clean column names**: Avoid special characters and spaces
- **Numeric data**: Tool works with numeric variables only
- **Sample size**: Minimum 30 observations recommended
- **Missing data**: Less than 20% missing per variable is ideal

### Analysis Quality
- **Start simple**: Begin with bivariate relationships before multivariate
- **Check assumptions**: Always review assumption test results
- **Multiple methods**: Compare Pearson and Spearman correlations
- **Effect size**: Don't rely solely on p-values

### Performance Optimization
- **Large datasets**: Consider sampling if >100,000 rows
- **Many variables**: Select only variables of interest (<20 recommended)
- **Close other tabs**: Free up browser memory for analysis

## Understanding Your Results

### Correlation Coefficients (ρ)
- **-1.0 to -0.7**: Strong negative relationship
- **-0.7 to -0.3**: Moderate negative relationship
- **-0.3 to 0.3**: Weak or no relationship
- **0.3 to 0.7**: Moderate positive relationship
- **0.7 to 1.0**: Strong positive relationship

### P-Values
- **p < 0.001**: Very strong evidence (***) 
- **p < 0.01**: Strong evidence (**)
- **p < 0.05**: Moderate evidence (*)
- **p ≥ 0.05**: Insufficient evidence (not significant)

### R² (R-squared)
- Proportion of variance explained (0 to 1)
- **0.0-0.3**: Weak predictive power
- **0.3-0.7**: Moderate predictive power
- **0.7-1.0**: Strong predictive power

### VIF (Variance Inflation Factor)
- Measures multicollinearity
- **VIF < 5**: No multicollinearity concern
- **VIF 5-10**: Moderate multicollinearity
- **VIF > 10**: Problematic multicollinearity (consider removing variable)

### Confidence Levels
- **High (80-100%)**: Findings are robust and reliable
- **Moderate (60-80%)**: Findings have some limitations
- **Low (40-60%)**: Interpret with caution
- **Very Low (<40%)**: Do not rely on this finding

## Troubleshooting

### Tool Won't Load
- **Browser compatibility**: Ensure you're using a modern browser
- **JavaScript enabled**: Check browser settings
- **Ad blockers**: Disable for this site
- **Console errors**: Open browser console (F12) for error messages

### Analysis Fails
- **File size**: Ensure file is under 500 MB
- **File format**: Only CSV and Excel files supported
- **Data types**: Ensure selected variables are numeric
- **Missing data**: Too much missing data (>50%) causes issues

### Slow Performance
- **Close tabs**: Free up browser memory
- **Reduce dataset**: Sample your data or select fewer variables
- **Refresh page**: Clear cache and reload
- **Use desktop**: Mobile devices have limited resources

### Results Seem Wrong
- **Check assumptions**: Review assumption test results
- **Verify data**: Ensure data loaded correctly
- **Sample size**: Small samples yield unreliable results
- **Outliers**: Extreme values can distort results

## Citation

When publishing research using this tool, please cite:

```
Statistical EDA Tool (Version 1.0.0). (2025). 
Retrieved from [Your University URL]
```

Or in BibTeX:

```bibtex
@misc{eda_tool_2025,
  title={Statistical EDA Tool},
  author={[Your University]},
  year={2025},
  version={1.0.0},
  url={[Your URL]},
  note={Browser-based exploratory data analysis tool}
}
```

## Privacy & Data Security

- **No data upload**: All processing happens in your browser
- **No server-side storage**: Your data never touches our servers
- **No tracking**: No analytics or user tracking
- **Local storage only**: Saved configurations stored locally in your browser
- **Clear data**: Close browser tab to clear all data from memory

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Python Runtime**: Pyodide (WebAssembly)
- **Visualization**: Plotly.js
- **Statistical Libraries**: NumPy, Pandas, SciPy, Statsmodels, scikit-learn

### Browser Storage
- **LocalStorage**: Saves analysis state and configuration
- **Service Worker Cache**: Enables offline functionality
- **No cookies**: Tool doesn't use cookies

### Computational Limits
- **Memory**: Limited by browser (~2GB typically)
- **CPU**: Single-threaded (Python in browser)
- **Time**: Large analyses may take several minutes

## Support & Feedback

For issues, questions, or suggestions:
- **Email**: [Your university support email]
- **GitHub Issues**: [If using GitHub]
- **Documentation**: [Link to extended documentation]

## License

[Specify your license - MIT, GPL, etc.]

## Acknowledgments

This tool uses:
- **Pyodide**: Python in the browser (Mozilla Foundation)
- **NumPy, Pandas, SciPy**: Scientific computing libraries
- **Statsmodels**: Statistical models and tests
- **Plotly.js**: Interactive visualizations

## Version History

### Version 1.0.0 (2025)
- Initial release
- Core EDA functionality
- Correlation and regression analysis
- Assumption testing
- HTML report generation
- Offline capability
- Configuration save/load

---

**Built for researchers, by researchers. Statistical rigor meets browser convenience.**
