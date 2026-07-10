import os
import shutil
import json
import pickle
import pandas as pd

print("Starting data copy script...")

# Create target directory
os.makedirs('public/data', exist_ok=True)

# 1. Copy Credit Risk files
credit_src = 'data/processed/credit_risk'
credit_files = [
    'credit_dashboard.json',
    'model_benchmark.json',
    'shap_importance.csv',
    'shap_waterfall_sample.csv',
    'pd_scores.csv',
    'shap_summary.png'
]
for f in credit_files:
    src_path = os.path.join(credit_src, f)
    dst_path = os.path.join('public/data', f)
    if os.path.exists(src_path):
        shutil.copy(src_path, dst_path)
        print(f"Copied credit file: {f}")

# 2. Copy Timeseries files
ts_src = 'data/processed/timeseries'
ts_files = [
    'stock_prices.csv',
    'forecast_results.json',
    'forecast_AAPL.csv',
    'forecast_MSFT.csv',
    'forecast_NVDA.csv'
]
for f in ts_files:
    src_path = os.path.join(ts_src, f)
    dst_path = os.path.join('public/data', f)
    if os.path.exists(src_path):
        shutil.copy(src_path, dst_path)
        print(f"Copied timeseries file: {f}")

# 3. Copy Portfolio files
port_src = 'data/processed/portfolio'
port_files = [
    'portfolio_results.json'
]
for f in port_files:
    src_path = os.path.join(port_src, f)
    dst_path = os.path.join('public/data', f)
    if os.path.exists(src_path):
        shutil.copy(src_path, dst_path)
        print(f"Copied portfolio file: {f}")

# 4. Copy and merge RAG chunks + metadata
rag_src = 'data/processed/rag'
chunks_path = os.path.join(rag_src, 'chunks.pkl')
meta_path = os.path.join(rag_src, 'metadata.pkl')

if os.path.exists(chunks_path) and os.path.exists(meta_path):
    with open(chunks_path, 'rb') as f:
        chunks = pickle.load(f)
    with open(meta_path, 'rb') as f:
        metadata = pickle.load(f)
    
    # Merge chunks into metadata
    combined = []
    for chunk, meta in zip(chunks, metadata):
        combined.append({
            'text': chunk,
            'company': meta['company'],
            'form': meta['form'],
            'section': meta['section'],
            'file': meta['file']
        })
    
    df = pd.DataFrame(combined)
    df.to_csv('public/data/chunks_metadata.csv', index=False)
    print("Created combined RAG chunks_metadata.csv in public/data")

print("Data copy complete!")
