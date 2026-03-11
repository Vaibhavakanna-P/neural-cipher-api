import { useState, useEffect } from 'react';
import { FlaskConical } from 'lucide-react';

const theories = {
  caesar: { 
    title: "Caesar Cipher", 
    concept: "The Caesar Cipher is the most basic encryption method. It works by shifting every letter in your message by a fixed number of places. Think of the alphabet on a wheel; if your shift is 3, 'A' moves 3 spots to 'D'.", 
    eMath: "E(x) = (x + k) mod 26", 
    dMath: "D(x) = (x - k) mod 26",
    steps: [
      "1. Assign a number to every letter (A=0, B=1, ..., Z=25).",
      "2. Add your Shift Key to the letter's index.",
      "3. If the result is greater than 25, wrap back to the start (Modulo 26).",
      "Example: Shift 3: CAT → (2+3), (0+3), (19+3) → FDW."
    ], 
    keyLabel: "Shift (Number 0-25)", 
    defKey: "3" 
  },
  vigenere: { 
    title: "Vigenère Cipher", 
    concept: "This is a polyalphabetic cipher. Instead of one shift for the whole message, it uses a Keyword where every letter of the keyword represents a different Caesar shift. This makes it much harder to break than Caesar.", 
    eMath: "Ci = (Pi + Ki) mod 26", 
    dMath: "Pi = (Ci - Ki + 26) mod 26",
    steps: [
      "1. Pick a keyword (e.g., 'KEY').",
      "2. Align the keyword over your text: C A T / K E Y.",
      "3. Add the letter value of 'C' to 'K', 'A' to 'E', and so on.",
      "Result: The same letter in your text might turn into different letters elsewhere!"
    ], 
    keyLabel: "Keyword (Letters)", 
    defKey: "SECRET" 
  },
  sub: { 
    title: "Substitution Cipher", 
    concept: "In this cipher, the entire alphabet is shuffled. Every 'A' is replaced by a specific letter, every 'B' by another, and so on. There are billions of possible alphabets, but it is vulnerable to 'Frequency Analysis' (seeing which letters appear most often).", 
    eMath: "Map: Alphabet → Shuffled", 
    dMath: "Map: Shuffled → Alphabet",
    steps: [
      "1. Create a 26-letter 'Key Alphabet'.",
      "2. For every letter in your message, find its counterpart in the Key Alphabet.",
      "Example: If Key is QWERTY..., 'A' becomes 'Q', 'B' becomes 'W'."
    ], 
    keyLabel: "Shuffled Alphabet (26 chars)", 
    defKey: "QWERTYUIOPASDFGHJKLZXCVBNM" 
  },
  trans: { 
    title: "Columnar Transposition", 
    concept: "This cipher doesn't change the letters; it scrambles their order. You write your message into a grid and read it back column-by-column according to a secret numeric key.", 
    eMath: "Grid Rows → Keyed Columns", 
    dMath: "Keyed Columns → Grid Rows",
    steps: [
      "1. Write message in a row-based grid (e.g., 3 columns wide).",
      "2. Read the characters vertically in a specific column order.",
      "Example: 'HELLO' in 2 columns: Row1: HE, Row2: LL, Row3: O. Read Col1 then Col2: HLOEL."
    ], 
    keyLabel: "Order (e.g. 213)", 
    defKey: "21" 
  },
  playfair: { 
    title: "Playfair Cipher", 
    concept: "A giant leap in complexity. It encrypts letters in PAIRS (Digraphs) using a 5x5 grid. Because it encrypts pairs, it hides the individual letter frequencies of the language.", 
    eMath: "5x5 Matrix Rule-set", 
    dMath: "5x5 Matrix Inverse Rules",
    steps: [
      "1. Create a 5x5 grid using a keyword (combine I and J).",
      "2. Split text into pairs: 'HE', 'LL', 'OW'. (Add 'X' if a pair is identical like 'LL').",
      "3. If letters are in same row: Shift Right. Same column: Shift Down. Different: Form a Rectangle and swap corners."
    ], 
    keyLabel: "Grid Keyword", 
    defKey: "MONARCHY" 
  }
};

