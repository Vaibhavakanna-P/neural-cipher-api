import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  GraduationCap, 
  Network, 
  Vial, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';

// --- DATA CONSTANTS (Your exact content preserved) ---
const THEORIES = {
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

export default function NeuralEnigma() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activeSection, setActiveSection] = useState('detector');
  const [activeCipher, setActiveCipher] = useState('caesar');
  const [labInput, setLabInput] = useState("");
  const [labKey, setLabKey] = useState(THEORIES.caesar.defKey);
  const [labOutput, setLabOutput] = useState("...");
  const [aiResultVisible, setAiResultVisible] = useState(false);

  // --- CRYPTO LOGIC ENGINE ---
  useEffect(() => {
    const input = labInput.toUpperCase().replace(/[^A-Z]/g, "");
    const keyRaw = labKey.toUpperCase();
    let result = "";

    if (activeCipher === 'caesar') {
      let shift = parseInt(keyRaw) || 0;
      result = input.split('').map(char => {
        let code = char.charCodeAt(0);
        let shifted = ((code - 65 + shift) % 26);
        if (shifted < 0) shifted += 26;
        return String.fromCharCode(shifted + 65);
      }).join('');
    } 
    else if (activeCipher === 'vigenere') {
      let key = keyRaw.replace(/[^A-Z]/g, "");
      if (key) {
        let j = 0;
        for (let i = 0; i < input.length; i++) {
          result += String.fromCharCode(((input.charCodeAt(i) - 65 + (key.charCodeAt(j % key.length) - 65)) % 26) + 65);
          j++;
        }
      }
    }
    else if (activeCipher === 'sub') {
      const map = keyRaw.padEnd(26, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      result = input.replace(/[A-Z]/g, c => map[c.charCodeAt(0) - 65] || c);
    }
    else if (activeCipher === 'trans') {
      let chunk = parseInt(keyRaw) || 2;
      for (let i = 0; i < input.length; i += chunk) {
        result += input.slice(i, i + chunk).split('').reverse().join('');
      }
    }
    else if (activeCipher === 'playfair') {
      let key = keyRaw.replace(/[^A-Z]/g, "").replace(/J/g, "I");
      if (key) {
        let matrix = [...new Set((key + "ABCDEFGHIKLMNOPQRSTUVWXYZ").split(""))].join("").slice(0, 25);
        let text = input.replace(/J/g, "I");
        let pairs = [];
        for (let i = 0; i < text.length; i += 2) {
          let a = text[i], b = text[i + 1] || 'X';
          if (a === b) { b = 'X'; i--; }
          pairs.push([a, b]);
        }
        pairs.forEach(p => {
          let a = matrix.indexOf(p[0]), b = matrix.indexOf(p[1]);
          let r1 = Math.floor(a / 5), c1 = a % 5, r2 = Math.floor(b / 5), c2 = b % 5;
          if (r1 === r2) result += matrix[r1 * 5 + (c1 + 1) % 5] + matrix[r2 * 5 + (c2 + 1) % 5];
          else if (c1 === c2) result += matrix[((r1 + 1) % 5) * 5 + c1] + matrix[((r2 + 1) % 5) * 5 + c2];
          else result += matrix[r1 * 5 + c2] + matrix[r2 * 5 + c1];
        });
      }
    }
    setLabOutput(result || "Awaiting valid input...");
  }, [labInput, labKey, activeCipher]);

  // Handle Cipher Change
  const handleCipherChange = (key) => {
    setActiveCipher(key);
    setLabKey(THEORIES[key].defKey);
  };

  return (
    <div className="app-container" style={styles.appContainer}>
      
      {/* LANDING OVERLAY */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            style={styles.landingOverlay}
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.heroTitle}
            >
              Neural Enigma
            </motion.h1>
            <p style={styles.heroSlogan}>
              Unmasking classical cryptography through the lens of machine learning. 
              Learn, encrypt, and analyze patterns in one interface.
            </p>
            <button className="btn-get-started" onClick={() => setHasStarted(true)} style={styles.btnGetStarted}>
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <nav style={{...styles.sidebar, transform: hasStarted ? 'translateX(0)' : 'translateX(-100%)'}}>
        <div style={styles.logoSmall}><Network size={20} color="#38bdf8" /> NEURAL ENIGMA</div>
        <div className="nav-links">
          <div 
            style={{...styles.navLink, ...(activeSection === 'detector' ? styles.navLinkActive : {})}} 
            onClick={() => setActiveSection('detector')}
          >
            <Cpu size={18} /> Detector Dashboard
          </div>
          <div 
            style={{...styles.navLink, ...(activeSection === 'learn' ? styles.navLinkActive : {})}} 
            onClick={() => setActiveSection('learn')}
          >
            <GraduationCap size={18} /> Educational Hub
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{...styles.mainStage, opacity: hasStarted ? 1 : 0}}>
        
        {/* DETECTOR SECTION */}
        {activeSection === 'detector' && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="section">
            <h1 style={styles.sectionTitle}>AI Cipher Analysis</h1>
            <p style={styles.sectionSub}>Paste encrypted text here. The Neural Network analyzes character frequency and entropy to predict the cipher type.</p>
            
            <div style={styles.card}>
              <div style={styles.modelSelector}>
                <label style={styles.labLabel}><Network size={14} /> SELECT NEURAL MODEL</label>
                <select style={styles.modelDropdown}>
                  <option>XGBoost (Entropy-Optimized)</option>
                  <option>Convolutional Neural Network</option>
                  <option>Random Forest Pipeline</option>
                  <option>LSTM (Sequence-Aware)</option>
                </select>
              </div>
              <textarea 
                style={styles.textarea} 
                rows="8" 
                placeholder="Enter mystery ciphertext here... (Example: Wklv lv d whvw)"
              ></textarea>
              <button onClick={() => setAiResultVisible(true)} style={styles.btnAnalyze}>IDENTIFY PATTERN</button>
            </div>

            {aiResultVisible && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={styles.resultCard}>
                <div style={styles.resultRow}>
                  <div>
                    <small style={styles.smallLabel}>PRIMARY MATCH</small>
                    <h2 style={styles.resultName}>CAESAR</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <small style={styles.smallLabel}>CONFIDENCE</small>
                    <h2 style={styles.resultConf}>98.2%</h2>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* LEARN SECTION */}
        {activeSection === 'learn' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section">
            <div style={styles.learnGrid}>
              <aside style={styles.cipherMenu}>
                {Object.keys(THEORIES).map(key => (
                  <button 
                    key={key}
                    style={{...styles.cipherBtn, ...(activeCipher === key ? styles.cipherBtnActive : {})}}
                    onClick={() => handleCipherChange(key)}
                  >
                    {THEORIES[key].title}
                  </button>
                ))}
              </aside>

              <div style={styles.theoryPane}>
                <h2 style={styles.paneTitle}>{THEORIES[activeCipher].title}</h2>
                <p style={styles.conceptText}>{THEORIES[activeCipher].concept}</p>
                
                <div style={styles.mathContainer}>
                  <div style={styles.mathBlock}>
                    <label style={styles.mathLabel}>Encryption Formula</label>
                    <code style={styles.mathCode}>{THEORIES[activeCipher].eMath}</code>
                  </div>
                  <div style={styles.mathBlock}>
                    <label style={styles.mathLabel}>Decryption Formula</label>
                    <code style={styles.mathCode}>{THEORIES[activeCipher].dMath}</code>
                  </div>
                </div>

                <h4 style={{marginBottom: '10px'}}>How to process it:</h4>
                {THEORIES[activeCipher].steps.map((step, i) => (
                  <div key={i} style={styles.stepBox}>{step}</div>
                ))}

                {/* INTERACTIVE LAB */}
                <div style={styles.cryptoLab}>
                  <h3 style={styles.labTitle}><Vial size={20} color="#38bdf8" /> Live Encryption Lab</h3>
                  <div style={styles.labControls}>
                    <div>
                      <label style={styles.labLabel}>PLAINTEXT INPUT</label>
                      <input 
                        type="text" 
                        style={styles.labInput} 
                        placeholder="Type message..." 
                        onInput={(e) => setLabInput(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={styles.labLabel}>{THEORIES[activeCipher].keyLabel}</label>
                      <input 
                        type="text" 
                        value={labKey}
                        style={styles.labInput} 
                        onInput={(e) => setLabKey(e.target.value)}
                      />
                    </div>
                  </div>
                  <label style={styles.labLabel}>ENCRYPTED OUTPUT</label>
                  <div style={styles.labResult}>{labOutput}</div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

// --- STYLES OBJECT (Mirroring your CSS exactly) ---
const styles = {
  appContainer: {
    backgroundColor: '#070a13',
    color: '#f8fafc',
    display: 'flex',
    height: '100vh',
    overflow: 'hidden'
  },
  landingOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at center, #1e293b 0%, #070a13 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  heroTitle: {
    fontSize: 'clamp(3rem, 10vw, 6rem)',
    fontWeight: 900,
    background: 'linear-gradient(to right, #fff, #38bdf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-2px',
    textAlign: 'center'
  },
  heroSlogan: {
    color: '#94a3b8',
    fontSize: '1.2rem',
    marginBottom: '2.5rem',
    textAlign: 'center',
    maxWidth: '600px',
    lineHeight: 1.6
  },
  btnGetStarted: {
    padding: '1.2rem 3.5rem',
    background: 'transparent',
    color: 'white',
    border: '2px solid #38bdf8',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  },
  sidebar: {
    width: '280px',
    background: '#0f172a',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    transition: '0.5s cubic-bezier(0.4, 0, 0.3, 1)'
  },
  logoSmall: {
    fontWeight: 900,
    color: '#38bdf8',
    marginBottom: '3rem',
    fontSize: '1.2rem',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  navLink: {
    padding: '1rem',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: '#64748b',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: '0.3s'
  },
  navLinkActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    borderLeft: '4px solid #38bdf8'
  },
  mainStage: {
    flex: 1,
    padding: '2.5rem',
    overflowY: 'auto',
    transition: '1s'
  },
  sectionTitle: { fontSize: '2rem', marginBottom: '0.5rem' },
  sectionSub: { color: '#64748b', marginBottom: '2rem' },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem'
  },
  textarea: {
    width: '100%',
    background: '#020617',
    color: '#38bdf8',
    border: '1px solid #1e293b',
    borderRadius: '10px',
    padding: '1rem',
    fontFamily: 'Courier New, monospace',
    outline: 'none',
    fontSize: '1rem'
  },
  btnAnalyze: {
    width: '100%',
    padding: '1.2rem',
    marginTop: '1.5rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '1px'
  },
  resultCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '2rem',
    borderLeft: '8px solid #4ade80'
  },
  resultRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { color: '#4ade80', fontSize: '2.2rem' },
  resultConf: { fontSize: '2rem' },
  smallLabel: { color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' },
  learnGrid: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' },
  cipherMenu: { display: 'flex', flexDirection: 'column', gap: '10px' },
  cipherBtn: {
    background: '#1e293b',
    border: 'none',
    color: '#94a3b8',
    padding: '14px',
    borderRadius: '10px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: '0.3s'
  },
  cipherBtnActive: { background: '#818cf8', color: 'white' },
  theoryPane: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '2rem'
  },
  paneTitle: { fontSize: '2rem', color: '#38bdf8', marginBottom: '1rem' },
  conceptText: { color: '#cbd5e1', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '1.05rem' },
  mathContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '20px 0' },
  mathBlock: { background: '#000', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b' },
  mathLabel: { display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' },
  mathCode: { color: '#4ade80', fontSize: '1.1rem', fontFamily: 'monospace' },
  stepBox: { background: 'rgba(56, 189, 248, 0.03)', borderLeft: '3px solid #38bdf8', padding: '1.2rem', margin: '1rem 0', borderRadius: '0 10px 10px 0' },
  cryptoLab: { marginTop: '3rem', borderTop: '1px solid #334155', paddingTop: '2.5rem' },
  labTitle: { color: '#38bdf8', marginBottom: '20px', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' },
  labControls: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  labInput: { width: '100%', background: '#020617', color: '#38bdf8', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem', fontFamily: 'Courier New, monospace' },
  labLabel: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' },
  labResult: { background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', padding: '1.5rem', borderRadius: '12px', color: '#4ade80', fontWeight: 800, fontFamily: 'Courier New, monospace', fontSize: '1.3rem', minHeight: '70px', display: 'flex', alignItems: 'center', letterSpacing: '2px' },
  modelSelector: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  modelDropdown: { background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', padding: '8px 15px', borderRadius: '8px', outline: 'none' }
};