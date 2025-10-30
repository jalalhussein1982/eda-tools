# preprocessing.py - Data preprocessing and quality assessment

import pandas as pd
import numpy as np
import json

def assess_data_quality(df, selected_columns):
    """
    Assess data quality for selected columns
    Returns dict with issues per column
    """
    quality_report = {}
    
    for col in selected_columns:
        issues = {}
        
        # Check missing values
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            issues['missing_count'] = int(missing_count)
            issues['missing_percent'] = float(missing_count / len(df) * 100)
            issues['median'] = float(df[col].median())
            issues['mean'] = float(df[col].mean())
        
        # Check for outliers using IQR method
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
        if outliers > 0:
            issues['outlier_count'] = int(outliers)
            issues['lower_bound'] = float(lower_bound)
            issues['upper_bound'] = float(upper_bound)
        
        if issues:
            quality_report[col] = issues
    
    return quality_report

def preprocess_data(df, selected_columns, missing_strategy, outlier_decisions):
    """
    Apply preprocessing decisions
    """
    df_clean = df[selected_columns].copy()
    
    # Parse JSON strings if needed
    if isinstance(missing_strategy, str):
        missing_strategy = json.loads(missing_strategy)
    if isinstance(outlier_decisions, str):
        outlier_decisions = json.loads(outlier_decisions)
    
    # Handle missing values
    for col, strategy in missing_strategy.items():
        if strategy == 'drop':
            df_clean = df_clean.dropna(subset=[col])
        elif strategy == 'median':
            df_clean[col].fillna(df_clean[col].median(), inplace=True)
        elif strategy == 'mean':
            df_clean[col].fillna(df_clean[col].mean(), inplace=True)
    
    # Handle outliers
    for col, decision in outlier_decisions.items():
        if decision == 'remove':
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df_clean = df_clean[(df_clean[col] >= lower_bound) & (df_clean[col] <= upper_bound)]
    
    return df_clean
