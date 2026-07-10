# pip install pandas numpy yfinance pandas-datareader requests beautifulsoup4 scikit-learn

import os
import re
import random
import numpy as np
import pandas as pd
import yfinance as yf
import pandas_datareader as pdr
from datetime import datetime, timedelta
import requests

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

print("""
CREDIT RISK DATA SETUP:
1. Go to: https://www.kaggle.com/datasets/wordsforthewise/lending-club
2. Download: accepted_2007_to_2018Q4.csv (2.5M loans)
3. Place in: data/raw/credit_risk/lending_club.csv

Alternative if LendingClub unavailable:
https://www.kaggle.com/datasets/c/GiveMeSomeCredit
Place in: data/raw/credit_risk/cs-training.csv
""")

# Create directories
os.makedirs('data/raw/credit_risk', exist_ok=True)
os.makedirs('data/processed/credit_risk', exist_ok=True)
os.makedirs('data/raw/timeseries', exist_ok=True)
os.makedirs('data/processed/timeseries', exist_ok=True)
os.makedirs('data/raw/portfolio', exist_ok=True)
os.makedirs('data/processed/portfolio', exist_ok=True)
os.makedirs('data/raw/rag/sec_filings', exist_ok=True)
os.makedirs('data/processed/rag', exist_ok=True)


# ==============================================================================
# MODULE 1 — Credit Risk: LendingClub Loan Data
# ==============================================================================
print("\n--- Starting Module 1: Credit Risk Data Pipeline ---")

lc_path = 'data/raw/credit_risk/lending_club.csv'
cs_path = 'data/raw/credit_risk/cs-training.csv'

# Generate synthetic credit data if no files exist
if not os.path.exists(lc_path) and not os.path.exists(cs_path):
    print("No credit data found. Generating synthetic LendingClub data for testing...")
    n_samples = 5000
    
    loan_amnt = np.random.randint(5000, 40000, n_samples)
    funded_amnt = loan_amnt
    term = np.random.choice([' 36 months', ' 60 months'], n_samples, p=[0.7, 0.3])
    int_rate = np.round(np.random.uniform(5.0, 30.0, n_samples), 2)
    int_rate_str = [f"{r}%" for r in int_rate]
    installment = np.round(loan_amnt * (int_rate / 1200) / (1 - (1 + int_rate/1200)**(-36)), 2)
    
    grades = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    grade = np.random.choice(grades, n_samples, p=[0.15, 0.3, 0.25, 0.15, 0.08, 0.05, 0.02])
    sub_grade = [g + str(np.random.randint(1, 6)) for g in grade]
    
    emp_lengths = ['10+ years', '9 years', '8 years', '7 years', '6 years', '5 years', '4 years', '3 years', '2 years', '1 year', '< 1 year', np.nan]
    emp_length = np.random.choice(emp_lengths, n_samples)
    
    home_ownership = np.random.choice(['MORTGAGE', 'RENT', 'OWN', 'ANY'], n_samples, p=[0.5, 0.4, 0.09, 0.01])
    annual_inc = np.random.lognormal(11.0, 0.5, n_samples)
    verification_status = np.random.choice(['Source Verified', 'Verified', 'Not Verified'], n_samples)
    
    fico_low = np.random.randint(600, 800, n_samples)
    fico_high = fico_low + 4
    
    z = (int_rate - 12) / 5 - (fico_low - 700) / 50 + (annual_inc < 50000).astype(int) * 0.5
    prob_default = 1 / (1 + np.exp(-z))
    is_default = np.random.binomial(1, np.clip(prob_default, 0.01, 0.99))
    
    loan_status = []
    for d in is_default:
        if d == 1:
            loan_status.append(np.random.choice(['Charged Off', 'Default', 'Does not meet the credit policy. Status:Charged Off']))
        else:
            loan_status.append('Fully Paid')
            
    purpose = np.random.choice(['debt_consolidation', 'credit_card', 'home_improvement', 'other', 'major_purchase'], n_samples)
    dti = np.random.uniform(5.0, 40.0, n_samples)
    delinq_2yrs = np.random.choice([0, 1, 2, 3], n_samples, p=[0.85, 0.1, 0.04, 0.01])
    open_acc = np.random.randint(4, 25, n_samples)
    pub_rec = np.random.choice([0, 1, 2], n_samples, p=[0.9, 0.08, 0.02])
    revol_bal = np.random.randint(1000, 50000, n_samples)
    revol_util = [f"{np.round(np.random.uniform(5.0, 95.0), 1)}%" for _ in range(n_samples)]
    total_acc = open_acc + np.random.randint(2, 20, n_samples)
    initial_list_status = np.random.choice(['w', 'f'], n_samples)
    application_type = np.random.choice(['Individual', 'Joint App'], n_samples, p=[0.95, 0.05])
    mort_acc = np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.3, 0.3, 0.2, 0.1, 0.1])
    pub_rec_bankruptcies = np.random.choice([0.0, 1.0], n_samples, p=[0.92, 0.08])
    
    df = pd.DataFrame({
        'loan_amnt': loan_amnt,
        'funded_amnt': funded_amnt,
        'term': term,
        'int_rate': int_rate_str,
        'installment': installment,
        'grade': grade,
        'sub_grade': sub_grade,
        'emp_length': emp_length,
        'home_ownership': home_ownership,
        'annual_inc': annual_inc,
        'verification_status': verification_status,
        'loan_status': loan_status,
        'purpose': purpose,
        'dti': dti,
        'delinq_2yrs': delinq_2yrs,
        'fico_range_low': fico_low,
        'fico_range_high': fico_high,
        'open_acc': open_acc,
        'pub_rec': pub_rec,
        'revol_bal': revol_bal,
        'revol_util': revol_util,
        'total_acc': total_acc,
        'initial_list_status': initial_list_status,
        'application_type': application_type,
        'mort_acc': mort_acc,
        'pub_rec_bankruptcies': pub_rec_bankruptcies
    })
    df.to_csv(lc_path, index=False)
    print(f"Created synthetic LendingClub file with {n_samples} samples.")

