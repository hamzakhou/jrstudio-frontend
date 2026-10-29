import React, { useState, useEffect } from 'react';
import { INITIAL_BARBERS, SERVICES_CATEGORIES } from '../data/initialData';
import { Scissors, LogOut, CheckCircle, Trash2, Gift } from 'lucide-react';
import './BarberView.css';

// رابط السيرفر السحابي على Vercel
const API_URL = 'https://jrstudio-backend.vercel.app';

export default function BarberView({ activeBarber, transactions, setTransactions, onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState(SERVICES_CATEGORIES[0]?.name || '');
  const [customPrices, setCustomPrices] = useState({});

  const handleServiceClick = async (service) => {
    // التحقق من وجود سعر مخصص أو استخدام السعر الافتراضي
    const priceToUse = customPrices[service.id] !== undefined && customPrices[service.id] !== '' 
      ? Number(customPrices[service.id]) 
      : service.price;

    const newTransaction = {
      id: Date.now(),
      barber: activeBarber,
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

  // فلترة معاملات الحلاق الحالي فقط
  const barberTransactions = Array.isArray(transactions) 
    ? transactions.filter(t => t.barber === activeBarber) 
    : [];

  const totalServices = barberTransactions.reduce((acc, curr) => acc + Number(curr.price), 0);
  const totalTips = barberTransactions.reduce((acc, curr) => acc + Number(curr.tip || 0), 0);

  // --- حساب حصة الحلاق بدقة (شامل للبروتين والـ Prot Cls على 3، والباقي على 2) ---
  let barberShare = 0;
  barberTransactions.forEach(t => {
    const p = Number(t.price) || 0;
    const sName = (t.serviceName || '').toLowerCase();
    const sShort = (t.shortName || '').toLowerCase();
    
    // شرط مرن يشمل prot, kératine, cls, بروتين
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
    <div className="jr-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="jr-title">
          <Scissors size={24} /> الحلاق: <span style={{ color: '#fff' }}>{activeBarber}</span>
        </h2>
        <button 
          onClick={onLogout}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '13px'
          }}
        >
          <LogOut size={16} /> خروج
        </button>
      </div>

      <div className="jr-grid">
        {/* قسم الخدمات والأزرار */}
        <div className="jr-card">
          <div className="jr-card-title">اختر الخدمة المقدمة:</div>

          {/* شريط الفئات */}
          <div className="categories-bar">
            {SERVICES_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className={`cat-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* شبكة الخدمات */}
          <div className="services-grid">
            {currentCatObj?.services.map(service => (
              <div key={service.id} className="service-box">
                <div>
                  <span className="service-badge">{service.shortName}</span>
                  <div className="service-name">{service.name}</div>
                  <div className="service-price">{service.price} DH</div>
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="سعر مخصص"
                    value={customPrices[service.id] !== undefined ? customPrices[service.id] : ''}
                    onChange={(e) => setCustomPrices({ ...customPrices, [service.id]: e.target.value })}
                    className="custom-price-input"
                  />
                  <button 
                    onClick={() => handleServiceClick(service)}
                    className="add-btn"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* قسم الحساب اليومي الخاص بالحلاق */}
        <div className="jr-card">
          <div className="jr-card-title">سجل العمليات وحسابك اليومي:</div>
          
          <div className="transactions-list">
            {barberTransactions.length === 0 ? (
              <div className="no-trans">لم تقم بتسجيل أي خدمة اليوم بعد.</div>
            ) : (
              barberTransactions.map(t => (
                <div key={t.id} className="transaction-item">
                  <div>
                    <span className="trans-short">{t.shortName}</span>
                    <span className="trans-time">({t.time})</span>
                    <div style={{ fontSize: '11px', color: '#d1d5db' }}>{t.serviceName}</div>
                  </div>
                  <div className="trans-price-del">
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{t.price} DH</span>
                    {t.tip > 0 && <span style={{ color: '#34d399', fontSize: '11px' }}>(Tip: {t.tip})</span>}
                    <button onClick={() => handleDeleteTransaction(t.id)} className="delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* الإجماليات */}
          <div className="totals-box">
            <div className="total-row">
              <span>مجموع الخدمات:</span>
              <strong>{totalServices} DH</strong>
            </div>
            <div className="total-row" style={{ color: '#4ade80' }}>
              <span>واجب الحلاق (بروتين ÷3 والباقي ÷2):</span>
              <strong>{barberShare.toFixed(2)} DH</strong>
            </div>
            {totalTips > 0 && (
              <div className="total-row" style={{ color: '#fbbf24' }}>
                <span>إجمالي الإكراميات (Tips):</span>
                <strong>+{totalTips} DH</strong>
              </div>
            )}
            <div className="final-row" style={{ marginTop: '8px', borderTop: '1px solid #374151', paddingTop: '6px' }}>
              <span>المجموع المستلم لك:</span>
              <span style={{ color: '#fbbf24' }}>{totalTake.toFixed(2)} DH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}