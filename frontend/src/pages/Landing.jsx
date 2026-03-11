import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const enterApp = () => {
    setIsExiting(true);
    // Wait for the 0.8s slide-up animation to finish, then route to dashboard
    setTimeout(() => navigate('/dashboard'), 800);
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col justify-center items-center z-[1000]"
      style={{
        background: 'radial-gradient(circle at center, #1e293b 0%, #070a13 100%)',
        transform: isExiting ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.8s cubic-bezier(0.7, 0, 0.3, 1)'
      }}
    >
      <h1 className="text-[clamp(3rem,10vw,6rem)] font-black tracking-tight text-center"
          style={{
            background: 'linear-gradient(to right, #fff, var(--accent-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
        Neural Cipher
      </h1>
      <p className="text-[#94a3b8] text-lg md:text-xl mb-10 text-center max-w-[600px] leading-relaxed px-4">
        Unmasking classical cryptography through the lens of machine learning. Learn, encrypt, and analyze patterns in one interface.
      </p>
      <button 
        onClick={enterApp}
        className="px-14 py-4 bg-transparent text-white border-2 border-[var(--accent-primary)] rounded-[50px] text-[1.1rem] font-bold cursor-pointer transition-all duration-300 hover:bg-[var(--accent-primary)] hover:scale-105 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
      >
        Get Started
      </button>
    </div>
  );
}