# Process whichever credit dataset is available
if os.path.exists(lc_path):
    lc = pd.read_csv(lc_path, low_memory=False, nrows=200000)
    print(f"LendingClub loaded: {lc.shape}")

    # Select key columns
    key_cols = ['loan_amnt','funded_amnt','term','int_rate','installment','grade','sub_grade',
                'emp_length','home_ownership','annual_inc','verification_status','loan_status',
                'purpose','dti','delinq_2yrs','fico_range_low','fico_range_high','open_acc',
                'pub_rec','revol_bal','revol_util','total_acc','initial_list_status',
                'application_type','mort_acc','pub_rec_bankruptcies']
    lc = lc[[c for c in key_cols if c in lc.columns]].copy()

    # Target variable: is_default
    if 'loan_status' in lc.columns:
        default_labels = ['Charged Off','Default','Does not meet the credit policy. Status:Charged Off']
        lc['is_default'] = lc['loan_status'].isin(default_labels).astype(int)
        print(f"Default rate: {lc['is_default'].mean():.2%}")

    # Clean int_rate (remove %)
    if 'int_rate' in lc.columns:
        lc['int_rate'] = lc['int_rate'].astype(str).str.replace('%','').astype(float)
    if 'revol_util' in lc.columns:
        lc['revol_util'] = lc['revol_util'].astype(str).str.replace('%','').astype(float)

    # Encode grade
    grade_map = {'A':1,'B':2,'C':3,'D':4,'E':5,'F':6,'G':7}
    if 'grade' in lc.columns:
        lc['grade_encoded'] = lc['grade'].map(grade_map)

    # Encode emp_length
    def clean_emp(x):
        if pd.isna(x): return 0
        x = str(x).replace('+ years','').replace(' years','').replace(' year','').strip()
        if x == '< 1': return 0
        try: return int(x)
        except: return 0
    if 'emp_length' in lc.columns:
        lc['emp_length_num'] = lc['emp_length'].apply(clean_emp)

    # FICO midpoint
    if 'fico_range_low' in lc.columns and 'fico_range_high' in lc.columns:
        lc['fico_score'] = (lc['fico_range_low'] + lc['fico_range_high']) / 2

    # DTI null fill
    if 'dti' in lc.columns:
        lc['dti'] = lc['dti'].fillna(lc['dti'].median())

    # One-hot: purpose, home_ownership, verification_status, term
    cat_cols = ['purpose','home_ownership','verification_status','term']
    for col in cat_cols:
        if col in lc.columns:
            dummies = pd.get_dummies(lc[col], prefix=col, drop_first=True)
            lc = pd.concat([lc, dummies], axis=1)

    lc.to_csv('data/processed/credit_risk/credit_features.csv', index=False)
    print(f"Credit features saved: {lc.shape}")

    # Validation
    print(f"Null counts:\n{lc.isnull().sum()[lc.isnull().sum()>0]}")
    print(f"Class balance: {lc['is_default'].value_counts()}")

