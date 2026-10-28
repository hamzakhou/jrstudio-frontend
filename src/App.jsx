import React, { useState, useEffect } from 'react';
import BarberLogin from './components/BarberLogin';
import BarberView from './components/BarberView';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_BARBERS } from './data/initialData';
import { ShieldCheck } from 'lucide-react';

// رابط السيرفر السحابي على Vercel
const API_URL = 'https://jrstudio-backend.vercel.app';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState('');

  // جلب العمليات من السيرفر السحابي عند فتح التطبيق مع الحماية ضد أي خطأ
  useEffect(() => {
    fetch(`${API_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
          console.error("API returned non-array data:", data);
        }
      })
      .catch(err => {
        setTransactions([]);
        console.error("Error fetching transactions:", err);
      });
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === '0000') {
      setCurrentUser('admin');
      setShowAdminLogin(false);
      setAdminError('');
      setAdminPin('');
    } else {
      setAdminError('رمز المدير غير صحيح (جرب 0000)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!currentUser && !showAdminLogin && (
        <div style={{ padding: '15px', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <button
            onClick={() => setShowAdminLogin(true)}
            style={{
              width: '100%',
              backgroundColor: '#374151',
              color: '#fbbf24',
              border: '1px solid #4b5563',
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px'
            }}
          >
            <ShieldCheck size={18} /> دخول لوحة تحكم الأدمن (Caisse)
          </button>
        </div>
      )}

      {!currentUser && showAdminLogin && (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '30px', backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151' }}>
          <h2 style={{ color: '#fbbf24', marginBottom: '15px', textAlign: 'center' }}>تسجيل دخول المدير</h2>
          <form onSubmit={handleAdminLogin}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#d1d5db' }}>أدخل رمز الأدمن (PIN):</label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#fff', borderRadius: '6px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', marginBottom: '15px' }}
              required
            />
            {adminError && <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>{adminError}</div>}
            
            <button type="submit" style={{ width: '100%', backgroundColor: '#fbbf24', color: '#111827', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
              دخول الأدمن
            </button>
            <button type="button" onClick={() => setShowAdminLogin(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px' }}>
              الرجوع للخلف
            </button>
          </form>
        </div>
      )}

      {currentUser && currentUser !== 'admin' && (
        <BarberView 
          activeBarber={currentUser} 
          transactions={transactions}
          setTransactions={setTransactions}
          onLogout={() => setCurrentUser(null)} 
        />
      )}

      {currentUser === 'admin' && (
        <AdminDashboard 
          transactions={transactions}
          setTransactions={setTransactions}
          onLogout={() => setCurrentUser(null)} 
        />
      )}

      {!currentUser && !showAdminLogin && (
        <BarberLogin onLogin={(barber) => setCurrentUser(barber)} />
      )}
    </div>
  );
}