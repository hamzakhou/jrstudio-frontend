import React, { useState, useEffect } from 'react';
import BarberLogin from './components/BarberLogin';
import AdminDashboard from './components/AdminDashboard';
import { SERVICES_CATEGORIES } from './data/initialData';
import { ShieldCheck, Scissors, LogOut, Trash2, Menu } from 'lucide-react';

const API_URL = 'https://jrstudio-backend.vercel.app';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState('');

  // حالات خاصة بواجهة الحلاق لضمان ظهور التصميم الجديد مباشرة
  const [selectedCategory, setSelectedCategory] = useState(SERVICES_CATEGORIES[0]?.name || '');
  const [customPrices, setCustomPrices] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/api/transactions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
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

  // دوال الحلاق
  const handleServiceClick = async (service) => {
    const priceToUse = customPrices[service.id] !== undefined && customPrices[service.id] !== '' 
      ? Number(customPrices[service.id]) 
      : service.price;

    const newTransaction = {
      id: Date.now(),
      barber: currentUser,
      serviceName: service.name,
      shortName: service.shortName,
      price: priceToUse,
      tip: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      if (res.ok) {
        const savedTrans = await res.json();
        setTransactions([savedTrans, ...(Array.isArray(transactions) ? transactions : [])]);
        setCustomPrices({ ...customPrices, [service.id]: '' });
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTransactions((Array.isArray(transactions) ? transactions : []).filter(t => t.id !== id));
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const barberTransactions = Array.isArray(transactions) && currentUser && currentUser !== 'admin'
    ? transactions.filter(t => t.barber === currentUser) 
    : [];

  const totalServices = barberTransactions.reduce((acc, curr) => acc + Number(curr.price), 0);
  const totalTips = barberTransactions.reduce((acc, curr) => acc + Number(curr.tip || 0), 0);

  let barberShare = 0;
  barberTransactions.forEach(t => {
    const p = Number(t.price) || 0;
    const sName = (t.serviceName || '').toLowerCase();
    const sShort = (t.shortName || '').toLowerCase();
    
    const isProtein = sName.includes('prot') || sName.includes('kératine') || sName.includes('cls') || sName.includes('بروتين') ||
                      sShort.includes('prot') || sShort.includes('kératine') || sShort.includes('cls') || sShort.includes('بروتين');
    
    if (isProtein) {
      barberShare += p / 3;
    } else {
      barberShare += p / 2;
    }
  });

  const totalTake = barberShare + totalTips;
  const currentCatObj = SERVICES_CATEGORIES.find(c => c.name === selectedCategory) || SERVICES_CATEGORIES[0];

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

      {/* واجهة الحلاق بالتصميم الجديد والقائمة المنسدلة */}
      {currentUser && currentUser !== 'admin' && (
        <div className="jr-container" style={{ padding: '12px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', backgroundColor: '#1f2937', padding: '10px 14px', borderRadius: '10px', border: '1px solid #374151' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 'bold', color: '#fbbf24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scissors size={20} /> مرحباً، <span style={{ color: '#fff' }}>{currentUser}</span>
            </h2>
            <button onClick={() => setCurrentUser(null)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <LogOut size={14} /> خروج
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {/* اختيار الخدمة */}
            <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fde047', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '6px' }}>اختر الخدمة المقدمة</div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  <Menu size={14} /> تصنيف الخدمات:
                </label>
                <select 
                  style={{ width: '100%', backgroundColor: '#111827', border: '1px solid #4b5563', color: '#fbbf24', padding: '10px', fontSize: '14px', fontWeight: 'bold', borderRadius: '8px', outline: 'none' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {SERVICES_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {currentCatObj?.services.map(service => (
                  <div key={service.id} style={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ backgroundColor: '#1f2937', color: '#fbbf24', fontSize: '9px', padding: '1px 4px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block', marginBottom: '3px' }}>{service.shortName}</span>
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '3px', color: '#ffffff', lineHeight: '1.1' }}>{service.name}</div>
                      <div style={{ color: '#fde047', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>{service.price} DH</div>
                    </div>

                    <div>
                      <input
                        type="number"
                        placeholder="سعر مخصص"
                        value={customPrices[service.id] !== undefined ? customPrices[service.id] : ''}
                        onChange={(e) => setCustomPrices({ ...customPrices, [service.id]: e.target.value })}
                        style={{ width: '100%', backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#ffffff', padding: '5px', fontSize: '11px', borderRadius: '4px', marginBottom: '5px', textAlign: 'center', boxSizing: 'border-box' }}
                      />
                      <button onClick={() => handleServiceClick(service)} style={{ backgroundColor: '#fbbf24', color: '#111827', border: 'none', fontWeight: 'bold', fontSize: '11px', padding: '7px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                        إضافة +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* السجل والحسابات */}
            <div style={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fde047', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '6px' }}>سجلك اليومي ({currentUser})</div>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {barberTransactions.length === 0 ? (
                  <div style={{ color: '#9ca3af', textAlign: 'center', fontSize: '11px', padding: '15px' }}>لم تقم بتسجيل أي خدمة اليوم بعد.</div>
                ) : (
                  barberTransactions.map(t => (
                    <div key={t.id} style={{ backgroundColor: '#111827', padding: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #374151' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '12px' }}>{t.shortName}</span>
                        <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '4px' }}>({t.time})</span>
                        <div style={{ fontSize: '10px', color: '#d1d5db' }}>{t.serviceName}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '12px' }}>{t.price} DH</span>
                        <button onClick={() => handleDeleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #374151', backgroundColor: '#111827', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#9ca3af' }}>
                  <span>مجموع الخدمات:</span>
                  <strong>{totalServices} DH</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#4ade80' }}>
                  <span>واجب الحلاق (بروتين ÷3 والباقي ÷2):</span>
                  <strong>{barberShare.toFixed(2)} DH</strong>
                </div>
                {totalTips > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#fbbf24' }}>
                    <span>الإكراميات (Tips):</span>
                    <strong>+{totalTips} DH</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginTop: '6px', borderTop: '1px solid #374151', paddingTop: '6px' }}>
                  <span>ما ستستلمه اليوم:</span>
                  <span style={{ color: '#fbbf24', fontSize: '16px' }}>{totalTake.toFixed(2)} DH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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