elif os.path.exists(cs_path):
    alt = pd.read_csv(cs_path)
    alt.columns = [c.strip() for c in alt.columns]
    alt.to_csv('data/processed/credit_risk/credit_features.csv', index=False)
    print(f"Alternative credit data saved: {alt.shape}")


# ==============================================================================
# MODULE 2 — Time Series: Yahoo Finance + FRED
# ==============================================================================
print("\n--- Starting Module 2: Time Series Data Pipeline ---")

START = '2015-01-01'
END = datetime.today().strftime('%Y-%m-%d')

tickers = {
    'US_Tech': ['AAPL','MSFT','NVDA','GOOGL','META','AMZN'],
    'US_Finance': ['JPM','GS','BAC','MS','WFC'],
    'India': ['RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ICICIBANK.NS','SBIN.NS'],
    'Index': ['^GSPC','^NSEI','^IXIC','^DJI']
}

all_prices = {}
for group, tkrs in tickers.items():
    for t in tkrs:
        try:
            print(f"Downloading stock ticker: {t} ...")
            data = yf.download(t, start=START, end=END, progress=False)
            if len(data) > 100:
                data.to_csv(f'data/raw/timeseries/{t.replace("^","").replace(".","_")}.csv')
                # If column is MultiIndex (yfinance v0.2.x sometimes returns MultiIndex), select 'Adj Close'
                if isinstance(data.columns, pd.MultiIndex):
                    all_prices[t] = data['Adj Close'][t]
                else:
                    all_prices[t] = data['Adj Close']
                print(f"  Downloaded: {t} ({len(data)} days)")
            else:
                print(f"  Insufficient data for {t}. Generating synthetic...")
                raise ValueError("Insufficient data")
        except Exception as e:
            print(f"  Failed to download {t}: {e}. Generating synthetic stock prices...")
            # Generate synthetic prices
            dates = pd.date_range(start=START, end=END, freq='B')
            n = len(dates)
            s0 = 100.0 if "NS" not in t else 1500.0
            mu = 0.10
            sigma = 0.22
            dt = 1/252
            returns = np.random.normal((mu - 0.5 * sigma**2) * dt, sigma * np.sqrt(dt), n)
            prices = s0 * np.exp(np.cumsum(returns))
            
            df_synth = pd.DataFrame(index=dates)
            df_synth['Open'] = prices * np.random.uniform(0.99, 1.01, n)
            df_synth['High'] = np.maximum(df_synth['Open'], prices) * np.random.uniform(1.0, 1.02, n)
            df_synth['Low'] = np.minimum(df_synth['Open'], prices) * np.random.uniform(0.98, 1.0, n)
            df_synth['Close'] = prices
            df_synth['Adj Close'] = prices
            df_synth['Volume'] = np.random.randint(100000, 5000000, n)
            df_synth.index.name = 'Date'
            
            df_synth.to_csv(f'data/raw/timeseries/{t.replace("^","").replace(".","_")}.csv')
            all_prices[t] = df_synth['Adj Close']
            print(f"  Saved synthetic {t} ({len(df_synth)} days)")

