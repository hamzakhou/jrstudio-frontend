import React, { useState, useEffect } from 'react';
import { INITIAL_BARBERS, SERVICES_CATEGORIES } from '../data/initialData';
import { Scissors, LogOut, Trash2, Gift } from 'lucide-react';
import './BarberView.css';

const API_URL = 'https://jrstudio-backend.vercel.app';

export default function BarberView({ activeBarber, transactions, setTransactions, onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState(SERVICES_CATEGORIES[0]?.name || '');
  const [customPrices, setCustomPrices] = useState({});

  const handleServiceClick = async (service) => {
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

  const barberTransactions = Array.isArray(transactions) 
    ? transactions.filter(t => t.barber === activeBarber) 
    : [];

  const totalServices = barberTransactions.reduce((acc, curr) => acc + Number(curr.price), 0);
  const totalTips = barberTransactions.reduce((acc, curr) => acc + Number(curr.tip || 0), 0);

  // --- حساب حصة الحلاق بدقة (البروتين / Prot على 3 والباقي على 2) ---
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
    <div className="jr-container">
      <div className="barber-header-bar">
        <h2 className="jr-title">
          <Scissors size={22} /> مرحباً، <span className="barber-name-highlight">{activeBarber}</span>
        </h2>
        <button onClick={onLogout} className="barber-logout-btn">
          <LogOut size={16} /> خروج
        </button>
      </div>

      <div className="jr-grid">
        <div className="jr-card">
          <div className="jr-card-title">اختر الخدمة المقدمة</div>

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
                  <button onClick={() => handleServiceClick(service)} className="add-btn">
                    تسجيل الخدمة +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="jr-card">
          <div className="jr-card-title">سجلك اليومي ({activeBarber})</div>
          
          <div className="transactions-list">
            {barberTransactions.length === 0 ? (
              <div className="no-trans">لم تقم بتسجيل أي خدمة اليوم بعد.</div>
            ) : (
              barberTransactions.map(t => (
                <div key={t.id} className="transaction-item">
                  <div>
                    <span className="trans-short">{t.shortName}</span>
                    <span className="trans-time">({t.time})</span>
                    <div className="trans-fullname">{t.serviceName}</div>
                  </div>
                  <div className="trans-price-del">
                    <span className="trans-price">{t.price} DH</span>
                    <button onClick={() => handleDeleteTransaction(t.id)} className="delete-btn">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="totals-box">
            <div className="total-row">
              <span>مجموع الخدمات:</span>
              <strong>{totalServices} DH</strong>
            </div>
            <div className="total-row green-text">
              <span>واجب الحلاق (بروتين ÷3 والباقي ÷2):</span>
              <strong>{barberShare.toFixed(2)} DH</strong>
            </div>
            {totalTips > 0 && (
              <div className="total-row gold-text">
                <span>الإكراميات (Tips):</span>
                <strong>+{totalTips} DH</strong>
              </div>
            )}
            <div className="final-row">
              <span>ما ستستلمه اليوم:</span>
              <span className="final-price">{totalTake.toFixed(2)} DH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}