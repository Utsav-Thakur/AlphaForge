import os
import re
import glob
import json
import pickle
import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.optimize import minimize

# Machine Learning Imports
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.linear_model import LogisticRegression
import shap

# PyTorch and Deep Learning Imports
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# RAG/Embedding Imports
from sentence_transformers import SentenceTransformer
import faiss

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)

print("Starting FintelliQ Model Building & Pre-computation Pipeline...\n")

# ==============================================================================
# MODEL 1 — Explainable Credit Risk (XGBoost + SHAP)
# ==============================================================================
print("--- MODEL 1: Explainable Credit Risk ---")
try:
    os.makedirs('data/processed/credit_risk', exist_ok=True)
    
    # Load credit data
    df = pd.read_csv('data/processed/credit_risk/credit_features.csv')
    target = 'is_default'

    # Select numeric features only
    drop_cols = [c for c in ['loan_status','grade','sub_grade','emp_length','home_ownership',
                              'verification_status','purpose','term','application_type',
                              'initial_list_status'] if c in df.columns]
    df_model = df.drop(columns=drop_cols + [target], errors='ignore').select_dtypes(include=[np.number])
    df_model[target] = df[target]
    df_model = df_model.dropna(subset=[target])

    # Fill nulls
    df_model = df_model.fillna(df_model.median(numeric_only=True))

    X = df_model.drop(columns=[target])
    y = df_model[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    # 3 benchmark models
    models = {
        'Logistic_Regression': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        'XGBoost': XGBClassifier(n_estimators=300, max_depth=4, learning_rate=0.05,
                                  scale_pos_weight=(y==0).sum()/(y==1).sum(),
                                  random_state=42, eval_metric='logloss', verbosity=0),
        'LightGBM': LGBMClassifier(n_estimators=300, max_depth=4, learning_rate=0.05,
                                    class_weight='balanced', random_state=42, verbose=-1),
    }

    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        proba = model.predict_proba(X_test)[:,1]
        pred = (proba >= 0.5).astype(int)
        auc = roc_auc_score(y_test, proba)
        results[name] = {
            'roc_auc': round(auc, 4),
            'f1': round(f1_score(y_test, pred), 4),
            'precision': round(precision_score(y_test, pred, zero_division=0), 4),
            'recall': round(recall_score(y_test, pred), 4),
        }
        print(f"  {name}: AUC={auc:.4f}")

    # SHAP on XGBoost
    xgb = models['XGBoost']
    explainer = shap.TreeExplainer(xgb)
    X_sample = X_test.sample(min(500, len(X_test)), random_state=42)
    shap_values = explainer.shap_values(X_sample)

    # Top 15 SHAP features
    shap_importance = pd.DataFrame({
        'feature': X.columns,
        'mean_abs_shap': np.abs(shap_values).mean(axis=0)
    }).sort_values('mean_abs_shap', ascending=False).head(15)

    # Save SHAP summary plot
    plt.figure(figsize=(10,8))
    shap.summary_plot(shap_values, X_sample, plot_type='bar', show=False, max_display=15)
    plt.tight_layout()
    plt.savefig('data/processed/credit_risk/shap_summary.png', dpi=150, bbox_inches='tight')
    plt.close()

    # Waterfall for single prediction (first sample in X_sample)
    single_idx = 0
    single_shap = shap_values[single_idx]
    single_features = X_sample.iloc[single_idx]
    waterfall_data = pd.DataFrame({
        'feature': X.columns,
        'shap_value': single_shap,
        'feature_value': single_features.values
    }).sort_values('shap_value', key=abs, ascending=False).head(10)

    # Save outputs
    with open('data/processed/credit_risk/model_benchmark.json','w') as f:
        json.dump(results, f)
    shap_importance.to_csv('data/processed/credit_risk/shap_importance.csv', index=False)
    waterfall_data.to_csv('data/processed/credit_risk/shap_waterfall_sample.csv', index=False)
    
    xgb_proba = xgb.predict_proba(X_test)[:,1]
    pd.DataFrame({'pd_score': xgb_proba, 'actual': y_test.values}).to_csv(
        'data/processed/credit_risk/pd_scores.csv', index=False)
    
    pickle.dump(xgb, open('data/processed/credit_risk/xgb_model.pkl','wb'))
    pickle.dump(X.columns.tolist(), open('data/processed/credit_risk/feature_names.pkl','wb'))

    # Dashboard JSON
    credit_dash = {
        'model_benchmark': results,
        'top_shap_features': shap_importance.to_dict('records'),
        'shap_waterfall': waterfall_data.to_dict('records'),
        'default_rate': round(float(y.mean()), 4),
        'total_loans': len(df),
        'avg_loan_amount': round(float(df['loan_amnt'].mean()), 2) if 'loan_amnt' in df else 0,
        'avg_fico': round(float(df['fico_score'].mean()), 1) if 'fico_score' in df else 0,
        'grade_default_rates': df.groupby('grade')['is_default'].mean().to_dict() if 'grade' in df else {},
    }
    with open('data/processed/credit_risk/credit_dashboard.json','w') as f:
        json.dump(credit_dash, f)
    print(f"Credit Risk complete — XGBoost AUC: {results.get('XGBoost',{}).get('roc_auc')}\n")
except Exception as e:
    print(f"Credit Risk failed: {e}\n")


# ==============================================================================
# MODEL 2 — Time Series Forecasting (Temporal Fusion Transformer logic using PyTorch)
# ==============================================================================
print("--- MODEL 2: Time Series Forecasting (PyTorch TFT-style) ---")
try:
    os.makedirs('data/processed/timeseries', exist_ok=True)
    prices = pd.read_csv('data/processed/timeseries/stock_prices.csv', index_col=0, parse_dates=True)

    # Focus on AAPL + MSFT + NVDA
    forecast_targets = [c for c in ['AAPL','MSFT','NVDA','RELIANCE.NS','TCS.NS'] if c in prices.columns][:3]

    def create_sequences(data, seq_len=60, pred_len=5):
        X_seq, y_seq = [], []
        for i in range(len(data) - seq_len - pred_len):
            X_seq.append(data[i:i+seq_len])
            y_seq.append(data[i+seq_len:i+seq_len+pred_len])
        return np.array(X_seq), np.array(y_seq)

    class TemporalBlock(nn.Module):
        """Simplified Temporal Fusion Transformer block"""
        def __init__(self, d_model=64, nhead=4, dropout=0.1):
            super().__init__()
            self.attention = nn.MultiheadAttention(d_model, nhead, dropout=dropout, batch_first=True)
            self.norm1 = nn.LayerNorm(d_model)
            self.ff = nn.Sequential(nn.Linear(d_model, d_model*4), nn.GELU(), nn.Linear(d_model*4, d_model))
            self.norm2 = nn.LayerNorm(d_model)
            self.dropout = nn.Dropout(dropout)

        def forward(self, x):
            attn, _ = self.attention(x, x, x)
            x = self.norm1(x + self.dropout(attn))
            x = self.norm2(x + self.dropout(self.ff(x)))
            return x

    class FinancialTransformer(nn.Module):
        def __init__(self, input_dim, seq_len, pred_len, d_model=64):
            super().__init__()
            self.input_proj = nn.Linear(input_dim, d_model)
            self.pos_enc = nn.Embedding(seq_len, d_model)
            self.blocks = nn.ModuleList([TemporalBlock(d_model) for _ in range(3)])
            self.head = nn.Linear(d_model, pred_len)

        def forward(self, x):
            B, T, F = x.shape
            pos = self.pos_enc(torch.arange(T, device=x.device).long()).unsqueeze(0)
            x = self.input_proj(x) + pos
            for block in self.blocks:
                x = block(x)
            return self.head(x[:,-1,:])  # predict from last token

    ts_results = {}
    SEQ_LEN, PRED_LEN = 60, 5

    for ticker in forecast_targets:
        try:
            series = prices[ticker].dropna()
            # Normalize
            mu, std = series.mean(), series.std()
            norm = (series.values - mu) / std

            # Add simple features: returns, MA, vol
            ret = np.diff(norm, prepend=norm[0])
            ma5 = pd.Series(norm).rolling(5).mean().fillna(0).values
            ma20 = pd.Series(norm).rolling(20).mean().fillna(0).values
            features = np.stack([norm, ret, ma5, ma20], axis=1)

            X_ts, y_ts = create_sequences(norm, SEQ_LEN, PRED_LEN)
            X_feat, _ = create_sequences(features, SEQ_LEN, PRED_LEN)

            split = int(len(X_ts) * 0.8)
            X_tr, X_va = torch.FloatTensor(X_feat[:split]), torch.FloatTensor(X_feat[split:])
            y_tr, y_va = torch.FloatTensor(y_ts[:split]), torch.FloatTensor(y_ts[split:])

            model_ts = FinancialTransformer(4, SEQ_LEN, PRED_LEN)
            opt = torch.optim.Adam(model_ts.parameters(), lr=0.001)

            for epoch in range(10):
                model_ts.train()
                loader = DataLoader(list(zip(X_tr, y_tr)), batch_size=64, shuffle=True)
                for xb, yb in loader:
                    opt.zero_grad()
                    loss = nn.MSELoss()(model_ts(xb), yb)
                    loss.backward()
                    opt.step()

            model_ts.eval()
            with torch.no_grad():
                pred = model_ts(X_va).numpy()
                actual = y_va.numpy()

            # Denormalize
            pred_denorm = pred * std + mu
            actual_denorm = actual * std + mu

            mae = np.abs(pred_denorm - actual_denorm).mean()
            mape = np.abs((pred_denorm - actual_denorm) / actual_denorm).mean() * 100

            ts_results[ticker] = {'mae': round(float(mae), 4), 'mape': round(float(mape), 2)}

            # Save predictions for dashboard
            pred_df = pd.DataFrame(pred_denorm, columns=[f'day_{i+1}' for i in range(PRED_LEN)])
            pred_df.to_csv(f'data/processed/timeseries/forecast_{ticker.replace(".","_")}.csv', index=False)

            torch.save(model_ts.state_dict(), f'data/processed/timeseries/ts_model_{ticker.replace(".","_")}.pth')
            print(f"  Forecast {ticker}: MAE={mae:.2f} MAPE={mape:.1f}%")
        except Exception as e:
            print(f"  Forecast {ticker} failed: {e}")

    with open('data/processed/timeseries/forecast_results.json','w') as f:
        json.dump(ts_results, f)
    print("Time series forecasting complete\n")
except Exception as e:
    print(f"Time series forecasting failed: {e}\n")


# ==============================================================================
# MODEL 3 — Portfolio Optimization (Markowitz + Sharpe Maximization + Monte Carlo)
# ==============================================================================
print("--- MODEL 3: Portfolio Optimization ---")
try:
    os.makedirs('data/processed/portfolio', exist_ok=True)
    
    def optimize_portfolio(returns_df, risk_free=0.0525, n_simulations=5000):
        mu = returns_df.mean() * 252
        cov = returns_df.cov() * 252
        n = len(mu)
        assets = returns_df.columns.tolist()

        # Monte Carlo simulation
        sim_results = []
        for _ in range(n_simulations):
            w = np.random.dirichlet(np.ones(n))
            ret = float(np.dot(w, mu))
            vol = float(np.sqrt(np.dot(w, np.dot(cov, w))))
            sharpe = (ret - risk_free) / vol if vol > 0 else 0
            sim_results.append({'weights': w.tolist(), 'return': ret, 'volatility': vol, 'sharpe': sharpe})

        sim_df = pd.DataFrame(sim_results)

        # Optimal portfolio: max Sharpe
        def neg_sharpe(w):
            ret = float(np.dot(w, mu))
            vol = float(np.sqrt(np.dot(w, np.dot(cov, w))))
            return -(ret - risk_free) / vol if vol > 0 else 0

        constraints = [{'type':'eq','fun':lambda w: np.sum(w)-1}]
        bounds = [(0.02, 0.4)] * n
        init_w = np.ones(n) / n

        result = minimize(neg_sharpe, init_w, method='SLSQP',
                          bounds=bounds, constraints=constraints)

        opt_w = result.x
        opt_ret = float(np.dot(opt_w, mu))
        opt_vol = float(np.sqrt(np.dot(opt_w, np.dot(cov, opt_w))))
        opt_sharpe = (opt_ret - risk_free) / opt_vol

        return {
            'assets': assets,
            'optimal_weights': {a: round(float(w),4) for a,w in zip(assets, opt_w)},
            'optimal_return': round(opt_ret*100, 2),
            'optimal_volatility': round(opt_vol*100, 2),
            'optimal_sharpe': round(opt_sharpe, 4),
            'individual_stats': {
                a: {'annual_return': round(float(mu[a])*100, 2),
                    'annual_volatility': round(float(np.sqrt(cov.loc[a,a]))*100, 2),
                    'sharpe': round((float(mu[a])-risk_free)/float(np.sqrt(cov.loc[a,a])),3)}
                for a in assets
            },
            'efficient_frontier': sim_df[['return','volatility','sharpe']].to_dict('records')[:200]
        }

    portfolio_outputs = {}
    for port_name in ['SP500_Tech','NIFTY_Blue','Global_Mix']:
        try:
            ret_file = f'data/processed/portfolio/{port_name}_returns.csv'
            if os.path.exists(ret_file):
                rets = pd.read_csv(ret_file, index_col=0, parse_dates=True)
                rets = rets.dropna()
                if len(rets) > 50 and len(rets.columns) >= 2:
                    result = optimize_portfolio(rets)
                    portfolio_outputs[port_name] = result
                    print(f"  Portfolio {port_name}: Sharpe={result['optimal_sharpe']}")
        except Exception as e:
            print(f"  Portfolio {port_name} failed: {e}")

    with open('data/processed/portfolio/portfolio_results.json','w') as f:
        json.dump(portfolio_outputs, f)
    print("Portfolio optimization complete\n")
except Exception as e:
    print(f"Portfolio optimization failed: {e}\n")


# ==============================================================================
# MODEL 4 — Financial RAG Preprocessing (Zero-API using sentence-transformers)
# ==============================================================================
print("--- MODEL 4: Financial RAG Preprocessing ---")
try:
    os.makedirs('data/processed/rag/chunks', exist_ok=True)

    # Load all SEC filing text files
    filing_files = glob.glob('data/raw/rag/sec_filings/*.txt')
    print(f"  Found {len(filing_files)} SEC filings to process")

    def chunk_text(text, chunk_size=500, overlap=50):
        """Split text into overlapping chunks"""
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i+chunk_size])
            if len(chunk.split()) >= 50:  # Skip tiny chunks
                chunks.append(chunk)
        return chunks

    # Process filings
    all_chunks = []
    all_metadata = []

    for fpath in filing_files:
        fname = os.path.basename(fpath)
        parts = fname.replace('.txt','').split('_')
        company = parts[0] if parts else 'Unknown'
        form = parts[1] if len(parts)>1 else 'Unknown'

        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()

        # Extract key sections
        sections = {
            'risk_factors': re.findall(r'(?i)risk factor.{0,50000}', text[:200000]),
            'business': re.findall(r'(?i)(?:our business|business overview).{0,30000}', text[:100000]),
            'management_discussion': re.findall(r"(?i)management.{0,3}discussion.{0,50000}", text[:200000]),
        }

        for section_name, matches in sections.items():
            if matches:
                section_text = matches[0][:5000]  # First 5000 chars per section
                chunks = chunk_text(section_text, chunk_size=200, overlap=30)
                for chunk in chunks:
                    all_chunks.append(chunk)
                    all_metadata.append({
                        'company': company,
                        'form': form,
                        'section': section_name,
                        'file': fname
                    })

    print(f"  Total chunks: {len(all_chunks)}")

    if all_chunks:
        # Embed using local sentence-transformers (zero API)
        print("  Loading sentence-transformers model (first run downloads ~90MB)...")
        embedder = SentenceTransformer('all-MiniLM-L6-v2')  # Fast, 90MB, runs locally

        print("  Embedding chunks...")
        embeddings = embedder.encode(all_chunks, batch_size=32, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')

        # Build FAISS index
        d = embeddings.shape[1]
        index = faiss.IndexFlatIP(d)  # Inner product (cosine after normalize)
        faiss.normalize_L2(embeddings)
        index.add(embeddings)

        # Save
        faiss.write_index(index, 'data/processed/rag/faiss_index.bin')
        pickle.dump(all_chunks, open('data/processed/rag/chunks.pkl','wb'))
        pickle.dump(all_metadata, open('data/processed/rag/metadata.pkl','wb'))
        pickle.dump(embedder, open('data/processed/rag/embedder.pkl','wb'))

        pd.DataFrame(all_metadata).to_csv('data/processed/rag/chunks_metadata.csv', index=False)
        print(f"  FAISS index built: {index.ntotal} vectors, dimension {d}")
        
        def answer_financial_question(question, top_k=5):
            """Answer financial questions using local FAISS + sentence-transformers (ZERO API)"""
            embedder_loaded = pickle.load(open('data/processed/rag/embedder.pkl','rb'))
            index_loaded = faiss.read_index('data/processed/rag/faiss_index.bin')
            chunks_loaded = pickle.load(open('data/processed/rag/chunks.pkl','rb'))
            meta_loaded = pickle.load(open('data/processed/rag/metadata.pkl','rb'))

            q_embed = embedder_loaded.encode([question]).astype('float32')
            faiss.normalize_L2(q_embed)
            scores, indices = index_loaded.search(q_embed, top_k)

            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0:
                    results.append({
                        'text': chunks_loaded[idx],
                        'company': meta_loaded[idx]['company'],
                        'section': meta_loaded[idx]['section'],
                        'score': float(score)
                    })
            return results

        # Test query
        test_results = answer_financial_question("What are the main risk factors?")
        print(f"  Test RAG query returned {len(test_results)} results")
        for r in test_results[:2]:
            print(f"    {r['company']} / {r['section']}: {r['text'][:100]}...")

    print("RAG preprocessing complete — zero API key needed\n")
except Exception as e:
    print(f"RAG preprocessing failed: {e}\n")

print("All 4 ML models complete!")