# Combine into single prices dataframe
prices_df = pd.DataFrame(all_prices).dropna(how='all')
# Fill missing business day values
prices_df = prices_df.ffill().bfill()
prices_df.to_csv('data/processed/timeseries/stock_prices.csv')
print(f"Stock prices saved: {prices_df.shape}")

# Download macroeconomic data from FRED
fred_series = {
    'DFF': 'fed_funds_rate',         # Federal Funds Rate
    'CPIAUCSL': 'cpi_inflation',      # CPI
    'GDP': 'gdp',                     # GDP
    'UNRATE': 'unemployment_rate',    # Unemployment
    'DGS10': 'treasury_10yr',         # 10-Year Treasury Yield
    'DCOILWTICO': 'oil_price',        # WTI Oil Price
    'M2SL': 'money_supply_m2',        # M2 Money Supply
    'VIXCLS': 'vix',                  # VIX Fear Index
}

fred_data = {}
for series_id, name in fred_series.items():
    try:
        print(f"Downloading FRED series: {series_id} ({name}) ...")
        data = pdr.DataReader(series_id, 'fred', START, END)
        data.columns = [name]
        fred_data[name] = data[name]
        data.to_csv(f'data/raw/timeseries/fred_{name}.csv')
        print(f"  Downloaded FRED: {name}")
    except Exception as e:
        print(f"  FRED {series_id} failed: {e}. Generating synthetic FRED data...")
        dates = pd.date_range(start=START, end=END, freq='D')
        n = len(dates)
        if name == 'fed_funds_rate':
            vals = np.clip(1.5 + np.cumsum(np.random.normal(0, 0.05, n)) + 2 * np.sin(np.arange(n)/500), 0.05, 8.0)
        elif name == 'cpi_inflation':
            vals = 240.0 + np.arange(n) * 0.04 + np.cumsum(np.random.normal(0, 0.08, n))
        elif name == 'gdp':
            vals = 18000.0 + np.arange(n) * 1.5 + np.cumsum(np.random.normal(0, 1.5, n))
        elif name == 'unemployment_rate':
            vals = np.clip(5.0 - 1.2 * np.sin(np.arange(n)/600) + np.cumsum(np.random.normal(0, 0.02, n)), 3.0, 10.0)
        elif name == 'treasury_10yr':
            vals = np.clip(2.5 + np.cumsum(np.random.normal(0, 0.05, n)) + 1.5 * np.sin(np.arange(n)/500), 0.1, 7.0)
        elif name == 'oil_price':
            vals = np.clip(60.0 + np.cumsum(np.random.normal(0, 0.4, n)) + 12 * np.sin(np.arange(n)/300), 20.0, 120.0)
        elif name == 'money_supply_m2':
            vals = 12000.0 + np.arange(n) * 1.1 + np.cumsum(np.random.normal(0, 1.0, n))
        else: # vix
            vals = np.clip(15.0 + np.random.lognormal(0.4, 0.25, n) + 4 * np.sin(np.arange(n)/100), 9.0, 80.0)
            
        data_synth = pd.DataFrame({name: vals}, index=dates)
        data_synth.index.name = 'DATE'
        data_synth.to_csv(f'data/raw/timeseries/fred_{name}.csv')
        fred_data[name] = data_synth[name]
        print(f"  Saved synthetic FRED data: {name}")

