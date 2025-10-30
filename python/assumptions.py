# assumptions.py - Test regression assumptions

import pandas as pd
import numpy as np
from scipy import stats
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.stattools import durbin_watson
from statsmodels.tools.tools import add_constant

def test_all_assumptions(df, ivs, dvs):
    """
    Test all regression assumptions
    """
    results = {}
    
    for dv in dvs:
        X = df[ivs].values
        y = df[dv].values
        
        # Fit model to get residuals
        from sklearn.linear_model import LinearRegression
        model = LinearRegression()
        model.fit(X, y)
        y_pred = model.predict(X)
        residuals = y - y_pred
        
        dv_assumptions = {}
        
        # 1. Linearity (using residuals vs fitted)
        linearity_corr = np.corrcoef(y_pred, residuals)[0, 1]
        dv_assumptions['linearity'] = {
            'correlation': float(linearity_corr),
            'passed': abs(linearity_corr) < 0.1
        }
        
        # 2. Independence (Durbin-Watson)
        dw_stat = durbin_watson(residuals)
        dv_assumptions['independence'] = {
            'durbin_watson': float(dw_stat),
            'passed': 1.5 < dw_stat < 2.5
        }
        
        # 3. Homoscedasticity (Breusch-Pagan)
        try:
            X_with_const = add_constant(X)
            bp_stat, bp_pvalue, _, _ = het_breuschpagan(residuals, X_with_const)
            dv_assumptions['homoscedasticity'] = {
                'breusch_pagan_stat': float(bp_stat),
                'breusch_pagan_pvalue': float(bp_pvalue),
                'passed': bp_pvalue > 0.05
            }
        except:
            dv_assumptions['homoscedasticity'] = {
                'error': 'Could not compute Breusch-Pagan test',
                'passed': None
            }
        
        # 4. Normality of residuals (Shapiro-Wilk)
        if len(residuals) < 5000:
            sw_stat, sw_pvalue = stats.shapiro(residuals)
            dv_assumptions['normality_residuals'] = {
                'shapiro_wilk_stat': float(sw_stat),
                'shapiro_wilk_pvalue': float(sw_pvalue),
                'passed': sw_pvalue > 0.05
            }
        else:
            # Use Anderson-Darling for large samples
            anderson_result = stats.anderson(residuals)
            dv_assumptions['normality_residuals'] = {
                'anderson_stat': float(anderson_result.statistic),
                'passed': anderson_result.statistic < anderson_result.critical_values[2]
            }
        
        results[dv] = dv_assumptions
    
    return results
