import React, { useState, useContext } from 'react';
import { 
  PlusCircle, 
  Database, 
  Info, 
  Upload, 
  Activity,
  Cpu, 
  UserCheck
} from 'lucide-react';
import { DataContext, DataProvider } from './context/DataContext';

import Sidebar from './components/layout/Sidebar';
import ForgeAIFloat from './components/ai/ForgeAIFloat';

// Pages
import Overview from './pages/Overview';
import ForgeAI from './pages/ForgeAI';
import LiveMarkets from './pages/LiveMarkets';
import CreditRisk from './pages/CreditRisk';
import ShapExplainer from './pages/ShapExplainer';
import Forecaster from './pages/Forecaster';
import PortfolioLab from './pages/PortfolioLab';
import RagSearch from './pages/RagSearch';

// ----------------------------------------------------------------------
// DATA ADDITION VIEW (MANUAL DATA CONSOLE)
// ----------------------------------------------------------------------
function AddDataView() {
  const { addLoan, addStockPrice, addDocument, updatePortfolioWeights } = useContext(DataContext);
  const [activeSubTab, setActiveSubTab] = useState('loan');
  
  // States
  const [lAmnt, setLAmnt] = useState(15000);
  const [lFico, setLFico] = useState(720);
  const [lDti, setLDti] = useState(12.5);
  const [lInc, setLInc] = useState(80000);
  const [lGrade, setLGrade] = useState('A');
  
  const [sTicker, setSTicker] = useState('AAPL');
  const [sDate, setSDate] = useState('2026-07-10');
  const [sClose, setSClose] = useState(181.45);
  const [sVol, setSVol] = useState(50000000);

  const [aTicker, setATicker] = useState('NVDA');
  const [aWeight, setAWeight] = useState(25);

  const [dCompany, setDCompany] = useState('Apple');
  const [dForm, setDForm] = useState('10-K');
  const [dSection, setDSection] = useState('risk_factors');
  const [dContent, setDContent] = useState('');

  const [filePreview, setFilePreview] = useState(null);

  const handleAddLoan = () => {
    const ficoNorm = (lFico - 300) / (850 - 300);
    const dtiNorm = lDti / 50;
    const incNorm = Math.min(lInc / 250000, 1.0);
    const z = 1.5 + dtiNorm * 2.0 - ficoNorm * 3.0 - incNorm * 1.5;
    const pd = 1 / (1 + Math.exp(-z));
    const band = pd > 0.3 ? 'High' : pd >= 0.15 ? 'Medium' : 'Low';
    
    addLoan({
      loan_amnt: lAmnt,
      fico_score: lFico,
      dti: lDti,
      annual_inc: lInc,
      grade: lGrade,
      pd_score: pd,
      risk_band: band
    });
    alert(`Loan parameter injected. PD computed: ${(pd * 100).toFixed(1)}%`);
  };

  const handleAddStock = () => {
    addStockPrice({
      Date: sDate,
      [sTicker]: sClose,
      Open: sClose * 0.99,
      High: sClose * 1.01,
      Low: sClose * 0.98,
      Close: sClose,
      Volume: sVol
    });
    alert(`Stock quote for ${sTicker} at ${sDate} recorded in context.`);
  };

  const handleAddAsset = () => {
    updatePortfolioWeights('SP500_Tech', { [aTicker]: aWeight / 100 });
    alert(`Asset weight allocation adjusted: ${aTicker} set to ${aWeight}%`);
  };

  const handleAddDoc = () => {
    if (!dContent.trim()) return alert("Document content cannot be empty.");
    addDocument({
      company: dCompany,
      form: dForm,
      section: dSection,
      content: dContent
    });
    alert(`SEC Filing chunk indexed into RAG vectors list.`);
    setDContent('');
  };

  // CSV Drag and drop file reader
  const processCSVFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      return alert("Error: Please select a valid CSV file.");
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.split(','));
      if (lines.length === 0) return alert("File is empty.");
      
      const headers = lines[0].map(h => h.trim());
      const previewRows = lines.slice(1, 5).map(row => row.map(cell => cell.trim()));
      
      setFilePreview({
        name: file.name,
        rawText: text,
        headers,
        rows: previewRows
      });
    };
    reader.readAsText(file);
  };

  const confirmCSVUpload = () => {
    if (!filePreview) return;
    const { rawText, headers } = filePreview;
    
    const lines = rawText.split('\n');
    if (lines.length <= 1) return alert("No records found in CSV.");
    
    const dataRows = lines.slice(1);
    let count = 0;
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    if (lowerHeaders.includes('loan_amnt') || lowerHeaders.includes('fico_score')) {
      // LOANS CSV
      dataRows.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < headers.length) return;
        
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = parts[idx];
        });
        
        const lAmnt = Number(rowObj.loan_amnt) || 15000;
        const lFico = Number(rowObj.fico_score) || 720;
        const lDti = Number(rowObj.dti) || 12.5;
        const lInc = Number(rowObj.annual_inc) || 80000;
        const lGrade = rowObj.grade || 'A';
        
        const ficoNorm = (lFico - 300) / (850 - 300);
        const dtiNorm = lDti / 50;
        const incNorm = Math.min(lInc / 250000, 1.0);
        const z = 1.5 + dtiNorm * 2.0 - ficoNorm * 3.0 - incNorm * 1.5;
        const pd = 1 / (1 + Math.exp(-z));
        const band = pd > 0.3 ? 'High' : pd >= 0.15 ? 'Medium' : 'Low';
        
        addLoan({
          loan_amnt: lAmnt,
          fico_score: lFico,
          dti: lDti,
          annual_inc: lInc,
          grade: lGrade,
          pd_score: pd,
          risk_band: band
        });
        count++;
      });
      alert(`Success: Integrated ${count} loans from CSV into database.`);
    } else if (lowerHeaders.includes('date') && (lowerHeaders.includes('aapl') || lowerHeaders.includes('msft') || lowerHeaders.includes('nvda') || lowerHeaders.includes('ticker'))) {
      // STOCKS CSV
      dataRows.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < headers.length) return;
        
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = parts[idx];
        });
        
        const dateVal = rowObj.Date || rowObj.date || '2026-07-10';
        const tickerVal = rowObj.Ticker || rowObj.ticker || 'AAPL';
        const closeVal = Number(rowObj.Close) || Number(rowObj.close) || Number(rowObj[tickerVal]) || 180.0;
        
        addStockPrice({
          Date: dateVal,
          [tickerVal]: closeVal,
          Close: closeVal,
          Volume: Number(rowObj.Volume) || Number(rowObj.volume) || 10000000
        });
        count++;
      });
      alert(`Success: Integrated ${count} stock quotes from CSV.`);
    } else if (lowerHeaders.includes('company') && (lowerHeaders.includes('text') || lowerHeaders.includes('content'))) {
      // DOCUMENTS CSV
      dataRows.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < headers.length) return;
        
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = parts[idx];
        });
        
        const contentVal = rowObj.text || rowObj.content || '';
        if (!contentVal.trim()) return;
        
        addDocument({
          company: rowObj.company || 'Apple',
          form: rowObj.form || '10-K',
          section: rowObj.section || 'risk_factors',
          content: contentVal,
          file: rowObj.file || 'csv_upload.txt'
        });
        count++;
      });
      alert(`Success: Synthesized and indexed ${count} RAG chunks from CSV.`);
    } else {
      alert("Error: CSV headers not recognized. Headers must contain 'loan_amnt', 'fico_score' OR 'Date', 'Ticker', 'Close' OR 'company', 'text'.");
    }
    setFilePreview(null);
  };

  return (
    <div className="animated-page flex flex-col gap-6 p-6 min-h-screen bg-bg relative z-10">
      <div>
        <h2 className="text-2xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
          <PlusCircle className="text-teal" /> Ingestion Console
        </h2>
        <p className="text-xs text-silver-3 mt-1">
          Manually submit individual parameter entries or inject CSV filing tables.
        </p>
      </div>

      <div className="flex bg-[#111116] border border-border p-1 rounded-lg w-fit">
        {['loan', 'stock', 'asset', 'doc', 'csv'].map((tab) => (
          <button 
            key={tab}
            onClick={() => {
              setActiveSubTab(tab);
              setFilePreview(null);
            }}
            className={`text-xs font-bold px-4 py-2 rounded capitalize transition ${
              activeSubTab === tab 
                ? 'bg-teal text-bg shadow-md' 
                : 'text-silver-3 hover:text-silver'
            }`}
          >
            {tab === 'csv' ? 'Upload CSV' : tab}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 border border-border max-w-xl">
        {activeSubTab === 'loan' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Credit Log Entry</h3>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Loan Amount</span>
              <input type="number" value={lAmnt} onChange={(e) => setLAmnt(Number(e.target.value))} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">FICO Score</span>
              <input type="number" value={lFico} onChange={(e) => setLFico(Number(e.target.value))} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">DTI %</span>
              <input type="number" step="0.1" value={lDti} onChange={(e) => setLDti(Number(e.target.value))} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Annual Income ($)</span>
              <input type="number" value={lInc} onChange={(e) => setLInc(Number(e.target.value))} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <button onClick={handleAddLoan} className="btn-teal text-xs justify-center mt-2">Submit Record</button>
          </div>
        )}

        {activeSubTab === 'stock' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Stock Quote Entry</h3>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Ticker</span>
              <input type="text" value={sTicker} onChange={(e) => setSTicker(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Date</span>
              <input type="text" value={sDate} onChange={(e) => setSDate(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Close Quote</span>
              <input type="number" step="0.01" value={sClose} onChange={(e) => setSClose(Number(e.target.value))} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <button onClick={handleAddStock} className="btn-teal text-xs justify-center mt-2">Submit Quote</button>
          </div>
        )}

        {activeSubTab === 'asset' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Asset Weight Modification</h3>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Asset Symbol</span>
              <input type="text" value={aTicker} onChange={(e) => setATicker(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Weight allocation %</span>
              <input type="number" min="0" max="100" value={aWeight} onChange={(e) => setAWeight(Number(e.target.value))} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
            </div>
            <button onClick={handleAddAsset} className="btn-teal text-xs justify-center mt-2">Submit Adjustment</button>
          </div>
        )}

        {activeSubTab === 'doc' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Regulatory Chunk Addition</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-silver-3 uppercase font-bold">Company</span>
                <input type="text" value={dCompany} onChange={(e) => setDCompany(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-silver-3 uppercase font-bold">Form</span>
                <input type="text" value={dForm} onChange={(e) => setDForm(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2 outline-none text-silver font-mono" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-silver-3 uppercase font-bold">Section</span>
                <select value={dSection} onChange={(e) => setDSection(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs px-4 py-2.5 outline-none text-silver font-mono">
                  <option value="risk_factors">Risk Factors</option>
                  <option value="business">Business Overview</option>
                  <option value="management_discussion">MD&A</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-silver-3 uppercase font-bold">Content text</span>
              <textarea rows={4} value={dContent} onChange={(e) => setDContent(e.target.value)} className="bg-[#111116] border border-border focus:border-teal rounded-lg text-xs p-4 outline-none text-silver font-mono" placeholder="Paste filing disclosures..." />
            </div>
            <button onClick={handleAddDoc} className="btn-teal text-xs justify-center mt-2">Index Text</button>
          </div>
        )}

        {activeSubTab === 'csv' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Batch Upload CSV Database</h3>
            <p className="text-[11px] text-silver-3 leading-relaxed">
              Drag & drop a CSV file containing your dataset (e.g. loans, stock quotes, or document chunks) or select the file manually.
            </p>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) processCSVFile(files[0]);
              }}
              onClick={() => document.getElementById('csv-file-selector').click()}
              className="border border-dashed border-border hover:border-teal/50 rounded-xl p-8 text-center cursor-pointer transition bg-bg-2/30"
            >
              <Upload className="mx-auto text-silver-3 mb-2 animate-bounce" size={24} />
              <span className="text-xs font-bold text-silver block">Drag & drop CSV file or click to browse</span>
              <span className="text-[10px] text-silver-3 mt-1 block">Detects credit fields, stock dates, or documents</span>
              <input 
                id="csv-file-selector"
                type="file" 
                accept=".csv"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files.length > 0) processCSVFile(files[0]);
                }}
                className="hidden"
              />
            </div>

            {filePreview && (
              <div className="p-4 bg-bg-2 border border-border rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-profit">Preview: {filePreview.name}</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] text-silver-2 font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border text-silver">
                        {filePreview.headers.map((h, idx) => (
                          <th key={idx} className="pb-1.5 pr-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filePreview.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-border/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-1.5 pr-3">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex gap-3 mt-1">
                  <button 
                    onClick={confirmCSVUpload}
                    className="btn-teal text-xs py-1.5"
                  >
                    Merge into Database
                  </button>
                  <button 
                    onClick={() => setFilePreview(null)}
                    className="btn-ghost text-xs py-1.5 text-loss hover:border-loss/40 hover:bg-loss/5"
                  >
                    Clear File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// DATA CATALOG OVERVIEW
// ----------------------------------------------------------------------
function DataOverviewView() {
  const { manualLoans, manualStocks, chunksMetadata } = useContext(DataContext);

  const downloadCSV = (data, filename, headersList) => {
    if (!data || data.length === 0) return alert("No data available to download.");
    const headers = headersList || Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] !== undefined ? row[header] : "";
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadLoans = () => {
    const formattedLoans = manualLoans.map(l => ({
      loan_amnt: l.loan_amnt,
      fico_score: l.fico_score,
      dti: l.dti,
      annual_inc: l.annual_inc,
      grade: l.grade,
      pd_score: l.pd_score,
      risk_band: l.risk_band
    }));
    downloadCSV(
      formattedLoans.length > 0 ? formattedLoans : [{ loan_amnt: 25000, fico_score: 700, dti: 15, annual_inc: 75000, grade: 'B', pd_score: 0.12, risk_band: 'Low' }],
      'alphaforge_loans.csv',
      ['loan_amnt', 'fico_score', 'dti', 'annual_inc', 'grade', 'pd_score', 'risk_band']
    );
  };

  const handleDownloadStocks = () => {
    const formattedStocks = manualStocks.map(s => {
      const sym = Object.keys(s).filter(k => k !== 'Date' && k !== 'Open' && k !== 'High' && k !== 'Low' && k !== 'Close' && k !== 'Volume')[0] || 'AAPL';
      return { Date: s.Date, Ticker: sym, Close: s[sym], Volume: s.Volume || 10000000 };
    });
    downloadCSV(
      formattedStocks.length > 0 ? formattedStocks : [{ Date: '2026-07-10', Ticker: 'AAPL', Close: 181.45, Volume: 50000000 }],
      'alphaforge_stocks.csv',
      ['Date', 'Ticker', 'Close', 'Volume']
    );
  };

  const handleDownloadRAG = () => {
    downloadCSV(
      chunksMetadata,
      'alphaforge_rag_index.csv',
      ['company', 'form', 'section', 'file', 'text']
    );
  };

  return (
    <div className="animated-page flex flex-col gap-6 p-6 min-h-screen bg-bg relative z-10">
      <div>
        <h2 className="text-2xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
          <Database className="text-teal" /> Data Catalog Overview
        </h2>
        <p className="text-xs text-silver-3 mt-1">
          Review manual updates, synchronized data records, and in-memory caches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Manual Loans ({manualLoans.length})</h3>
            <button onClick={handleDownloadLoans} className="btn-ghost text-[10px] py-1 px-3">
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto max-h-[220px]">
            {manualLoans.length === 0 ? (
              <p className="text-xs text-silver-3 italic">No manual loans currently added.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-silver-3 font-bold uppercase">
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">FICO</th>
                    <th className="pb-2">DTI</th>
                    <th className="pb-2 text-right">PD</th>
                  </tr>
                </thead>
                <tbody>
                  {manualLoans.map((l, idx) => (
                    <tr key={idx} className="border-b border-border/40 text-silver-2 font-mono">
                      <td className="py-2 font-bold">${l.loan_amnt.toLocaleString()}</td>
                      <td className="py-2">{l.fico_score}</td>
                      <td className="py-2">{l.dti}%</td>
                      <td className="py-2 text-right text-loss font-bold">{(l.pd_score * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 border border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Manual Stocks ({manualStocks.length})</h3>
            <button onClick={handleDownloadStocks} className="btn-ghost text-[10px] py-1 px-3">
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto max-h-[220px]">
            {manualStocks.length === 0 ? (
              <p className="text-xs text-silver-3 italic">No manual stock updates currently added.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-silver-3 font-bold uppercase">
                    <th className="pb-2">Ticker</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Quote</th>
                  </tr>
                </thead>
                <tbody>
                  {manualStocks.map((s, idx) => {
                    const sym = Object.keys(s).filter(k => k !== 'Date' && k !== 'Open' && k !== 'High' && k !== 'Low' && k !== 'Close' && k !== 'Volume')[0] || 'AAPL';
                    return (
                      <tr key={idx} className="border-b border-border/40 text-silver-2 font-mono">
                        <td className="py-2 font-bold text-teal">{sym}</td>
                        <td className="py-2">{s.Date}</td>
                        <td className="py-2 text-right font-bold">${s[sym].toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 flex flex-col gap-4 border border-border">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-silver uppercase tracking-wider">Indexed Vector Chunks ({chunksMetadata.length})</h3>
          <button onClick={handleDownloadRAG} className="btn-ghost text-[10px] py-1 px-3">
            Download CSV
          </button>
        </div>
        <div className="overflow-y-auto max-h-[240px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#22222e] text-silver-3 uppercase font-bold font-mono">
                <th className="pb-2">Company</th>
                <th className="pb-2">Form</th>
                <th className="pb-2">Section</th>
                <th className="pb-2">Snippet</th>
              </tr>
            </thead>
            <tbody>
              {chunksMetadata.map((d, idx) => (
                <tr key={idx} className="border-b border-[#22222e]/40 hover:bg-card-hover/20 transition text-silver-2">
                  <td className="py-3 font-bold">{d.company}</td>
                  <td className="py-3 font-mono">{d.form}</td>
                  <td className="py-3"><span className="badge-teal text-[9px] font-mono">{d.section.replace('_', ' ')}</span></td>
                  <td className="py-3 max-w-[260px] truncate text-silver-3 font-mono">{d.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SYSTEM DETAILS & BENCHMARK VIEWS
// ----------------------------------------------------------------------
function AboutView() {
  const { modelBenchmark } = useContext(DataContext);

  const benchmarkRows = modelBenchmark 
    ? Object.keys(modelBenchmark).map(key => ({
        name: key.replace('_', ' '),
        auc: modelBenchmark[key].roc_auc,
        f1: modelBenchmark[key].f1,
        precision: modelBenchmark[key].precision,
        recall: modelBenchmark[key].recall
      }))
    : [
        { name: 'Logistic Regression', auc: 0.8518, f1: 0.795, precision: 0.725, recall: 0.884 },
        { name: 'XGBoost (Active)', auc: 0.8614, f1: 0.812, precision: 0.741, recall: 0.902 },
        { name: 'LightGBM', auc: 0.8600, f1: 0.808, precision: 0.738, recall: 0.895 }
      ];

  return (
    <div className="animated-page flex flex-col gap-6 p-6 min-h-screen bg-bg relative z-10">
      <div>
        <h2 className="text-2xl font-bold font-syne heading-syne text-silver flex items-center gap-2">
          <Info className="text-teal" /> Platform Benchmarks
        </h2>
        <p className="text-xs text-silver-3 mt-1">
          Review mathematical scores, citations, and model layers.
        </p>
      </div>

      <div className="glass-card p-6 border border-border">
        <h3 className="text-sm font-bold text-silver uppercase tracking-wider mb-4">Classifier Performance Matrix</h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#22222e] text-silver-3 uppercase font-bold">
              <th className="pb-2">Algorithm Model</th>
              <th className="pb-2 text-right">ROC-AUC</th>
              <th className="pb-2 text-right">F1-Score</th>
              <th className="pb-2 text-right">Precision</th>
              <th className="pb-2 text-right">Recall</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkRows.map((row, idx) => (
              <tr key={idx} className="border-b border-[#22222e]/40 text-silver-2">
                <td className="py-3 font-bold">{row.name}</td>
                <td className="py-3 text-right font-mono text-profit font-semibold">{row.auc.toFixed(4)}</td>
                <td className="py-3 text-right font-mono">{row.f1.toFixed(4)}</td>
                <td className="py-3 text-right font-mono">{row.precision.toFixed(4)}</td>
                <td className="py-3 text-right font-mono">{row.recall.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-border flex flex-col gap-3">
          <h4 className="text-xs font-bold text-silver uppercase tracking-widest">Citations & Datasets</h4>
          <ul className="text-xs text-silver-3 list-disc pl-4 flex flex-col gap-2">
            <li><strong>LendingClub Dataset:</strong> Balanced peer-to-peer default classification records.</li>
            <li><strong>FRED indicators:</strong> Volatility, interest rate, CPI indices.</li>
            <li><strong>yfinance API:</strong> Adjusted close price arrays mapping AAPL, MSFT, and NVDA.</li>
            <li><strong>SEC EDGAR:</strong> Regulatory Form 10-K filing disclosures chunk indexes.</li>
          </ul>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-teal border border-border flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-teal uppercase tracking-widest">AlphaForge Architect</h4>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-12 h-12 rounded-full bg-[#111116] border border-border flex items-center justify-center font-bold text-silver font-syne">
                UT
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-silver">Utsav Kumar Thakur</span>
                <span className="text-[10px] text-silver-3">Machine Learning Architect & Developer</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-semibold text-teal mt-4">
            <a href="https://github.com/Utsav-Thakur" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
            <span className="text-border">|</span>
            <a href="https://linkedin.com/in/utsav-thakur-2b01871b7" target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// APP SHELL CORE ROUTER
// ----------------------------------------------------------------------
function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loading } = useContext(DataContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-silver">
        <Cpu className="w-12 h-12 text-teal animate-spin mb-4" />
        <h2 className="text-xl font-bold font-syne heading-syne">AlphaForge Workspace</h2>
        <p className="text-xs text-silver-3 mt-2">Vectorizing FAISS index and loading financial metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg relative">
      
      {/* Redesigned Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content (Shifted 260px left sidebar offset) */}
      <main className="flex-1 ml-[260px] min-h-screen relative overflow-hidden bg-bg">
        {activeTab === 'dashboard' && <Overview setActiveTab={setActiveTab} />}
        {activeTab === 'forge_ai' && <ForgeAI />}
        {activeTab === 'live_markets' && <LiveMarkets />}
        {activeTab === 'credit_scorer' && <CreditRisk />}
        {activeTab === 'shap_explainer' && <ShapExplainer />}
        {activeTab === 'forecaster' && <Forecaster />}
        {activeTab === 'optimizer' && <PortfolioLab />}
        {activeTab === 'doc_search' && <RagSearch />}
        {activeTab === 'add_data' && <AddDataView />}
        {activeTab === 'data_overview' && <DataOverviewView />}
        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Floating Widget popup */}
      <ForgeAIFloat activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