if fred_data:
    macro_df = pd.DataFrame(fred_data).resample('D').ffill()
    macro_df.to_csv('data/processed/timeseries/macro_indicators.csv')
    print(f"Macro indicators saved: {macro_df.shape}")

# Build combined feature set for forecasting
combined = prices_df.join(macro_df, how='left').ffill().bfill()

# Feature engineering for time series
for col in prices_df.columns:
    if col in combined.columns:
        combined[f'{col}_ret_1d'] = combined[col].pct_change(1)
        combined[f'{col}_ret_5d'] = combined[col].pct_change(5)
        combined[f'{col}_ret_20d'] = combined[col].pct_change(20)
        combined[f'{col}_ma_20'] = combined[col].rolling(20).mean()
        combined[f'{col}_ma_50'] = combined[col].rolling(50).mean()
        combined[f'{col}_vol_20'] = combined[col].pct_change().rolling(20).std()

# Drop rows with NaN due to rolling windows
combined = combined.dropna().copy()
combined.to_csv('data/processed/timeseries/timeseries_features.csv')
print(f"Time series features saved: {combined.shape}")


# ==============================================================================
# MODULE 3 — Portfolio Optimization
# ==============================================================================
print("\n--- Starting Module 3: Portfolio Optimization ---")

portfolios = {
    'SP500_Tech': ['AAPL','MSFT','NVDA','GOOGL','META','AMZN','TSLA','NFLX'],
    'NIFTY_Blue': ['RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ICICIBANK.NS',
                   'HINDUNILVR.NS','ITC.NS','KOTAKBANK.NS'],
    'Global_Mix': ['AAPL','JPM','RELIANCE.NS','HDFCBANK.NS','TCS.NS','NVDA','GS']
}

risk_free_rate = 0.0525  # 5.25%

for port_name, tkrs in portfolios.items():
    port_prices = {}
    for t in tkrs:
        try:
            print(f"Loading {t} for portfolio {port_name}...")
            # We can load from the raw data downloaded in module 2 if available, or download/generate
            raw_path = f'data/raw/timeseries/{t.replace("^","").replace(".","_")}.csv'
            if os.path.exists(raw_path):
                df = pd.read_csv(raw_path, index_col=0, parse_dates=True)
                # handle if Adj Close is multi-level
                if 'Adj Close' in df.columns:
                    port_prices[t] = df['Adj Close']
                elif 'Close' in df.columns:
                    port_prices[t] = df['Close']
            else:
                d = yf.download(t, start='2018-01-01', end=END, progress=False)
                if len(d) > 100:
                    if isinstance(d.columns, pd.MultiIndex):
                        port_prices[t] = d['Adj Close'][t]
                    else:
                        port_prices[t] = d['Adj Close']
                else:
                    raise ValueError("Insufficient data")
        except Exception as e:
            print(f"  Error loading {t}: {e}. Generating synthetic price series...")
            dates = pd.date_range(start='2018-01-01', end=END, freq='B')
            n = len(dates)
            s0 = 100.0 if "NS" not in t else 1500.0
            mu = 0.12
            sigma = 0.25
            dt = 1/252
            returns = np.random.normal((mu - 0.5 * sigma**2) * dt, sigma * np.sqrt(dt), n)
            prices = s0 * np.exp(np.cumsum(returns))
            port_prices[t] = pd.Series(prices, index=dates)

    if port_prices:
        port_df = pd.DataFrame(port_prices).dropna()
        port_df.to_csv(f'data/raw/portfolio/{port_name}_prices.csv')

        # Returns and covariance
        returns = port_df.pct_change().dropna()
        returns.to_csv(f'data/processed/portfolio/{port_name}_returns.csv')

        # Portfolio stats
        mu = returns.mean() * 252  # Annualized
        sigma = returns.std() * np.sqrt(252)
        corr = returns.corr()
        cov = returns.cov() * 252

        stats = pd.DataFrame({'annual_return': mu, 'annual_volatility': sigma,
                              'sharpe_ratio': (mu - risk_free_rate) / sigma})
        stats.to_csv(f'data/processed/portfolio/{port_name}_stats.csv')
        corr.to_csv(f'data/processed/portfolio/{port_name}_correlation.csv')
        cov.to_csv(f'data/processed/portfolio/{port_name}_covariance.csv')
        print(f"  Portfolio {port_name}: {len(port_prices)} assets, {len(port_df)} days saved.")

