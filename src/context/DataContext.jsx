import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

// RFC 4180-compliant CSV parser in pure JavaScript to support commas and quotes inside cells
export const parseCSV = (text) => {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  
  if (lines.length === 0) return [];
  const headers = lines[0].map(h => h.trim());
  return lines.slice(1).map(values => {
    const obj = {};
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index].trim() : "";
      if (val === 'True' || val === 'true') val = true;
      else if (val === 'False' || val === 'false') val = false;
      else if (!isNaN(val) && val !== '' && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(val)) val = Number(val);
      obj[header] = val;
    });
    return obj;
  });
};

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // Credit Risk Scorer states
  const [creditDashboard, setCreditDashboard] = useState(null);
  const [modelBenchmark, setModelBenchmark] = useState(null);
  const [shapImportance, setShapImportance] = useState([]);
  const [shapWaterfall, setShapWaterfall] = useState([]);
  const [pdScores, setPdScores] = useState([]);

  // Time Series Forecasting states
  const [stockPrices, setStockPrices] = useState([]);
  const [forecastResults, setForecastResults] = useState(null);
  const [forecastData, setForecastData] = useState({});

  // Portfolio Optimization states
  const [portfolioResults, setPortfolioResults] = useState(null);

  // Financial RAG states
  const [chunksMetadata, setChunksMetadata] = useState([]);

  // Macro indicators state
  const [macroIndicators, setMacroIndicators] = useState([]);

  // Top 10 high risk loans state
  const [top10Loans, setTop10Loans] = useState([]);

  // Manual input extensions (DataContext in-memory state)
  const [manualLoans, setManualLoans] = useState([]);
  const [manualStocks, setManualStocks] = useState([]);
  const [manualPortfolios, setManualPortfolios] = useState({});
  const [manualDocuments, setManualDocuments] = useState([]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // Load Credit Dashboard JSON
        const creditDashRes = await fetch('/data/credit_dashboard.json');
        if (creditDashRes.ok) {
          const data = await creditDashRes.json();
          setCreditDashboard(data);
        }

        // Load Top 10 High Risk Loans JSON
        const top10Res = await fetch('/data/top_10_loans.json');
        if (top10Res.ok) {
          const data = await top10Res.json();
          setTop10Loans(data);
        }

        // Load Model Benchmark JSON
        const modelBenchmarkRes = await fetch('/data/model_benchmark.json');
        if (modelBenchmarkRes.ok) {
          const data = await modelBenchmarkRes.json();
          setModelBenchmark(data);
        }

        // Load SHAP Importance CSV
        const shapImpRes = await fetch('/data/shap_importance.csv');
        if (shapImpRes.ok) {
          const text = await shapImpRes.text();
          setShapImportance(parseCSV(text));
        }

        // Load SHAP Waterfall CSV
        const shapWatRes = await fetch('/data/shap_waterfall_sample.csv');
        if (shapWatRes.ok) {
          const text = await shapWatRes.text();
          setShapWaterfall(parseCSV(text));
        }

        // Load PD Scores CSV
        const pdScoresRes = await fetch('/data/pd_scores.csv');
        if (pdScoresRes.ok) {
          const text = await pdScoresRes.text();
          setPdScores(parseCSV(text));
        }

        // Load Stock Prices CSV
        const stockPricesRes = await fetch('/data/stock_prices.csv');
        if (stockPricesRes.ok) {
          const text = await stockPricesRes.text();
          setStockPrices(parseCSV(text));
        }

        // Load Forecast Results JSON
        const forecastResultsRes = await fetch('/data/forecast_results.json');
        if (forecastResultsRes.ok) {
          const data = await forecastResultsRes.json();
          setForecastResults(data);
        }

        // Load Tickers Forecasts
        const tickers = ['AAPL', 'MSFT', 'NVDA'];
        const fData = {};
        for (const t of tickers) {
          const key = t.replace('.', '_');
          const forecastRes = await fetch(`/data/forecast_${key}.csv`);
          if (forecastRes.ok) {
            const text = await forecastRes.text();
            fData[t] = parseCSV(text);
          }
        }
        setForecastData(fData);

        // Load Portfolio Results JSON
        const portfolioResultsRes = await fetch('/data/portfolio_results.json');
        if (portfolioResultsRes.ok) {
          const data = await portfolioResultsRes.json();
          setPortfolioResults(data);
        }

        // Load Chunks Metadata CSV
        const chunksRes = await fetch('/data/chunks_metadata.csv');
        if (chunksRes.ok) {
          const text = await chunksRes.text();
          setChunksMetadata(parseCSV(text));
        }

        // Load Macro Indicators CSV
        const macroRes = await fetch('/data/macro_indicators.csv');
        if (macroRes.ok) {
          const text = await macroRes.text();
          setMacroIndicators(parseCSV(text));
        }

      } catch (err) {
        console.error("Error loading pre-computed data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Helper functions for manual state additions
  const addLoan = (loan) => {
    setManualLoans(prev => [loan, ...prev]);
  };

  const addStockPrice = (pricePoint) => {
    setManualStocks(prev => [...prev, pricePoint]);
  };

  const updatePortfolioWeights = (portfolioName, weights) => {
    setManualPortfolios(prev => ({
      ...prev,
      [portfolioName]: weights
    }));
  };

  const addDocument = (doc) => {
    setManualDocuments(prev => [doc, ...prev]);
    // Add to chunksMetadata as a searchable chunk
    setChunksMetadata(prev => [
      {
        text: doc.content,
        company: doc.company,
        form: doc.form,
        section: doc.section,
        file: doc.file || `${doc.company}_${doc.form}.txt`
      },
      ...prev
    ]);
  };

  return (
    <DataContext.Provider value={{
      loading,
      creditDashboard,
      modelBenchmark,
      shapImportance,
      shapWaterfall,
      pdScores,
      stockPrices,
      forecastResults,
      forecastData,
      portfolioResults,
      chunksMetadata,
      macroIndicators,
      top10Loans,
      
      // Manual entries states
      manualLoans,
      manualStocks,
      manualPortfolios,
      manualDocuments,

      // Actions
      addLoan,
      addStockPrice,
      updatePortfolioWeights,
      addDocument
    }}>
      {children}
    </DataContext.Provider>
  );
};
