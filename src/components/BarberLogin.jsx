import React, { useState } from 'react';
import { INITIAL_BARBERS } from '../data/initialData';
import { Scissors, Lock, User } from 'lucide-react';
import './Login.css';

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
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      // تطبيق خلفية صالون الحلاقة مباشرة هنا لتظهر قطعا وبدون مشاكل
      background: 'linear-gradient(rgba(11, 15, 25, 0.82), rgba(11, 15, 25, 0.90)), url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop") no-repeat center center fixed',
      backgroundSize: 'cover'
    }}>
      <div className="login-container" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '35px 28px',
        background: 'rgba(17, 24, 39, 0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '20px',
        color: '#ffffff',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        textAlign: 'right',
        direction: 'rtl',
        boxSizing: 'border-box'
      }}>
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '14px',
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '50%',
            color: '#fbbf24',
            marginBottom: '12px',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.25)'
          }}>
            <Scissors size={32} />
          </div>
          <h2 style={{ color: '#fbbf24', margin: '0 0 5px 0', fontSize: '24px', fontWeight: '800' }}>تسجيل دخول الحلاق</h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>JR Studio Barber Shop</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* اختيار الحلاق */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#d1d5db',
              fontWeight: '600'
            }}>
              <User size={16} color="#fbbf24" /> اختر الحلاق:
            </label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'rgba(31, 41, 55, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                textAlign: 'right',
                boxSizing: 'border-box'
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#d1d5db',
              fontWeight: '600'
            }}>
              <Lock size={16} color="#fbbf24" /> أدخل رمز الـ PIN:
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
                backgroundColor: 'rgba(31, 41, 55, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
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
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              color: '#111827',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}