print("Portfolio data saved")


# ==============================================================================
# MODULE 4 — Financial RAG: SEC EDGAR 10-K/10-Q
# ==============================================================================
print("\n--- Starting Module 4: Financial RAG ---")

SEC_BASE = 'https://data.sec.gov'
HEADERS = {'User-Agent': 'FintelliQ research@fintelliq.com'}

companies = {
    'Apple':     '0000320193',
    'Microsoft': '0000789019',
    'NVIDIA':    '0001045810',
    'JPMorgan':  '0000019617',
    'Goldman':   '0000886982',
}

all_filings_meta = []
sec_success = False

# Try actual SEC scraping
try:
    for company, cik in companies.items():
        print(f"Scraping SEC EDGAR metadata for {company} (CIK: {cik})...")
        sub_url = f"{SEC_BASE}/submissions/CIK{cik.zfill(10)}.json"
        sub_r = requests.get(sub_url, headers=HEADERS, timeout=10)
        if sub_r.status_code == 200:
            sub_data = sub_r.json()
            filings = sub_data.get('filings', {}).get('recent', {})
            forms = filings.get('form', [])
            dates = filings.get('filingDate', [])
            accessions = filings.get('accessionNumber', [])
            
            count = 0
            for i, form in enumerate(forms):
                if form in ['10-K','10-Q'] and count < 5:
                    all_filings_meta.append({
                        'company': company, 'cik': cik, 'form': form,
                        'date': dates[i], 'accession': accessions[i]
                    })
                    count += 1
            print(f"  Got SEC metadata: {company} (found {count} filings)")
            sec_success = True
        else:
            print(f"  Failed SEC request for {company}: Status {sub_r.status_code}")
except Exception as e:
    print(f"SEC metadata download failed: {e}")

