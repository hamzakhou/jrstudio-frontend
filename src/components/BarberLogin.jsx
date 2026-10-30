import React, { useState } from 'react';
import { INITIAL_BARBERS } from '../data/initialData';
import { Scissors, Lock, User } from 'lucide-react';

export default function BarberLogin({ onLogin }) {
  const [selectedBarber, setSelectedBarber] = useState(INITIAL_BARBERS[0].name);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const barber = INITIAL_BARBERS.find(b => b.name === selectedBarber);
    
    if (barber && barber.pin === pin) {
      onLogin(barber);
      setError('');
    } else {
      setError('رمز الدخول (PIN) غير صحيح');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      backgroundColor: '#070a10',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 40%)
      `,
      direction: 'rtl',
      zIndex: 9999
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#111827',
        borderRadius: '20px',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        padding: '35px 28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(251, 191, 36, 0.1)',
        textAlign: 'right'
      }}>
        {/* رأس النموذج والشعار */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '14px',
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '50%',
            color: '#fbbf24',
            marginBottom: '12px',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.25)'
          }}>
            <Scissors size={32} />
          </div>
          <h2 style={{ color: '#fbbf24', margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            تسجيل دخول الحلاق
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, fontWeight: '600', letterSpacing: '1px' }}>
            JR STUDIO BARBER SHOP
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* اختيار الحلاق */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#d1d5db',
              fontWeight: '700'
            }}>
              <User size={16} color="#fbbf24" /> اختر الحلاق:
            </label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '15px',
                outline: 'none',
                textAlign: 'right',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              {INITIAL_BARBERS.map((barber) => (
                <option key={barber.id} value={barber.name} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          {/* رمز الـ PIN */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#d1d5db',
              fontWeight: '700'
            }}>
              <Lock size: '16' color="#fbbf24" /> <Lock size={16} color="#fbbf24" /> أدخل رمز الـ PIN:
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                color: '#fff',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '22px',
                letterSpacing: '8px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '18px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#fbbf24',
              color: '#111827',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}