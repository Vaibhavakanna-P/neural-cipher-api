import { useState } from 'react';
import { Network } from 'lucide-react';

export default function Dashboard() {
  const [text, setText] = useState('');
  const [model, setModel] = useState('xgboost');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      });
      const data = await response.json();
      if (response.ok) setResult({ cipher: data.cipher, confidence: data.confidence });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">AI Cipher Analysis</h1>
      <p className="text-[#64748b] mb-8">Paste encrypted text here. The Neural Network analyzes character frequency and entropy to predict the cipher type.</p>
      
      <div className="bg-[var(--glass)] border border-white/5 rounded-[20px] p-8 mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <label className="text-[0.85rem] font-bold text-[#94a3b8] tracking-[1px] flex items-center gap-2">
            <Network size={16} /> SELECT NEURAL MODEL
          </label>
          <select 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[#0f172a] text-[var(--accent-primary)] border border-[#334155] p-2 px-4 rounded-lg outline-none cursor-pointer text-[0.9rem] hover:border-[var(--accent-primary)] transition-colors"
          >
            <option value="xgboost">XGBoost (Entropy-Optimized)</option>
            <option value="random_forest">Random Forest Pipeline</option>
          </select>
        </div>
        
        <textarea 
          rows="8" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter mystery ciphertext here... (Example: Wklv lv d whvw)"
          className="w-full bg-[#020617] text-[var(--accent-primary)] border border-[#1e293b] rounded-[10px] p-4 font-mono outline-none transition-all duration-300 focus:border-[var(--accent-primary)] focus:shadow-[0_0_10px_rgba(56,189,248,0.2)] resize-none"
        />
        
        <button 
          onClick={runAI}
          disabled={loading || !text}
          className="w-full p-5 mt-6 rounded-xl border-none bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-black cursor-pointer tracking-[1px] disabled:opacity-50"
        >
          {loading ? 'ANALYZING...' : 'IDENTIFY PATTERN'}
        </button>
      </div>

      {result && (
        <div className="bg-[var(--glass)] border border-[#4ade80] border-l-[8px] rounded-[20px] p-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <small className="text-[#64748b] font-bold tracking-wider">PRIMARY MATCH</small>
              <h2 className="text-[#4ade80] text-[2.2rem] font-black mt-1">{result.cipher}</h2>
            </div>
            <div className="text-right">
              <small className="text-[#64748b] font-bold tracking-wider">CONFIDENCE</small>
              <h2 className="text-[2rem] font-bold mt-1">{result.confidence}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}