# If SEC scraping failed or yielded no results, run the mock generator
if not sec_success or len(all_filings_meta) == 0:
    print("Generating mock SEC EDGAR filing data for testing...")
    mock_texts = {
        'Apple': """
        Apple Inc. Form 10-K for the Fiscal Year Ended September 30, 2024.
        PART I. ITEM 1. BUSINESS.
        Apple designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services.
        The Company's business strategy leverages its unique ability to design and develop its own operating systems, hardware, application software and services to provide its customers products and solutions with innovative design, superior ease-of-use and seamless integration.
        ITEM 1A. RISK FACTORS.
        The Company's business, results of operations and financial condition can be adversely affected by several factors.
        Competition: The markets for the Company’s products and services are highly competitive and subject to rapid technological change. The Company faces significant competition from other providers of mobile communication devices, personal computers, and digital content and services.
        Supply Chain: The Company relies on single-source suppliers for certain components and outsourcing partners, many of whom are located outside the U.S. Disruption in supply chain due to geopolitical tensions, natural disasters, or public health issues could impact production.
        Intellectual Property: Third parties may claim that the Company's products infringe their intellectual property rights, leading to costly litigation or loss of license.
        ITEM 7. MD&A.
        Net sales were $383,285 million in 2023, compared to $394,328 million in 2022. The decrease in net sales was primarily due to lower sales of iPhones and Macs.
        Gross margin was 44.1% in 2023, compared to 43.3% in 2022, driven by favorable product mix and cost savings.
        """,
        'Microsoft': """
        Microsoft Corporation Form 10-K for the Fiscal Year Ended June 30, 2024.
        PART I. ITEM 1. BUSINESS.
        Microsoft is a technology company whose mission is to empower every person and every organization on the planet to achieve more.
        We develop and support software, services, devices, and solutions that deliver new value for customers and help the business realize their full potential.
        Our platforms include cloud-based services like Azure, productivity tools like Office 365, and personal computing products like Windows and Xbox.
        ITEM 1A. RISK FACTORS.
        Our business is subject to significant risks.
        Cloud Services: We make significant investments in cloud infrastructure and security. Any security breach or service outage in Azure could damage our reputation and lead to loss of customers.
        Artificial Intelligence: We are integrating generative AI technologies into our products. AI models may produce inaccurate, biased, or harmful outputs, leading to legal liability and reputational harm.
        Competition: We compete in highly dynamic markets, facing competition from established tech giants and niche cloud and software providers.
        ITEM 7. MD&A.
        Revenue was $211.9 billion in fiscal year 2023, an increase of 7% compared to fiscal year 2022. Net income was $72.4 billion, down slightly from $72.7 billion in the prior year.
        The growth was driven by Microsoft Cloud, which grew 22% to $111.6 billion.
        """,
        'NVIDIA': """
        NVIDIA Corporation Form 10-K for the Fiscal Year Ended January 28, 2024.
        PART I. ITEM 1. BUSINESS.
        NVIDIA pioneered accelerated computing to help solve computational problems that ordinary computers cannot.
        We specialize in graphics processing units (GPUs) that are critical for gaming, professional visualization, datacenter computing, and artificial intelligence.
        Our Compute & Networking segment includes Data Center platforms, networking systems, automotive electronics, and robotics.
        ITEM 1A. RISK FACTORS.
        Our business is characterized by rapid technological cycles.
        AI Demand and Supply: We are experiencing explosive demand for our Hopper and Blackwell GPU architectures for AI workloads. Our ability to meet this demand depends on chip manufacturing capacity at TSMC. Any manufacturing bottleneck or disruption could impact our sales.
        Export Controls: The US government has imposed restrictions on export of high-performance chips to certain countries, including China. These restrictions could harm our financial results.
        Competition: We face competition from other chipmakers, cloud service providers developing their own silicon, and startup companies.
        ITEM 7. MD&A.
        Revenue for fiscal year 2024 was $60.9 billion, up 126% from $27.0 billion in fiscal year 2023.
        Data Center revenue was $47.5 billion, up 217% from the prior year, driven by broad-based demand for LLM and generative AI.
        Gross margin increased to 72.7% from 56.9% in the prior year.
        """,
        'JPMorgan': """
        JPMorgan Chase & Co. Form 10-K for the Year Ended December 31, 2023.
        PART I. ITEM 1. BUSINESS.
        JPMorgan Chase is a leading global financial services firm and one of the largest banking institutions in the United States.
        We operate in four segments: Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management.
        ITEM 1A. RISK FACTORS.
        Our business is sensitive to macroeconomic and geopolitical factors.
        Interest Rates: Changes in monetary policy and interest rates by the Federal Reserve affect our net interest income (NII) and net interest margin. Rapidly rising or falling rates can create asset-liability mismatches.
        Credit Risk: Economic downturns can increase defaults on consumer and commercial loans, leading to higher provisions for credit losses.
        Cybersecurity: We are a frequent target of cyberattacks. Any system breach could compromise customer data and disrupt banking operations.
        ITEM 7. MD&A.
        Net income for 2023 was $49.6 billion, compared with $37.7 billion in 2022. Net interest income was $89.3 billion, up 34% driven by higher rates.
        Noninterest expense was $82.0 billion, up 8% due to higher compensation and First Republic integration costs.
        """,
        'Goldman': """
        The Goldman Sachs Group, Inc. Form 10-K for the Year Ended December 31, 2023.
        PART I. ITEM 1. BUSINESS.
        Goldman Sachs is a leading global investment banking, securities and investment management firm.
        We provide a wide range of financial services to a substantial and diversified client base that includes corporations, financial institutions, governments and individuals.
        Our segments include Investment Banking, Global Markets, and Asset & Wealth Management.
        ITEM 1A. RISK FACTORS.
        Our performance depends heavily on the health of global financial markets.
        Market Volatility: Declines in market volume, asset prices, or liquidity can reduce our trading revenues and investment banking fees.
        Regulatory Compliance: We are subject to extensive regulation and supervision. Failure to comply can result in substantial fines and restrictions.
        Underwriting Risks: We face risk of losses when underwriting debt or equity offerings if we are unable to resell the securities to investors.
        ITEM 7. MD&A.
        Net revenues were $46.25 billion for 2023, down 2% compared to $47.37 billion for 2022.
        Net income was $8.52 billion, down 24% compared to $11.26 billion for 2022. The decrease reflected lower revenues in Investment Banking and Asset Management.
        """
    }
    
    for comp in companies:
        text = mock_texts[comp]
        text = re.sub(r'\s+', ' ', text).strip()
        date = '2024-02-15' if comp == 'NVIDIA' else '2024-03-01'
        if comp == 'Apple':
            date = '2024-10-31'
        elif comp == 'Microsoft':
            date = '2024-07-28'
            
        accession = f"0000000000-24-{np.random.randint(1000, 9999)}"
        all_filings_meta.append({
            'company': comp,
            'cik': companies[comp],
            'form': '10-K',
            'date': date,
            'accession': accession
        })
        
        fname = f"data/raw/rag/sec_filings/{comp}_10-K_{date}.txt"
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"  Saved mock filing: {fname}")
        
    filings_df = pd.DataFrame(all_filings_meta)
    filings_df.to_csv('data/raw/rag/sec_filings/filings_metadata.csv', index=False)
    print("Mock SEC metadata saved.")
