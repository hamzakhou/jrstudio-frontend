import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/initialData';
import { Scissors, Plus, Trash2, LogOut } from 'lucide-react';
import './BarberView.css';

// رابط السيرفر السحابي على Vercel
const API_URL = 'https://jrstudio-backend.vercel.app';

export default function BarberView({ activeBarber, transactions, setTransactions, onLogout }) {
  const [customPrice, setCustomPrice] = useState({});
  const [activeCategory, setActiveCategory] = useState('Service Principal');

  const categories = [...new Set(MENU_ITEMS.map(item => item.category))];

  const handleAddService = async (item) => {
    const price = item.isCustomPrice && customPrice[item.id] ? Number(customPrice[item.id]) : item.price;
    
    const newTransaction = {
      id: Date.now(),
      barber: activeBarber.name,
      serviceName: item.name,
      shortName: item.shortName,
      price: price,
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
        // ضمان تحديث الحالة بالبيانات المعادة من السيرفر قاعدة البيانات
        setTransactions(prev => [savedTrans, ...(Array.isArray(prev) ? prev : [])]);
      } else {
        const errorData = await res.json();
        console.error("Server error response:", errorData);
        alert("حدث خطأ أثناء حفظ الخدمة في السيرفر!");
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("خطأ في الاتصال بالإنترنت أو السيرفر!");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTransactions(prev => (Array.isArray(prev) ? prev.filter(t => t.id !== id) : []));
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const barberTransactions = Array.isArray(transactions) ? transactions.filter(t => t.barber === activeBarber.name) : [];
  const barberServicesTotal = barberTransactions.reduce((acc, curr) => acc + Number(curr.price), 0);
  const barberShare = barberServicesTotal / 2;
  const barberTotalTips = barberTransactions.reduce((acc, curr) => acc + Number(curr.tip || 0), 0);
  const totalCashToTake = barberShare + barberTotalTips;

  return (
    <div className="jr-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="jr-title" style={{ margin: 0 }}>
          <Scissors size={24} /> مرحباً، {activeBarber.name} 👋
        </h2>
        
        <button 
          onClick={onLogout} 
          style={{ 
            backgroundColor: '#ef4444', 
            color: '#fff', 
            border: 'none', 
            padding: '8px 14px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          <LogOut size={16} /> خروج
        </button>
      </div>

      <div className="jr-grid">
        <div className="jr-card">
          <h3 className="jr-card-title">اختر الخدمة المقدمة</h3>
          
          <div className="categories-bar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="services-grid">
            {MENU_ITEMS.filter(item => item.category === activeCategory).map(item => (
              <div key={item.id} className="service-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="service-badge">{item.shortName}</span>
                    <div className="service-name">{item.name}</div>
                    <div className="service-price">{item.price} DH</div>
                  </div>

                  {item.isCustomPrice && (
                    <input
                      type="number"
                      placeholder="الثمن"
                      className="custom-price-input"
                      style={{ width: '70px' }}
                      onChange={(e) => setCustomPrice({ ...customPrice, [item.id]: e.target.value })}
                    />
                  )}
                </div>

                <button onClick={() => handleAddService(item)} className="add-btn" style={{ width: '100%', marginTop: '4px' }}>
                  <Plus size={14} style={{ display: 'inline' }} /> تسجيل الخدمة
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="jr-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="jr-card-title">سجلك اليومي ({activeBarber.name})</h3>

            <div className="transactions-list">
              {barberTransactions.length === 0 ? (
                <p className="no-trans">لم تسجل أي خدمة بعد اليوم.</p>
              ) : (
                barberTransactions.map(t => (
                  <div key={t.id} className="transaction-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="trans-short">{t.shortName}</span>
                        <span className="trans-time">({t.time})</span>
                      </div>
                      <div className="trans-price-del">
                        <span style={{ fontWeight: 'bold' }}>{t.price} DH</span>
                        <button onClick={() => handleDelete(t.id)} className="delete-btn">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {Number(t.tip) > 0 && (
                      <div style={{ fontSize: '12px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', background: '#111827', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                        🎁 إكرامية مسجلة من الإدارة: +{t.tip} DH
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="totals-box">
            <div className="total-row">
              <span>مجموع الخدمات:</span>
              <span>{barberServicesTotal} DH</span>
            </div>
            <div className="total-row">
              <span>حصتك من الخدمات (50%):</span>
              <span style={{ color: '#4ade80' }}>{barberShare} DH</span>
            </div>
            {barberTotalTips > 0 && (
              <div className="total-row" style={{ color: '#fbbf24' }}>
                <span>إجمالي الإكراميات (Pourboires):</span>
                <span>+{barberTotalTips} DH</span>
              </div>
            )}
            <div className="final-row" style={{ borderTop: '1px dashed #374151', paddingTop: '8px', marginTop: '4px' }}>
              <span>ما ستستلمه اليوم:</span>
              <span style={{ color: '#fbbf24', fontSize: '18px' }}>{totalCashToTake} DH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}