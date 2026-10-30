import React, { useState } from 'react';
import { INITIAL_BARBERS } from '../data/initialData';
import { Scissors, Lock, User } from 'lucide-react';
import './Login.css'; // استيراد ملف الـ CSS المحدث

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
    <div className="login-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="login-container">
        <div className="login-header">
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
          <h2>تسجيل دخول الحلاق</h2>
          <p>JR Studio Barber Shop</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* اختيار الحلاق */}
          <div className="form-group">
            <label>
              <User size={16} color="#fbbf24" /> اختر الحلاق:
            </label>
            <select
              className="select-barber"
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
            >
              {INITIAL_BARBERS.map((barber) => (
                <option key={barber.id} value={barber.name}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          {/* رمز الـ PIN */}
          <div className="form-group">
            <label>
              <Lock size={16} color="#fbbf24" /> أدخل رمز الـ PIN:
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="••••"
              className="pin-input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-msg">
              {error}
            </div>
          )}

          <button type="submit" className="login-btn">
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}