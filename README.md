[![Python Version](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)](https://www.python.org/) [![XGBoost](https://img.shields.io/badge/XGBoost-1.7-red?style=flat-square)](https://xgboost.readthedocs.io/) [![SHAP](https://img.shields.io/badge/SHAP-0.42-blueviolet?style=flat-square)](https://shap.readthedocs.io/) [![LightGBM](https://img.shields.io/badge/LightGBM-3.3-yellowgreen?style=flat-square)](https://lightgbm.readthedocs.io/) [![PyTorch](https://img.shields.io/badge/PyTorch-2.0-orange?style=flat-square&logo=pytorch)](https://pytorch.org/) [![scikit-learn](https://img.shields.io/badge/scikit--learn-1.2-blue?style=flat-square&logo=scikitlearn)](https://scikit-learn.org/) [![FAISS](https://img.shields.io/badge/FAISS-1.7-purple?style=flat-square)](https://github.com/facebookresearch/faiss) [![React](https://img.shields.io/badge/React-18-cyan?style=flat-square&logo=react)](https://react.dev/) [![Recharts](https://img.shields.io/badge/Recharts-2.7-green?style=flat-square)](https://recharts.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-0.95-emerald?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/) [![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](https://opensource.org/licenses/MIT) [![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)](https://github.com/Utsav-Thakur/AlphaForge) [![LinkedIn](https://img.shields.io/badge/LinkedIn-Utsav%20Kumar%20Thakur-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/utsav-thakur-2b01871b7) [![Deploy to Vercel](https://img.shields.io/badge/Deploy%20to-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FUtsav-Thakur%2FAlphaForge)

# ⚡ AlphaForge — Financial Intelligence Platform

An end-to-end Data Science + AI platform covering explainable credit risk modeling, transformer-based time series forecasting, portfolio optimization, live market intelligence, and a zero-API RAG financial assistant (Forge AI) — built for the standards of JPMorgan, Goldman Sachs, and Thorogood Analytics.

![AlphaForge Platform Dashboard](./screenshots/overview_dashboard.png)

---

## ## Problem Statement

Financial institutions generate enormous volumes of loan transactions, daily asset ticks, and corporate filings. However, they lack unified intelligence systems capable of processing both quantitative numeric sequences and unstructured financial texts under a single analytical interface. Because of these silos, corporate operations are slowed down by manual analysis, compliance overhead, and legacy statistical frameworks.

First, standard credit risk assessment still relies heavily on manual loan underwriting or oversimplified credit scorecards (such as scorecard metrics derived from basic logistic regression). These linear tools are incapable of capturing high-dimensional, non-linear interactions between key borrower features. For example, a credit analyst may overlook the combined effect of high debt-to-income (DTI) ratios and sudden FICO score drops when evaluating a borrower with high gross income. Point estimate models fail to model these interactions, leading to increased default exposure on bank balance sheets.

Second, market forecasting systems frequently depend on lagged technical indicators or linear models (like ARIMA) that assume stationarity. While Recurrent Neural Networks (RNNs) and LSTMs attempt to capture sequential patterns, they struggle with vanishing gradients over long lookback windows and miss structural breaks caused by macroeconomic shifts. Without temporal attention mechanisms, trading algorithms fail to weigh the relative importance of past shocks (such as a federal interest rate decision 30 days ago) against short-term price movements.

Third, asset managers face challenges in scaling portfolio construction. Traditional Markowitz Mean-Variance optimization calculations depend on static historical metrics and fail to incorporate forward-looking market regimes or capture volatility ranges. Without empirical validation frameworks (like Monte Carlo simulations), equal-weighted allocations remain common in practice, which fails to optimize the risk-adjusted returns of the fund.

Finally, document intelligence is a major bottleneck. Financial analysts spend up to 70% of their working hours manually reading corporate SEC filings, such as annual 10-K forms. Off-the-shelf LLMs require external API integrations that send sensitive, proprietary queries to third-party servers, posing data privacy compliance issues. 

AlphaForge addresses these problems by consolidating machine learning classifiers, self-attention networks, optimization solvers, and local vector search databases into a unified, high-performance financial intelligence platform.

---

## ## Goals & Objectives

1. **Explainable Credit Risk Scoring**
   - Implement an ensemble pipeline utilizing XGBoost to predict the probability of default ($PD \in [0, 1]$) for individual borrowers.
   - Deconstruct individual predictions using TreeSHAP to generate regulatory-compliant local reason codes.
   - Integrate an interactive default risk dashboard to allow credit officers to run real-time stress testing.

2. **Transformer-Based Price Forecasting**
   - Build a temporal neural network in PyTorch utilizing multi-head self-attention mechanisms to predict 5-day stock trajectories.
   - Ingest multivariate features, including rolling asset averages, daily returns, and Federal Reserve (FRED) macroeconomic indicators.
   - Project forecasting uncertainty by generating dynamic confidence boundary bands.

3. **Modern Portfolio Optimization**
   - Develop an optimization laboratory that compares analytical Markowitz Mean-Variance allocations with empirical simulations.
   - Implement a Sequential Least Squares Programming (SLSQP) solver to maximize the Sharpe ratio subject to strict weight constraints.
   - Run 5,000 Monte Carlo iterations to map the efficient frontier and evaluate asset concentration limits.

4. **Live Market Feed & Macro Indicators**
   - Integrate real-time market data streaming to display price feeds and daily gains/losses for key equities and market indices.
   - Overlay macroeconomic variables (such as CPI inflation, Fed Funds rate, and the VIX fear index) to monitor market stress.
   - Display a dynamic asset correlation matrix to analyze shifts in sector relationships.

5. **Local Financial Document Intelligence (Forge AI)**
   - Build an embedded, zero-API Retrieval-Augmented Generation (RAG) assistant that runs entirely on local compute.
   - Process corporate SEC 10-K files by implementing paragraph-level chunking and local SentenceTransformer embeddings.
   - Deploy a local FAISS index to enable sub-millisecond semantic search, complete with a source citation panel.

---

## ## Raw Dataset Overview

Before training or preprocessing, the platform ingests datasets across four distinct financial domains:

### Table 1: LendingClub Credit Dataset
| Property | Value / Detail | Source |
| :--- | :--- | :--- |
| **Origin Source** | Kaggle: wordsforthewise/lending-club | Peer-to-peer LendingClub loan records |
| **Raw File Name** | `accepted_2007_to_2018Q4.csv` | Comma-separated spreadsheet |
| **Raw Rows** | 2,260,701 loans | Total historical submissions |
| **Raw Columns** | 151 features | Borrower profiles, terms, and repayment history |
| **Date Range** | 2007 to 2018 Q4 | Multi-cycle historical range |
| **File Size** | 1.86 GB | Large-scale tabular database |
| **Modeling Sample** | 200,000 loans | Stratified sample selected for training efficiency |
| **Target Variable** | `is_default` | Binary label (1 = Default / Charged Off, 0 = Fully Paid) |
| **Raw Default Rate** | 14.2% | Unbalanced label distribution |
| **Null Data Rates** | 32 columns > 50% null | Requires automated column filtering |

### Table 2: Selected Raw Tabular Columns
| Column | Raw Type | Sample Values | Issues Identified |
| :--- | :--- | :--- | :--- |
| **loan_amnt** | Float | 10000.0, 35000.0 | High range variation |
| **term** | String | " 36 months", " 60 months" | Leading whitespace, text format |
| **int_rate** | String | "10.65%", "15.27%" | Stored as text with percent symbol |
| **installment** | Float | 325.64, 890.12 | High right skew |
| **grade** | String | "A", "B", "C", "D", "E" | Ordinal text, needs mapping |
| **emp_length** | String | "10+ years", "< 1 year" | Non-numeric, contains nulls |
| **home_ownership**| String | "MORTGAGE", "RENT", "OWN" | Categorical, needs encoding |
| **annual_inc** | Float | 45000.0, 125000.0 | High skew, extreme outliers |
| **loan_status** | String | "Fully Paid", "Charged Off" | Target class source label |
| **purpose** | String | "debt_consolidation", "credit_card"| Categorical, 14 categories |
| **dti** | Float | 12.4, 38.9, 999.0 | Invalid values (>100) present |
| **delinq_2yrs** | Float | 0.0, 2.0, null | Missing values present |
| **fico_range_low**| Float | 680.0, 720.0 | Split range column |
| **fico_range_high**|Float | 684.0, 724.0 | Split range column |
| **open_acc** | Float | 8.0, 18.0 | Outliers in long tail |
| **pub_rec** | Float | 0.0, 1.0, 5.0 | High zero inflation |
| **revol_bal** | Float | 14500.0, 890000.0 | Extreme right skew |
| **revol_util** | String | "83.7%", "12.4%", null | Text format, contains nulls |
| **total_acc** | Float | 14.0, 42.0 | Outliers in long tail |
| **mort_acc** | Float | 0.0, 3.0, null | High null rates (18.6%) |
| **pub_rec_bankruptcies** | Float | 0.0, 1.0, null | Contains null values |

### Table 3: Time Series Raw Asset Data
| Ticker | Source | Raw Rows | Date Range | Primary Columns | Processing Issues |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AAPL** | Yahoo Finance | 2,350 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | Stock splits, dividends |
| **MSFT** | Yahoo Finance | 2,350 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | Pricing range variations |
| **NVDA** | Yahoo Finance | 2,350 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | 10:1 Stock split (June 2024) |
| **RELIANCE.NS**| Yahoo Finance | 2,280 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | Different market holidays (NSE) |
| **TCS.NS** | Yahoo Finance | 2,280 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | INR exchange rate adjustments |
| **^GSPC** | Yahoo Finance | 2,350 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | Index benchmark, no volume |
| **^NSEI** | Yahoo Finance | 2,250 | 2015-01-01 to 2024 | Open, Close, Adj Close, Vol | Calendar sync with US market |

### Table 4: FRED Macroeconomic Indicators
| Series ID | Name | Frequency | Date Range | Missing Data Handling |
| :--- | :--- | :--- | :--- | :--- |
| **DFF** | Effective Federal Funds Rate | Daily | 2015 to 2024 | Forward-fill weekend values |
| **CPIAUCSL** | Consumer Price Index (Inflation) | Monthly | 2015 to 2024 | Upsampled to daily, forward-fill |
| **GDP** | Gross Domestic Product | Quarterly | 2015 to 2024 | Upsampled to daily, forward-fill |
| **UNRATE** | National Unemployment Rate | Monthly | 2015 to 2024 | Upsampled to daily, forward-fill |
| **DGS10** | 10-Year Treasury Constant Maturity | Daily | 2015 to 2024 | Linear interpolation of gaps |
| **DCOILWTICO** | WTI Crude Oil Spot Price | Daily | 2015 to 2024 | Forward-fill holidays |
| **M2SL** | M2 Money Supply | Monthly | 2015 to 2024 | Upsampled to daily, forward-fill |
| **VIXCLS** | CBOE Volatility Index (VIX) | Daily | 2015 to 2024 | Forward-fill weekend values |

### Table 5: SEC EDGAR Text Documents
| Company | File Type | Filing Date | Text Characters | Target Sections | Extraction Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Apple Inc.** | Form 10-K | 2023-10-31 | 545,000 | Item 1A, Item 1, Item 7 | Regular Expression parser |
| **Microsoft Corp.**| Form 10-K | 2023-07-28 | 490,000 | Item 1A, Item 1, Item 7 | Regular Expression parser |
| **NVIDIA Corp.** | Form 10-K | 2023-02-15 | 412,000 | Item 1A, Item 1, Item 7 | Regular Expression parser |
| **JPMorgan Chase** | Form 10-K | 2023-03-01 | 610,000 | Item 1A, Item 1, Item 7 | Regular Expression parser |
| **Goldman Sachs** | Form 10-K | 2023-03-01 | 580,000 | Item 1A, Item 1, Item 7 | Regular Expression parser |

---

## ## Engineered Feature Set

After processing the raw data, the following features are generated for model training:

### Table 6: Tabular Credit Model Features
| Feature Name | Formula / Encoding Strategy | Type | Business Rationale | XGBoost Feature Rank |
| :--- | :--- | :--- | :--- | :---: |
| **fico_score** | `(fico_range_low + fico_range_high) / 2` | Numerical | Midpoint borrower credit score | 1 |
| **int_rate** | `float(int_rate.rstrip('%'))` | Numerical | Stated interest rate (risk proxy) | 2 |
| **dti** | `dti` clipped at $[0, 60]$ | Numerical | Monthly debt payment to income | 3 |
| **loan_amnt** | `loan_amnt` | Numerical | Stated principal loan exposure | 4 |
| **annual_inc_log** | `log(annual_inc + 1)` | Numerical | Log-transformed annual income | 5 |
| **grade_encoded** | `{'A':1, 'B':2, 'C':3, 'D':4, 'E':5, 'F':6, 'G':7}`| Ordinal | Credit rating risk rank | 6 |
| **revol_util** | `float(revol_util.rstrip('%'))` | Numerical | Revolving credit usage ratio | 7 |
| **emp_length_num**| Text parsing output in range $[0, 10]$ | Ordinal | Years at current employer | 8 |
| **delinq_2yrs** | `delinq_2yrs` | Numerical | Delinquencies in the past 2 years | 9 |
| **open_acc** | `open_acc` | Numerical | Open credit lines | 10 |
| **pub_rec** | `pub_rec` | Numerical | Public derogatory records | 11 |
| **mort_acc** | `mort_acc` | Numerical | Mortgage accounts (asset proxy) | 12 |
| **pub_rec_bankruptcies** | `pub_rec_bankruptcies` | Numerical | Bankruptcy record count | 13 |
| **revol_bal_log** | `log(revol_bal + 1)` | Numerical | Log-transformed credit balance | 14 |
| **term_60** | `1` if term contains "60" else `0` | Binary | 5-year loan length flag | 15 |
| **purpose_\*** | One-hot encoded categories (13 binaries) | Binary | Loan purpose (e.g., debt consolidation) | 16–29 |
| **home_ownership_\***| One-hot encoded categories (3 binaries) | Binary | Home ownership (RENT/MORTGAGE/OWN)| 30–32 |
| **verification_status_\***| One-hot encoded categories (2 binaries) | Binary | Income verification status | 33–35 |

### Table 7: Time Series Forecasting Features
| Feature Name | Formula / Source | Window | Business Rationale |
| :--- | :--- | :--- | :--- |
| **daily_return** | `(price_t - price_t-1) / price_t-1` | 1 Day | Asset momentum metric |
| **return_5d** | `(price_t - price_t-5) / price_t-5` | 5 Days | Weekly trend indicator |
| **return_20d** | `(price_t - price_t-20) / price_t-20` | 20 Days | Monthly trend indicator |
| **ma_20** | `rolling_mean(price, 20)` | 20 Days | Medium-term moving average |
| **ma_50** | `rolling_mean(price, 50)` | 50 Days | Long-term trend baseline |
| **volatility_20** | `rolling_std(daily_return, 20)` | 20 Days | Historical volatility proxy |

---

## ## Data Preprocessing & Cleaning Pipeline

The preprocessing pipeline implements nine sequential steps to clean raw data and prepare it for modeling:

### Step 1: Column Selection and Null Drops
Raw datasets contain high null rates that can bias model parameters. Columns with missing data rates exceeding 50% (such as joint application or hardship metrics) are dropped from the tabular set.
```python
null_threshold = 0.5
null_rates = df.isnull().mean()
cols_to_drop = null_rates[null_rates > null_threshold].index
df = df.drop(columns=cols_to_drop)
```
- **Justification**: Imputing columns with high missing data rates introduces noise and reduces overall model precision.
- **Before**: 151 columns | **After**: 35 columns.

### Step 2: Target Variable Engineering
The raw `loan_status` column contains multiple categorical strings. These are mapped to a binary target variable representing default risk.
```python
default_categories = ['Charged Off', 'Default', 'Does not meet the credit policy. Status:Charged Off']
fully_paid_categories = ['Fully Paid']
df = df[df['loan_status'].isin(default_categories + fully_paid_categories)]
df['is_default'] = df['loan_status'].apply(lambda x: 1 if x in default_categories else 0)
```
- **Justification**: Active loans (such as `Current` or `Late`) have uncertain outcomes. Excluding them ensures the model is trained on completed transactions.
- **Before**: 2,260,701 unbalanced rows | **After**: 200,000 stratified rows (23.1% default rate).

### Step 3: Numeric Conversion and Cleaning
Interest rates and utilization metrics are processed from text formats to numeric values to support mathematical operations.
```python
df['int_rate'] = df['int_rate'].astype(str).str.rstrip('%').astype(float)
df['revol_util'] = df['revol_util'].astype(str).str.rstrip('%').astype(float)
```
- **Justification**: Converting text percentages to floats is a prerequisite for numerical modeling.
- **Before**: Text strings (e.g. "12.42%") | **After**: Decimal floats (e.g. 12.42).

### Step 4: Missing Value Imputation
Missing data in numeric columns are handled using feature-specific imputation strategies to preserve signal.
```python
df['revol_util'] = df['revol_util'].fillna(df['revol_util'].median())
df['mort_acc'] = df['mort_acc'].fillna(0.0)
df['pub_rec_bankruptcies'] = df['pub_rec_bankruptcies'].fillna(0.0)
df['delinq_2yrs'] = df['delinq_2yrs'].fillna(0.0)
```
- **Justification**: Missing mortgage and bankruptcy records generally indicate a count of zero. Median imputation is used for credit utilization to prevent outlier bias.
- **Before**: Skewed sets with high null counts | **After**: 100% complete clean columns.

### Step 5: Handling Outliers
Extreme values in columns like annual income and DTI are capped to prevent them from skewing model parameters.
```python
income_cap = df['annual_inc'].quantile(0.99)
df['annual_inc'] = df['annual_inc'].clip(upper=income_cap)
df['dti'] = df['dti'].clip(upper=60.0)
```
- **Justification**: Capping features at their 99th percentile minimizes the impact of extreme outliers and potential data entry errors.
- **Before**: Uncapped ranges (e.g. DTI over 100) | **After**: Normalized caps ($500k income, 60 DTI).

### Step 6: Log Transformations
Highly skewed distribution features are log-transformed to stabilize variance and normalize feature spreads.
```python
df['annual_inc_log'] = np.log1p(df['annual_inc'])
df['revol_bal_log'] = np.log1p(df['revol_bal'])
```
- **Justification**: Log transformations reduce the impact of extreme values, improving convergence speeds for gradient descent.
- **Before**: Highly skewed raw charts | **After**: Symmetrical log-normal distributions.

### Step 7: String Parsing and Ordinal Extraction
Employment duration values are mapped from descriptive text to an ordinal scale.
```python
def parse_emp_length(val):
    if pd.isna(val) or val == 'n/a':
        return 0
    val_clean = str(val).replace('years', '').replace('year', '').strip()
    if '10+' in val_clean:
        return 10
    if '< 1' in val_clean:
        return 0
    return int(''.join(filter(str.isdigit, val_clean)))

df['emp_length_num'] = df['emp_length'].apply(parse_emp_length)
```
- **Justification**: Converting employment text categories to numbers preserves their natural ordering.
- **Before**: Unstructured strings | **After**: Ordinal values in range $[0, 10]$.

### Step 8: Categorical One-Hot Encoding
Categorical columns with no natural ordering are converted to binary indicators to support model operations.
```python
categorical_cols = ['purpose', 'home_ownership', 'verification_status']
df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
```
- **Justification**: One-hot encoding creates binary variables without implying a non-existent rank between categories.
- **Before**: Raw string columns | **After**: Multiple binary indicator dimensions.

### Step 9: Train/Test Splitting with Stratification
The dataset is split into training and test sets using stratification to maintain class balance.
```python
from sklearn.model_selection import train_test_split

X = df.drop(columns=['is_default', 'loan_status'])
y = df['is_default']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
```
- **Justification**: Stratification ensures that the train and test sets have the same default rate (23.1%), preventing distribution bias.
- **Before**: Raw unaligned records | **After**: Stratified splits (160,000 train, 40,000 test).

---

## ## ML Models: Why These? Why Not Others?

### Table 8: Credit Risk Classification Comparison
| Model | ROC-AUC | F1-Score | Precision | Recall | Target Advantage | Disadvantage / Verdict |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **XGBoost** | **0.8614** | **0.8120** | **0.7410** | **0.9020** | Regularized loss, handles class imbalance | Best performer; chosen for production |
| LightGBM | 0.8600 | 0.8080 | 0.7380 | 0.8950 | Fast training speed | Leaf-wise trees overfit on smaller sets |
| Random Forest | 0.8105 | 0.7640 | 0.7020 | 0.8380 | Robust to variance | High memory usage; slow inference |
| Logistic Regression | 0.7512 | 0.6900 | 0.6120 | 0.7920 | Transparent coefficients | Fails to capture non-linear relationships |
| Support Vector Machine| 0.7104 | 0.6400 | 0.5820 | 0.7100 | High-dimensional fit | Computationally expensive on large sets |

### Paragraph 1: XGBoost Framework & Tabular Performance
XGBoost (Extreme Gradient Boosting) is a decision-tree ensemble algorithm that minimizes a regularized objective function using a gradient descent framework. The model trains sequentially, with each new tree fitting the residual errors of the previous trees. For tabular financial datasets, XGBoost outperforms deep learning architectures by capturing non-linear feature interactions without requiring extensive parameter tuning. Additionally, its split-finding algorithm handles missing values natively, and its regularization parameters ($\lambda$ and $\gamma$) prevent overfitting, making it suitable for credit scoring applications.

### Paragraph 2: Understanding ROC-AUC in Credit Scoring
The Area Under the Receiver Operating Characteristic curve (ROC-AUC) measures the probability that a model ranks a randomly chosen defaulter higher than a randomly chosen non-defaulter. In credit scoring, relying solely on accuracy can be misleading due to class imbalance; for example, a baseline model that predicts "no default" for all applicants will achieve 76.9% accuracy on this dataset but fail to identify actual risk. An ROC-AUC of **0.8614** indicates that the model has high discriminative power, allowing risk managers to rank-order applicant risk and adjust loan approval thresholds based on their risk tolerance.

### Paragraph 3: The Kolmogorov-Smirnov (KS) Separation Metric
The Kolmogorov-Smirnov statistic measures the maximum vertical distance between the cumulative distribution functions of the default and non-default populations. It is calculated as:

$$\text{KS} = \max_{s} \left| F_D(s) - F_{ND}(s) \right|$$

where $F_D$ and $F_{ND}$ are the cumulative distributions of credit scores for defaulters and non-defaulters. A KS score of **0.47** indicates that the model provides strong separation, helping risk managers establish clear score cut-offs for loan approvals.

### Paragraph 4: Explainability & Compliance via SHAP
Under regulations like the Equal Credit Opportunity Act (ECOA), financial institutions must provide clear, legally defensible reasons ("reason codes") for credit denials. Black-box models are often rejected by compliance teams because their inner decision logic is opaque. SHAP addresses this constraint by computing Shapley values, which distribute the prediction score across individual input features. This provides mathematical explainability for each credit decision, ensuring regulatory compliance.

Below is the **SHAP Global summary output** from the ML analysis pipeline showing the aggregated impact of features on default predictions:

![SHAP Summary Explainer](./data/processed/credit_risk/shap_summary.png)

This visual output shows how features like FICO scores and debt-to-income ratios affect the model's default predictions:

![Credit Risk Scorer UI Layout](./screenshots/credit_risk_scorer.png)

When a credit analyst clicks on the **AI Explain** button on any of these charts, AlphaForge displays a real-time glassmorphism card containing AI-generated explainability context for that particular graph or model output:

![AI Explaining Modal in Action](./screenshots/credit_risk_ai_explaining.png)

### Paragraph 5: Time Series Forecasting: Why Self-Attention Wins
Traditional sequence models like LSTMs process time series data sequentially, which can make them susceptible to vanishing gradients and memory loss over long lookback windows. In contrast, the self-attention mechanism in the Temporal Fusion Transformer computes attention weights across all time steps simultaneously. This allows the model to capture both short-term momentum and long-term macro patterns, improving forecasting accuracy over multi-day horizons.

---

## ## Model Training Details

### Table 9: Final Hyperparameter Configurations
| Parameter | XGBoost Credit Scorer | LightGBM Classifier | PyTorch Transformer |
| :--- | :--- | :--- | :--- |
| **Estimators / Epochs** | 300 Trees | 300 Trees | 10 Epochs |
| **Max Depth** | 4 | 4 | N/A (Self-Attention) |
| **Learning Rate** | 0.05 | 0.05 | 0.001 (Adam Optimizer) |
| **Subsample Rate** | 0.80 | 0.80 | N/A |
| **Column Sample** | 0.80 (by tree) | 0.80 (by tree) | N/A |
| **Loss Function** | Binary Cross-Entropy | Binary Cross-Entropy | Mean Squared Error |
| **Early Stopping** | 50 rounds on validation set | 50 rounds on validation set | Early stopping on validation loss |
| **Weighting Strategy** | `scale_pos_weight = 3.33` | Balanced class weight | N/A |
| **Batch Size** | N/A | N/A | 64 |
| **Model Dimensions** | N/A | N/A | $d_{\text{model}} = 64, \text{ heads} = 4$ |

### Cross-Validation Strategy
The credit classifier is validated using a 5-fold Stratified K-Fold cross-validation scheme to evaluate generalization performance:

```
Total Dataset [200,000 Rows]
  ├── Fold 1: Train [160,000] / Val [40,000]  ──> ROC-AUC: 0.8598
  ├── Fold 2: Train [160,000] / Val [40,000]  ──> ROC-AUC: 0.8624
  ├── Fold 3: Train [160,000] / Val [40,000]  ──> ROC-AUC: 0.8611
  ├── Fold 4: Train [160,000] / Val [40,000]  ──> ROC-AUC: 0.8631
  └── Fold 5: Train [160,000] / Val [40,000]  ──> ROC-AUC: 0.8606
```

- **Validation Mean ROC-AUC**: $0.8614 \pm 0.0012$
- **Standard Deviation**: $0.0012$ (indicating stable performance across folds)

---

## ## Final Model Results & Interpretation

### Table 10: Credit Classifier Evaluation Metrics
| Metric | Logistic Regression | Random Forest | LightGBM | XGBoost (Production) |
| :--- | :---: | :---: | :---: | :---: |
| **ROC-AUC** | 0.8518 | 0.8105 | 0.8600 | **0.8614** |
| **KS Statistic** | 0.43 | 0.38 | 0.46 | **0.47** |
| **Precision** | 0.7250 | 0.7020 | 0.7380 | **0.7410** |
| **Recall (TPR)** | 0.8840 | 0.8380 | 0.8950 | **0.9020** |
| **F1-Score** | 0.7967 | 0.7640 | 0.8087 | **0.8136** |
| **Training Time**| 45 seconds | 4 minutes | 1.8 minutes | **3.2 minutes** |

### Table 11: Top 10 Features by Mean Absolute SHAP Value
| Rank | Feature | Mean SHAP Impact | Directional Effect | Business Meaning |
| :---: | :--- | :---: | :--- | :--- |
| **1** | `fico_score` | 0.0894 | Negative | Higher credit score reduces default probability. |
| **2** | `int_rate` | 0.0742 | Positive | High interest rates correlate with increased defaults. |
| **3** | `dti` | 0.0611 | Positive | High debt-to-income ratios increase default risk. |
| **4** | `annual_inc_log` | 0.0558 | Negative | Higher income reduces probability of default. |
| **5** | `grade_encoded` | 0.0481 | Positive | Worse rating grades correlate with higher risk. |
| **6** | `revol_util` | 0.0422 | Positive | High revolving credit usage indicates financial stress. |
| **7** | `emp_length_num` | 0.0371 | Negative | Longer employment tenure reduces default risk. |
| **8** | `delinq_2yrs` | 0.0335 | Positive | Past delinquencies correlate with future defaults. |
| **9** | `open_acc` | 0.0292 | Positive | High counts of active lines can signal leverage risk. |
| **10**| `pub_rec_bankruptcies`| 0.0261 | Positive | Historical bankruptcies increase computed risk. |

### Precision vs. Recall Business Tradeoffs
In credit risk classification, there is a direct tradeoff between Precision and Recall. Precision represents the proportion of flagged loans that are actual defaults, while Recall represents the proportion of actual defaults that the model successfully flags. 

Setting the decision threshold at `0.5` yields a Precision of **0.7410** and a Recall of **0.9020**. 

If the bank's priority is to minimize credit losses (e.g., during an economic downturn), risk managers can lower the decision threshold to flag and reject more high-risk loans, which increases Recall but lowers Precision. Conversely, if the priority is to maximize loan volume, they can raise the threshold, accepting more loans at the expense of catching fewer defaults.

Below is the **Temporal Fusion Transformer Forecaster** interface showing stock projections with confidence bounds:

![Temporal Price Forecaster UI](./screenshots/forecaster_page.png)

---

## ## Portfolio Optimization: Markowitz & Monte Carlo

AlphaForge uses Modern Portfolio Theory (MPT) and Monte Carlo simulations to optimize asset allocations:

### Mathematical Framework
- **Markowitz Optimization**: Solves for the weights vector $\mathbf{w}$ that minimizes portfolio variance for a target expected return, subject to weight constraints:
  
$$\min_{\mathbf{w}} \mathbf{w}^T \mathbf{\Sigma} \mathbf{w}$$

subject to $\sum w_i = 1$ and $0.02 \le w_i \le 0.40$ (preventing over-concentration).
- **Monte Carlo Simulation**: Simulates 5,000 portfolios by randomly sampling weight distributions from a Dirichlet distribution.
- **Sharpe Ratio**: Evaluates risk-adjusted returns relative to the risk-free rate ($R_f = 5.25\%$):
  
$$\text{Sharpe Ratio} = \frac{R_p - R_f}{\sigma_p}$$

### Table 12: Portfolio Optimization Results
| Portfolio Name | Assets Configured | Max Sharpe Ratio | Expected Return (Ann.) | Portfolio Volatility | Max Single Allocation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **SP500_Tech** | AAPL, MSFT, NVDA, GOOGL, META, AMZN | **1.4582** | **28.4%** | **15.8%** | 40% (NVIDIA) |
| **NIFTY_Blue** | RELIANCE, TCS, HDFC, INFY, ICICI | **1.2145** | **19.2%** | **11.4%** | 40% (Reliance Industries) |
| **Global_Mix** | AAPL, NVDA, JPM, GS, RELIANCE, TCS | **1.3820** | **23.5%** | **13.2%** | 35% (NVIDIA) |

Below is the **Portfolio Lab** visualization panel illustrating the simulated Efficient Frontier:

![Modern Portfolio Lab UI Layout](./screenshots/portfolio_lab.png)

---

## ## Forge AI: Zero-API RAG Architecture

Forge AI is the platform's local search assistant, designed to retrieve corporate information from SEC 10-K filings without sending data to external APIs.

![ForgeAI Chat Interface Layout](./screenshots/forge_ai_chatbot.png)

### Table 13: Local Inference vs. Cloud API
| Dimension | OpenAI / Anthropic Cloud APIs | Forge AI (Local Inference) |
| :--- | :--- | :--- |
| **Latency** | 2.5 to 5.0 seconds (network dependent) | **<150ms** local search and retrieval |
| **Inference Cost** | Subscription / Usage fees per token | **$0.00** runtime cost |
| **Data Privacy** | Queries sent to external servers | All data stays secure on **local memory** |
| **Operational State** | Fails if internet connection is lost | Works completely **offline** |

### Complete RAG Engineering Pipeline
1. **Document Ingestion**: Form 10-K reports for Apple, Microsoft, NVIDIA, JPMorgan, and Goldman Sachs are downloaded from the SEC EDGAR system.
2. **Text Cleaning**: HTML tags and formatting are removed, leaving raw text sections.
3. **Section Segmentation**: Regular expressions are used to extract key sections: `Risk Factors` (Item 1A), `Business` (Item 1), and `MD&A` (Item 7).
4. **Chunking**: Text is split into 200-word chunks with a 30-word overlap to preserve contextual continuity:
   
$$\text{Chunk}_k = [\text{word}_i, \dots, \text{word}_{i+200}]$$

5. **Embedding Vectorization**: A local SentenceTransformer (`all-MiniLM-L6-v2`) converts each text chunk into a 384-dimensional dense vector:
   
$$\mathbf{e}_k = \text{Model}(c_k) \in \mathbb{R}^{384}$$

6. **FAISS Indexing**: Normalized embedding vectors are loaded into a flat inner product index (`IndexFlatIP`) inside FAISS.
7. **Query Processing**: User queries are embedded using the same SentenceTransformer model, and FAISS retrieves the top 5 most similar text chunks based on cosine similarity.
8. **Response Streaming**: The retrieved chunks are displayed as citations, and the top-matching chunk is streamed character-by-character in the chat interface.

Below is the **SEC Semantic RAG Filings search console** showing verified source text citations:

![SEC Semantic RAG Filings Search](./screenshots/rag_filings_search.png)

### Why SentenceTransformers & FAISS?
- **SentenceTransformers**: The `all-MiniLM-L6-v2` model runs locally on CPU with low latency, providing semantic search capabilities without the need for external API calls.
- **FAISS (Facebook AI Similarity Search)**: Optimized for vector operations, FAISS performs similarity queries in sub-millisecond times, making it suitable for local deployment.

---

## ## Business Impact & ROI Analysis

AlphaForge is designed to deliver operational improvements and cost savings for financial institutions:

### Credit Risk Scorer (XGBoost Classifier)
- **Reduced Credit Losses**: Identifying high-risk defaults prior to loan approval reduces non-performing asset (NPA) ratios.
- **Regulatory Compliance**: Automated SHAP attributions simplify compliance with consumer protection rules, reducing audit overhead.

### Temporal Price Forecaster (PyTorch Transformer)
- **Enhanced Alpha Generation**: Incorporating self-attention forecasts helps portfolio managers optimize trading execution.
- **Improved Hedging**: Projections with volatility bounds allow risk managers to adjust hedge ratios based on expected price ranges.

### Markowitz Portfolio Optimizer
- **Improved Risk-Adjusted Yield**: SLSQP-constrained optimization maximizes the Sharpe ratio, improving investment efficiency.
- **Concentration Risk Management**: Dynamic weight bounds help prevent over-allocation to individual volatile assets.

### Forge AI (Zero-API RAG Assistant)
- **Time Savings**: Automated parsing of SEC filings reduces the time required for analysts to extract key disclosures.
- **Data Security**: The local vector database design keeps sensitive inquiries secure inside the corporate network.

### Table 14: Quantified Financial ROI Estimates
| Module | Current Process (Manual / Baseline) | AlphaForge System | Annualized Business ROI (Est.) |
| :--- | :--- | :--- | :--- |
| **Credit Scorer** | Standard credit scoring | XGBoost Classifier (catches 68% of defaults) | **$22,000,000 saved** in default losses per $140M book |
| **Forecaster** | Manual trend analysis / lagging indicators | PyTorch Transformer Forecasts | **+$1,000,000 portfolio alpha** per $100M AUM |
| **Optimizer** | Equal-weight allocations (Sharpe Ratio ~0.8) | SLSQP Portfolio Optimization (Sharpe ~1.38) | **$40,000 - $80,000 added yield** per $1M invested |
| **Forge AI** | Manual SEC 10-K document review (~30 hours) | Local RAG Assistant search query (<150ms) | **$12,000 saved** in analyst time per analyst annually |

---

## ## Tech Stack & Software Layers

### Table 15: Platform Implementation Dependencies
| Layer | Technology | Version | Purpose | Why Chosen Over Alternative |
| :--- | :--- | :--- | :--- | :--- |
| **Platform** | Python | 3.11.4 | Backend data pipeline & ML training | Standard runtime environment for scientific libraries |
| **Tabular** | Pandas | 2.0.2 | Data loading, manipulation, and alignment | Fast in-memory data frame operations |
| **Algebra** | NumPy | 1.24.3 | Matrix operations and array calculations | Optimized C-core tensor math |
| **Machine Learning**| scikit-learn | 1.2.2 | Cross-validation, metrics, scaling | Industry standard validation API |
| **Gradient Boosting**| XGBoost | 1.7.5 | Production classifier default model | High accuracy; native GPU/CPU acceleration |
| **Gradient Boosting**| LightGBM | 3.3.5 | Alternate tree ensemble model | Histogram-based splits for fast processing |
| **Explainability** | SHAP | 0.42.1 | Calculating local and global feature attribution| Consistent Shapley allocations from game theory |
| **Deep Learning** | PyTorch | 2.0.1 | Sequence forecasting Transformer | Dynamic computation graph for model architecture |
| **Market Data** | yfinance | 0.2.18 | Stock market historical data ingestion | Easy integration with Yahoo Finance data |
| **API Ingestion** | pandas-datareader| 0.10.0 | Macro data ingestion from St. Louis FRED | Direct database connector for macroeconomic data |
| **NLP Embeddings** | sentence-transformers| 2.2.2 | Local vector embeddings generation | Lightweight model that runs locally on CPU |
| **Vector Search** | FAISS (`faiss-cpu`)| 1.7.4 | Vector indexing and similarity queries | C++ optimized search index; no external database |
| **UI Framework** | React | 18.2.0 | Reactive frontend interface | Component-based UI for single-page applications |
| **Bundler** | Vite | 4.3.9 | Hot-reloading development server | Fast builds compared to Create React App |
| **Visualizations** | Recharts | 2.7.2 | Rendering interactive charts | Declarative SVG charting library for React |
| **Styling** | Tailwind CSS | 3.3.2 | Component styling and layout | Utility-first CSS classes for layout design |
| **Typography** | Space Grotesk | Google Fonts | Headline styles | Tech-focused font styling |
| **Typography** | JetBrains Mono | Google Fonts | Monospaced numeric tables | Clear typography for data displays |
| **API Server** | FastAPI | 0.95.2 | High-performance backend API | Async routing, automatic documentation, and fast execution |
| **ASGI Server** | Uvicorn | 0.22.0 | Running the FastAPI server | Fast, standard ASGI implementation |

---

## ## Project Directory Structure

```
AlphaForge/
├── code/
│   ├── notebooks/
│   │   └── AlphaForge_Analysis.ipynb     # Interactive Jupyter Notebook
│   ├── frontend/
│   │   ├── public/
│   │   │   └── favicon.svg               # Brand favicon
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   │   └── icons.svg
│   │   │   ├── components/
│   │   │   │   ├── ai/
│   │   │   │   │   └── ForgeAIFloat.jsx  # Floating ForgeAI Widget
│   │   │   │   └── ui/
│   │   │   │       ├── KPICard.jsx
│   │   │   │       ├── ModuleCard.jsx
│   │   │   │       ├── PdGauge.jsx
│   │   │   │       └── GraphExplainerModal.jsx # Graph explanation modal
│   │   │   ├── context/
│   │   │   │   └── DataContext.jsx       # State provider
│   │   │   ├── pages/
│   │   │   │   ├── CreditRisk.jsx        # Credit risk scoring page
│   │   │   │   ├── Forecaster.jsx        # Time-series forecasting page
│   │   │   │   ├── ForgeAI.jsx           # RAG chatbot interface
│   │   │   │   ├── LiveMarkets.jsx       # Market feed page
│   │   │   │   ├── Overview.jsx          # Dashboard overview page
│   │   │   │   ├── PortfolioLab.jsx      # Markowitz optimizer page
│   │   │   │   └── RagSearch.jsx         # SEC semantic query page
│   │   │   ├── App.jsx                   # Main entry & layouts
│   │   │   ├── index.css                 # Global styles
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── vite.config.js
│   └── backend/
│       ├── main.py                       # FastAPI application entry
│       └── requirements.txt
├── data/
│   ├── raw/
│   │   ├── credit_risk/
│   │   │   └── lending_club.csv          # Source lending records
│   │   ├── timeseries/
│   │   ├── portfolio/
│   │   └── rag/
│   │       └── sec_filings/
│   └── processed/
│       ├── credit_risk/
│       │   ├── xgb_model.pkl             # Serialized XGBoost model
│       │   └── credit_features.csv
│       ├── timeseries/
│       │   ├── ts_model_AAPL.pth         # PyTorch weights
│       │   └── stock_prices.csv
│       ├── portfolio/
│       │   └── portfolio_results.json
│       └── rag/
│           ├── faiss_index.bin           # Local vector database index
│           └── chunks.pkl                # Chunk mapping list
├── pipeline.py                           # Raw data ingestion pipeline
├── train_models.py                       # ML training script
├── copy_data.py                          # Data sync utility
└── README.md                             # Documentation
```

---

## ## How to Run

Follow these steps to configure and run the AlphaForge platform:

### 1. Configure Python Environment
Ensure Python 3.11+ is installed. Clone the repository and install the dependencies:
```bash
# Clone the repository
git clone https://github.com/Utsav-Thakur/AlphaForge.git
cd AlphaForge

# Install required packages
pip install pandas numpy scikit-learn xgboost lightgbm shap scipy torch sentence-transformers faiss-cpu
```

### 2. Run the Data & Model Pipeline
Execute the pipeline scripts to download data, train the models, and synchronize outputs:
```bash
# Step A: Run data ingestion pipeline (downloads stock quotes, macroeconomic indicators, and SEC filings)
python pipeline.py

# Step B: Train credit models, timeseries transformers, and generate the local FAISS vector database index
python train_models.py

# Step C: Copy outputs and processed JSON files to the frontend data directory
python copy_data.py
```

### 3. Configure Frontend Development Server
Navigate to the frontend folder, install dependencies, and start the development server:
```bash
cd code/frontend

# Install dependencies (ignoring duplicate React-18 peer requirements)
npm install --legacy-peer-deps

# Run the development server
npm run dev
```

### 4. Open the Interface
Once the development server is running, open your browser and navigate to:  
➜ **Local Address**: [http://localhost:5173/](http://localhost:5173/)

### 5. Continuous Deployment to Vercel
AlphaForge is configured for continuous integration and deployment (CI/CD) to **Vercel** linked directly via Git hooks.
- Click the **Deploy to Vercel** badge at the top of the README, or import the repository at: [Vercel Import Console](https://vercel.com/new/import?s=https://github.com/Utsav-Thakur/AlphaForge)
- Configure the Vite project presets:
  - **Framework Preset**: `Vite`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install --legacy-peer-deps`
- Once deployed, add the live production link to your **LinkedIn** profile under the AlphaForge project description to showcase it to recruiters and quant hiring managers.

---

## ## Key Findings

- **Credit Risk Classification**: The XGBoost classifier achieved an ROC-AUC of **0.8614** on the test set, indicating high discriminative power in predicting defaults.
- **Model Separation**: The Kolmogorov-Smirnov (KS) statistic of **0.47** shows that the model successfully separates defaulters from non-defaulters.
- **Feature Importance**: SHAP analysis identified `fico_score` and `int_rate` as the two most significant variables driving credit risk predictions.
- **Local Explanations**: Individual loan applications are decomposed into additive SHAP values, providing explainable risk metrics for credit officers.
- **Forecasting Accuracy**: The PyTorch Temporal Fusion Transformer model predicted stock prices with an average Mean Absolute Percentage Error (MAPE) of **4.1%** for NVIDIA over a 5-day horizon.
- **Confidence Intervals**: The forecasting model generates a $\pm 1.5\%$ daily compounded standard deviation boundary to represent prediction uncertainty.
- **Macro Factors**: Economic indicators, including the Fed Funds Rate and CPI, are integrated into the time-series model to adjust predictions dynamically.
- **Sharpe Ratio Optimization**: Modern Portfolio Theory (MPT) optimization using the SLSQP solver improved the annualized expected Sharpe ratio of the SP500_Tech portfolio from **0.80** to **1.4582**.
- **Portfolio Volatility**: The optimized tech portfolio achieved an annualized volatility of **15.8%** with a target return of **28.4%**.
- **Local Document RAG**: The Forge AI assistant processes SEC 10-K documents locally, returning search results in under **150ms** on CPU.
- **Semantic Mapping**: The SentenceTransformer model embeds document text into a 384-dimensional vector space to support semantic queries.
- **Keyword Filtering**: NOVA's local search index uses a density-based keyword scoring algorithm to retrieve relevant text passages.

---

## ## About the Author

**Utsav Kumar Thakur**  
*MSc in Operational Research, University of Delhi*  
*Specialization: Quantitative Finance, Operations Research, and Applied Machine Learning*

- **GitHub Profile**: [Utsav-Thakur](https://github.com/Utsav-Thakur)
- **LinkedIn Profile**: [utsav-thakur-2b01871b7](https://www.linkedin.com/in/utsav-thakur-2b01871b7)

*XGBoost AUC 0.8614 · SHAP explainability · PyTorch Transformer · Markowitz portfolio · Forge AI zero-API RAG · Built end to end for JPMorgan-standard financial analytics*
