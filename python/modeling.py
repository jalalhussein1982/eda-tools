# modeling.py - Regression modeling and diagnostics

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import r2_score, mean_squared_error
import json

def fit_all_models(df, ivs, dvs, config):
    """
    Fit regression models for each DV against all IVs
    """
    if isinstance(config, str):
        config = json.loads(config)
    
    results = {}
    
    for dv in dvs:
        dv_results = {}
        
        # Prepare data
        X = df[ivs].values
        y = df[dv].values
        
        # Linear regression
        if config.get('regressionModels', {}).get('linear', True):
            linear_model = fit_linear_regression(X, y, ivs, dv)
            dv_results['linear'] = linear_model
        
        # Polynomial regression
        if config.get('regressionModels', {}).get('polynomial', False):
            poly_models = []
            for degree in [2, 3]:
                poly_model = fit_polynomial_regression(X, y, ivs, dv, degree)
                poly_models.append(poly_model)
            dv_results['polynomial'] = poly_models
        
        results[dv] = dv_results
    
    return results

def fit_linear_regression(X, y, feature_names, target_name):
    """
    Fit linear regression model
    """
    model = LinearRegression()
    model.fit(X, y)
    
    y_pred = model.predict(X)
    residuals = y - y_pred
    
    # Calculate metrics
    r2 = r2_score(y, y_pred)
    adj_r2 = 1 - (1 - r2) * (len(y) - 1) / (len(y) - X.shape[1] - 1)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    
    # F-statistic and p-value
    n = len(y)
    p = X.shape[1]
    f_stat = (r2 / p) / ((1 - r2) / (n - p - 1))
    f_pvalue = 1 - stats.f.cdf(f_stat, p, n - p - 1)
    
    # Coefficient p-values (simplified)
    se = np.sqrt(np.diag(np.linalg.inv(X.T @ X) * (residuals ** 2).sum() / (n - p - 1)))
    t_stats = model.coef_ / se
    p_values = [2 * (1 - stats.t.cdf(abs(t), n - p - 1)) for t in t_stats]
    
    results = {
        'intercept': float(model.intercept_),
        'coefficients': {name: float(coef) for name, coef in zip(feature_names, model.coef_)},
        'p_values': {name: float(p) for name, p in zip(feature_names, p_values)},
        'r_squared': float(r2),
        'adj_r_squared': float(adj_r2),
        'rmse': float(rmse),
        'f_statistic': float(f_stat),
        'f_pvalue': float(f_pvalue),
        'residuals': residuals.tolist()[:1000],  # Limit size
        'predictions': y_pred.tolist()[:1000]
    }
    
    return results

def fit_polynomial_regression(X, y, feature_names, target_name, degree):
    """
    Fit polynomial regression model
    """
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    X_poly = poly.fit_transform(X)
    
    model = LinearRegression()
    model.fit(X_poly, y)
    
    y_pred = model.predict(X_poly)
    
    # Calculate metrics
    r2 = r2_score(y, y_pred)
    adj_r2 = 1 - (1 - r2) * (len(y) - 1) / (len(y) - X_poly.shape[1] - 1)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    
    # AIC and BIC
    n = len(y)
    p = X_poly.shape[1]
    rss = ((y - y_pred) ** 2).sum()
    aic = n * np.log(rss / n) + 2 * p
    bic = n * np.log(rss / n) + p * np.log(n)
    
    results = {
        'degree': degree,
        'r_squared': float(r2),
        'adj_r_squared': float(adj_r2),
        'rmse': float(rmse),
        'aic': float(aic),
        'bic': float(bic)
    }
    
    return results