else:
    # Real SEC scraping completed, now download actual filing text (first 1 per company)
    filings_df = pd.DataFrame(all_filings_meta)
    filings_df.to_csv('data/raw/rag/sec_filings/filings_metadata.csv', index=False)
    print(f"SEC filings metadata saved: {len(filings_df)} filings")

    for _, row in filings_df[filings_df['form']=='10-K'].groupby('company').head(1).iterrows():
        try:
            acc_clean = row['accession'].replace('-','')
            print(f"Downloading text for {row['company']} 10-K filing...")
            idx_url = f"{SEC_BASE}/Archives/edgar/data/{int(row['cik'])}/{acc_clean}/{row['accession']}-index.json"
            idx_r = requests.get(idx_url, headers=HEADERS, timeout=10)
            if idx_r.status_code == 200:
                idx_data = idx_r.json()
                for doc in idx_data.get('documents', [])[:10]:
                    if '10-K' in doc.get('type','') or 'htm' in doc.get('name','').lower():
                        doc_url = f"{SEC_BASE}/Archives/edgar/data/{int(row['cik'])}/{acc_clean}/{doc['name']}"
                        doc_r = requests.get(doc_url, headers=HEADERS, timeout=15)
                        if doc_r.status_code == 200:
                            fname = f"data/raw/rag/sec_filings/{row['company']}_{row['form']}_{row['date']}.txt"
                            text = re.sub('<[^>]+>', ' ', doc_r.text)
                            text = re.sub(r'\s+', ' ', text)[:500000]  # Limit size
                            with open(fname, 'w', encoding='utf-8', errors='ignore') as f:
                                f.write(text)
                            print(f"  Saved: {fname} ({len(text)} chars)")
                            break
        except Exception as e:
            print(f"  Filing download error for {row['company']}: {e}. Skipping to next...")

print("All data pipeline complete!")
print("\nFiles saved:")
for root, dirs, files in os.walk('data'):
    for file in files:
        path = os.path.join(root, file)
        size = os.path.getsize(path)/1024
        print(f"  {path} ({size:.1f} KB)")