export default function Learn() {
  const [activeTab, setActiveTab] = useState('caesar');
  const [inputText, setInputText] = useState('');
  const [keyText, setKeyText] = useState(theories.caesar.defKey);
  const [outputText, setOutputText] = useState('...');

  const activeData = theories[activeTab];

  // Handles switching tabs and resetting keys
  const handleTabChange = (key) => {
    setActiveTab(key);
    setKeyText(theories[key].defKey);
    setInputText('');
  };

  // The Encryption Engine
  useEffect(() => {
    const processCrypto = () => {
      const input = inputText.toUpperCase().replace(/[^A-Z]/g, "");
      const keyRaw = keyText.toUpperCase();
      let out = "";

      if (!input) {
        setOutputText("...");
        return;
      }

      try {
        if (activeTab === 'caesar') {
          let shift = parseInt(keyRaw) || 0;
          for (let i = 0; i < input.length; i++) {
            let c = input.charCodeAt(i);
            let shifted = ((c - 65 + shift) % 26);
            if (shifted < 0) shifted += 26; 
            out += String.fromCharCode(shifted + 65);
          }
        } 
        else if (activeTab === 'vigenere') {
          let key = keyRaw.replace(/[^A-Z]/g, "");
          if(!key) return;
          for(let i=0, j=0; i<input.length; i++) {
            out += String.fromCharCode(((input.charCodeAt(i)-65 + (key.charCodeAt(j%key.length)-65))%26)+65);
            j++;
          }
        }
        else if (activeTab === 'sub') {
          const map = keyRaw.padEnd(26, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
          out = input.replace(/[A-Z]/g, c => map[c.charCodeAt(0)-65] || c);
        }
        else if (activeTab === 'trans') {
          let chunk = parseInt(keyRaw) || 2;
          for(let i=0; i<input.length; i+=chunk) {
            out += input.slice(i, i+chunk).split('').reverse().join('');
          }
        }
        else if (activeTab === 'playfair') {
          let key = keyRaw.replace(/[^A-Z]/g, "").replace(/J/g, "I");
          if(!key) return;
          let matrix = [...new Set((key + "ABCDEFGHIKLMNOPQRSTUVWXYZ").split(""))].join("").slice(0, 25);
          let text = input.replace(/J/g, "I");
          let pairs = [];
          for(let i=0; i<text.length; i += 2) {
            let a = text[i], b = text[i+1] || 'X';
            if(a === b) { b = 'X'; i--; } 
            pairs.push([a, b]);
          }
          pairs.forEach(p => {
            let a=matrix.indexOf(p[0]), b=matrix.indexOf(p[1]);
            let r1=Math.floor(a/5), c1=a%5, r2=Math.floor(b/5), c2=b%5;
            if(r1===r2) out += matrix[r1*5+(c1+1)%5] + matrix[r2*5+(c2+1)%5];
            else if(c1===c2) out += matrix[((r1+1)%5)*5+c1] + matrix[((r2+1)%5)*5+c2];
            else out += matrix[r1*5+c2] + matrix[r2*5+c1];
          });
        }
        setOutputText(out);
      } catch (e) {
        setOutputText("Error processing cipher...");
      }
    };

    processCrypto();
  }, [inputText, keyText, activeTab]);

  return (
    <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 animate-fade-in">
      
      {/* Sidebar Menu */}
      <aside className="flex flex-col gap-[10px] sticky top-0">
        {Object.entries({
          caesar: 'Caesar Cipher',
          vigenere: 'Vigenère',
          sub: 'Substitution',
          trans: 'Transposition',
          playfair: 'Playfair'
        }).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`p-[14px] rounded-[10px] text-left cursor-pointer transition-colors duration-300 border-none ${
              activeTab === key 
                ? 'bg-[var(--accent-secondary)] text-white font-bold' 
                : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#2d3e5a] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </aside>

      {/* Theory Pane */}
      <div className="bg-[var(--glass)] border border-white/5 rounded-[20px] p-8">
        <h2 className="text-[2rem] text-[var(--accent-primary)] mb-4 font-bold">{activeData.title}</h2>
        <p className="text-[#cbd5e1] leading-[1.8] mb-6 text-[1.05rem]">{activeData.concept}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          <div className="bg-black p-5 rounded-xl border border-[#1e293b] font-mono">
            <label className="block text-[0.75rem] text-[#64748b] uppercase mb-2">Encryption Formula</label>
            <code className="text-[#4ade80] text-[1.1rem]">{activeData.eMath}</code>
          </div>
          <div className="bg-black p-5 rounded-xl border border-[#1e293b] font-mono">
            <label className="block text-[0.75rem] text-[#64748b] uppercase mb-2">Decryption Formula</label>
            <code className="text-[#4ade80] text-[1.1rem]">{activeData.dMath}</code>
          </div>
        </div>

        <h4 className="mb-2 font-bold text-white mt-6">How to process it:</h4>
        {activeData.steps.map((step, idx) => (
          <div key={idx} className="bg-[rgba(56,189,248,0.03)] border-l-[3px] border-[var(--accent-primary)] p-4 my-4 rounded-r-[10px] text-[#e2e8f0]">
            {step}
          </div>
        ))}

        {/* Crypto Lab */}
        <div className="mt-12 pt-10 border-t border-[#334155]">
          <h3 className="text-[var(--accent-primary)] mb-5 text-[1.4rem] flex items-center gap-2 font-bold">
            <FlaskConical size={20} /> Live Encryption Lab
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[0.8rem] text-[#94a3b8] font-bold tracking-[1px] mb-2">PLAINTEXT INPUT</label>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type message..."
                className="w-full bg-[#020617] text-[var(--accent-primary)] border border-[#1e293b] rounded-[10px] p-4 font-mono outline-none transition-all focus:border-[var(--accent-primary)] focus:shadow-[0_0_10px_rgba(56,189,248,0.2)]"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] text-[#94a3b8] font-bold tracking-[1px] mb-2 uppercase">{activeData.keyLabel}</label>
              <input 
                type="text" 
                value={keyText}
                onChange={(e) => setKeyText(e.target.value)}
                className="w-full bg-[#020617] text-[var(--accent-primary)] border border-[#1e293b] rounded-[10px] p-4 font-mono outline-none transition-all focus:border-[var(--accent-primary)] focus:shadow-[0_0_10px_rgba(56,189,248,0.2)]"
              />
            </div>
          </div>
          
          <label className="block text-[0.8rem] text-[#94a3b8] font-bold tracking-[1px] mb-2">ENCRYPTED OUTPUT</label>
          <div className="bg-[rgba(74,222,128,0.1)] border border-[#4ade80] p-6 rounded-xl text-[#4ade80] font-black font-mono text-[1.3rem] min-h-[70px] flex items-center tracking-[2px] break-all">
            {outputText}
          </div>
        </div>
      </div>
    </div>
  );
}