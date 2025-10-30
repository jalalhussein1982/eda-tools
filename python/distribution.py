# distribution.py - Distribution analysis and normality testing

import pandas as pd
import numpy as np
from scipy import stats

def analyze_distributions(df, selected_columns):
    """
    Analyze distribution of each variable
    """
    results = {}
    
    for col in selected_columns:
        data = df[col].dropna()
        
        # Shapiro-Wilk test (for n < 5000)
        if len(data) < 5000:
            shapiro_stat, shapiro_p = stats.shapiro(data)
        else:
            # Use Anderson-Darling for larger samples
            shapiro_stat, shapiro_p = None, None
        
        # Anderson-Darling test
        anderson_result = stats.anderson(data)
        
        # Skewness and kurtosis
        skewness = float(stats.skew(data))
        kurtosis = float(stats.kurtosis(data))
        
        # Determine if normal (conservative: p > 0.05)
        is_normal = bool(shapiro_p > 0.05) if shapiro_p is not None else bool(abs(skewness) < 0.5)

        results[col] = {
            'shapiro_stat': float(shapiro_stat) if shapiro_stat is not None else None,
            'shapiro_p': float(shapiro_p) if shapiro_p is not None else None,
            'anderson_stat': float(anderson_result.statistic),
            'skewness': skewness,
            'kurtosis': kurtosis,
            'is_normal': is_normal,
            'mean': float(data.mean()),
            'median': float(data.median()),
            'std': float(data.std()),
            'min': float(data.min()),
            'max': float(data.max()),
            'values': data.tolist()[:1000]  # Limit for visualization
        }
    
    return results
