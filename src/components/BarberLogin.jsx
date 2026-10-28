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
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#111827',
        borderRadius: '16px',
        border: '1px solid #374151',
        padding: '35px 25px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        textAlign: 'right',
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '50%',
            color: '#fbbf24',
            marginBottom: '10px'
          }}>
            <Scissors size={28} />
          </div>
          <h2 style={{ color: '#fbbf24', margin: '0 0 5px 0', fontSize: '22px' }}>تسجيل دخول الحلاق</h2>
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
              fontWeight: 'bold'
            }}>
              <User size={16} color="#fbbf24" /> اختر الحلاق:
            </label>
            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                textAlign: 'right'
              }}
            >
              {INITIAL_BARBERS.map((barber) => (
                <option key={barber.id} value={barber.name}>
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
              fontWeight: 'bold'
            }}>
              <Lock size={16} color="#fbbf24" /> أدخل رمز الـ PIN:
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1f2937',
                border: '1px solid #4b5563',
                color: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '20px',
                letterSpacing: '8px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '10px',
              borderRadius: '6px',
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
              backgroundColor: '#fbbf24',
              color: '#111827',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}