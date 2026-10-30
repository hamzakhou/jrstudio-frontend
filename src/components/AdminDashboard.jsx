import React, { useState, useEffect } from 'react';
import { INITIAL_BARBERS } from '../data/initialData';
import { LayoutDashboard, TrendingDown, LogOut, Plus, Trash2, History, Wallet, Landmark, Gift, MessageCircle, Calendar, Trophy, Flame } from 'lucide-react';
import './AdminDashboard.css';

// رابط السيرفر السحابي على Vercel
const API_URL = 'https://jrstudio-backend.vercel.app';

export default function AdminDashboard({ transactions, setTransactions, onLogout }) {
  const [yesterdayCaisse, setYesterdayCaisse] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [tipInputs, setTipInputs] = useState({});

  // حالات الأرشيف والأيام السابقة
  const [archivedDays, setArchivedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState('current');
  const [archiveData, setArchiveData] = useState(null);

  useEffect(() => {
    const fetchAdminData = () => {
      fetch(`${API_URL}/api/transactions`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data)) setTransactions(data);
          else setTransactions([]);
        })
        .catch(err => console.error("Error fetching transactions:", err));

      fetch(`${API_URL}/api/expenses`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data)) setExpenses(data);
          else setExpenses([]);
        })
        .catch(err => console.error("Error fetching expenses:", err));
    };

    fetchAdminData();

    // جلب الأيام المغلقة للأرشيف بشكل آمن لا يتسبب في خطأ 404
    fetch(`${API_URL}/api/cloture/history`)
      .then(res => {
        if (!res.ok) throw new Error('API history not found');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setArchivedDays(data);
        } else if (data && Array.isArray(data.history)) {
          setArchivedDays(data.history);
        } else if (data && Array.isArray(data.clotures)) {
          setArchivedDays(data.clotures);
        }
      })
      .catch(err => console.log("Archive endpoint not active yet or returned 404 (Ignored)"));

    fetch(`${API_URL}/api/settings/yesterday_caisse`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.value) setYesterdayCaisse(data.value);
      })
      .catch(err => console.error("Error fetching settings:", err));

    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, [setTransactions]);

  // عند اختيار تاريخ معين من الأرشيف
  const handleSelectDate = (dateVal) => {
    setSelectedDate(dateVal);
    if (dateVal === 'current') {
      setArchiveData(null);
    } else {
      const found = archivedDays.find(d => (d.date || d.id || '').toString() === dateVal.toString());
      setArchiveData(found || null);
    }
  };

  const handleYesterdayChange = async (val) => {
    setYesterdayCaisse(val);
    try {
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'yesterday_caisse', value: val })
      });
    } catch (err) {
      console.error("Error saving yesterday caisse:", err);
    }
  };

  const handleUpdateTip = async (transId) => {
    const tipVal = Number(tipInputs[transId]) || 0;
    
    try {
      await fetch(`${API_URL}/api/transactions/${transId}/tip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tip: tipVal })
      });
      
      const updatedTransactions = (Array.isArray(transactions) ? transactions : []).map(t => 
        t.id === transId ? { ...t, tip: tipVal } : t
      );
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error("Error updating tip:", err);
    }
  };

  // --- حساب مدخول خدمات اليوم للحلاقين المعتمدين فقط ---
  const validBarberNames = INITIAL_BARBERS.map(b => b.name);
  const validTransactions = Array.isArray(transactions) 
    ? transactions.filter(t => validBarberNames.includes(t.barber))
    : [];

  const totalServicesToday = validTransactions.reduce((acc, curr) => acc + Number(curr.price), 0);
  const totalTipsToday = validTransactions.reduce((acc, curr) => acc + Number(curr.tip || 0), 0);
  const yesterdayAmount = Number(yesterdayCaisse) || 0;
  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((acc, curr) => acc + Number(curr.amount), 0) : 0;

  // --- حساب إجمالي الصندوق (Caisse Brut) بدقة ---
  const totalCaisseBeforePay = totalServicesToday + totalTipsToday + yesterdayAmount - totalExpenses;

  // --- حساب حصة الحلاقين بدقة (البروتين ÷3 والباقي ÷2) ---
  const calculateBarbersTotalPay = () => {
    let totalPay = 0;
    validTransactions.forEach(t => {
      const price = Number(t.price) || 0;
      const sName = (t.serviceName || '').toLowerCase();
      const sShort = (t.shortName || '').toLowerCase();
      
      const isProtein = sName.includes('prot') || sName.includes('kératine') || sName.includes('cls') || sName.includes('بروتين') ||
                        sShort.includes('prot') || sShort.includes('kératine') || sShort.includes('cls') || sShort.includes('بروتين');
      
      if (isProtein) {
        totalPay += price / 3;
      } else {
        totalPay += price / 2;
      }
    });
    return totalPay;
  };

  const totalBarbersPay = calculateBarbersTotalPay();
  const laisseNetTotal = totalCaisseBeforePay - totalBarbersPay - totalTipsToday;

  // --- 🌟 منطق حساب الإحصائيات الذكية الآمن 100% ---
  const getTopBarberInfo = () => {
    if (!validTransactions.length) return { name: 'لا توجد خدمات بعد', revenue: 0 };
    const totals = {};
    validTransactions.forEach(t => {
      if (t.barber) {
        totals[t.barber] = (totals[t.barber] || 0) + (Number(t.price) || 0);
      }
    });

    let bestName = 'غير متوفر';
    let maxRev = 0;
    for (const [name, rev] of Object.entries(totals)) {
      if (rev > maxRev) {
        maxRev = rev;
        bestName = name;
      }
    }
    return { name: bestName, revenue: maxRev };
  };

  const getPopularServiceInfo = () => {
    if (!validTransactions.length) return 'لا توجد خدمات بعد';
    const counts = {};
    validTransactions.forEach(t => {
      const s = t.shortName || t.serviceName || 'خدمة عامة';
      counts[s] = (counts[s] || 0) + 1;
    });

    let popular = 'حلاقة شعر';
    let maxC = 0;
    for (const [sName, count] of Object.entries(counts)) {
      if (count > maxC) {
        maxC = count;
        popular = sName;
      }
    }
    return popular;
  };

  const topBarber = getTopBarberInfo();
  const popularService = getPopularServiceInfo();

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpTitle || !newExpAmount) return;

    const newExpense = {
      id: Date.now(),
      title: newExpTitle,
      amount: Number(newExpAmount)
    };

    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (res.ok) {
        const savedExp = await res.json();
        setExpenses([savedExp, ...expenses]);
        setNewExpTitle('');
        setNewExpAmount('');
      }
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleShareWhatsApp = () => {
    const todayStr = new Date().toLocaleDateString('fr-FR');
    
    const reportText = 
`📊 *RAPPORT DE LA JOURNÉE - JR STUDIO* 💈
📅 Date : ${todayStr}

💰 *مدخول الخدمات:* ${totalServicesToday} DH
💵 *صندوق الأمس:* ${yesterdayAmount} DH
📉 *المصاريف (Dépenses):* -${totalExpenses} DH
📥 *المجموع بالصندوق (Caisse Brut):* ${totalCaisseBeforePay} DH

------------------
✂️ *واجب الحلاقين:* -${totalBarbersPay.toFixed(2)} DH
🎁 *الإكراميات (Tips):* ${totalTipsToday} DH
------------------

✅ *الصافي النهائي للصالون (Laisse Net) :* *${laisseNetTotal.toFixed(2)} DH*`;

    const encodedText = encodeURIComponent(reportText);
    const ownerPhoneNumber = "212600000000"; 
    
    window.open(`https://wa.me/${ownerPhoneNumber}?text=${encodedText}`, '_blank');
  };

  const handleClotureDay = async () => {
    const todayStr = new Date().toLocaleDateString('fr-FR');
    const confirmCloture = window.confirm(`هل أنت متأكد من إغلاق يوم ${todayStr}؟ \nسيتم أرشفة الحسابات، تصفير خدمات اليوم، ونقل الصافي (${laisseNetTotal.toFixed(2)} DH) ليكون صندوق الأمس تلقائياً.`);
    
    if (!confirmCloture) return;

    try {
      const res = await fetch(`${API_URL}/api/cloture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          totalServices: totalServicesToday,
          yesterdayCaisse: yesterdayAmount,
          totalCaisseBrut: totalCaisseBeforePay,
          totalBarbersPay: totalBarbersPay,
          totalExpenses: totalExpenses,
          laisseNet: laisseNetTotal
        })
      });

      if (res.ok) {
        alert('تم إغلاق اليوم وتدوير الحسابات بنجاح! 🚀');
        window.location.reload();
      } else {
        alert('حدث خطأ أثناء عملية الإغلاق.');
      }
    } catch (err) {
      console.error("Error executing cloture:", err);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2 className="admin-title" style={{ margin: 0 }}>
            <LayoutDashboard size={28} /> JR Studio - إدارة الصندوق والحسابات
          </h2>
          <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
            📅 تاريخ اليوم: {todayFormatted}
          </span>
        </div>
        <button 
          onClick={onLogout}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LogOut size={16} /> خروج الأدمن
        </button>
      </div>

      {/* 🌟 بطاقات الإحصائيات الذكية (Smart Insights) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* الحلاق الأكثر إنتاجية */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            padding: '14px',
            borderRadius: '12px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trophy size={28} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
              ⭐ الحلاق الأكثر إنتاجية اليوم (Top Performer)
            </span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              {topBarber.revenue > 0 ? `${topBarber.name} (${topBarber.revenue} DH)` : 'لا توجد خدمات مسجلة'}
            </div>
          </div>
        </div>

        {/* الخدمة الأكثر طلباً */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          border: '1px solid rgba(248, 113, 113, 0.4)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            padding: '14px',
            borderRadius: '12px',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={28} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
              🔥 الخدمة الأكثر طلباً اليوم (Most Popular)
            </span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              {validTransactions.length > 0 ? popularService : 'لا توجد خدمات مسجلة'}
            </div>
          </div>
        </div>
      </div>

      {/* شريط اختيار الأرشيف (الأيام السابقة) */}
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="#fbbf24" />
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>عرض أرشيف الأيام السابقة:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedDate}
            onChange={(e) => handleSelectDate(e.target.value)}
            style={{
              backgroundColor: '#111827',
              border: '1px solid #fbbf24',
              color: '#fbbf24',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '15px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="current">اليوم الحالي (العمليات الجارية)</option>
            {archivedDays.map((day, idx) => {
              const dLabel = day.date || day.created_at || `يوم سابق #${idx + 1}`;
              const dVal = day.date || day.id || idx;
              const dNet = day.laisseNet || day.laisse_net || 0;
              return (
                <option key={idx} value={dVal}>
                  📅 تاريخ: {dLabel} (صافي: {dNet} DH)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {selectedDate !== 'current' && (
        <div style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid #fbbf24',
          color: '#fbbf24',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ⚠️ أنت تستعرض حالياً تقرير أرشيف تاريخ: {archiveData?.date || archiveData?.created_at || selectedDate} (للاطلاع فقط)
        </div>
      )}

      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="#fbbf24" />
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>المتبقي من صندوق الأمس (Caisse d'hier):</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            placeholder="أدخل مبلغ الأمس (DH)"
            value={yesterdayCaisse}
            onChange={(e) => handleYesterdayChange(e.target.value)}
            disabled={selectedDate !== 'current'}
            style={{
              backgroundColor: '#111827',
              border: '1px solid #fbbf24',
              color: '#fbbf24',
              padding: '8px 12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '180px',
              textAlign: 'center',
              opacity: selectedDate !== 'current' ? 0.7 : 1
            }}
          />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>DH</span>
        </div>
      </div>

      <div style={{
        backgroundColor: '#111827',
        border: '2px solid #fbbf24',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#fbbf24', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Landmark size={22} /> 1. إجمالي الأموال الموجودة في الصندوق حالياً:
        </h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">مدخول خدمات اليوم</span>
            <span className="stat-value gold">
              {selectedDate === 'current' ? totalServicesToday : (archiveData?.totalServices || archiveData?.total_services || 0)} DH
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">إجمالي الإكراميات (Pourboires)</span>
            <span className="stat-value" style={{ color: '#34d399' }}>
              +{selectedDate === 'current' ? totalTipsToday : 0} DH
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">صندوق الأمس (Report)</span>
            <span className="stat-value blue">
              {selectedDate === 'current' ? yesterdayAmount : (archiveData?.yesterdayCaisse || archiveData?.yesterday_caisse || 0)} DH
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">إجمالي المصاريف المخصومة</span>
            <span className="stat-value red">
              -{selectedDate === 'current' ? totalExpenses : (archiveData?.totalExpenses || archiveData?.total_expenses || 0)} DH
            </span>
          </div>
          <div className="stat-card" style={{ gridColumn: 'span 4', backgroundColor: '#1f2937' }}>
            <span className="stat-label" style={{ fontSize: '15px', color: '#fbbf24' }}>المجموع الفعلي الموجود في الدرج/الصندوق الآن (Caisse Brut)</span>
            <span className="stat-value gold" style={{ fontSize: '28px' }}>
              {selectedDate === 'current' ? totalCaisseBeforePay : (archiveData?.totalCaisseBrut || archiveData?.total_caisse_brut || 0)} DH
            </span>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#60a5fa', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={22} /> 2. تقسيم المدخول (حصة الحلاقين + المصاريف):
        </h3>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">مجموع واجبات الحلاقين (البروتين ÷3 والباقي ÷2)</span>
            <span className="stat-value red" style={{ color: '#f87171' }}>
              -{selectedDate === 'current' ? totalBarbersPay.toFixed(2) : Number(archiveData?.totalBarbersPay || archiveData?.total_barbers_pay || 0).toFixed(2)} DH
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">إجمالي إكراميات الحلاقين (تُخصم من الدرج)</span>
            <span className="stat-value red" style={{ color: '#fbbf24' }}>
              -{selectedDate === 'current' ? totalTipsToday : 0} DH
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">إجمالي المصاريف (Dépenses)</span>
            <span className="stat-value red">
              -{selectedDate === 'current' ? totalExpenses : (archiveData?.totalExpenses || archiveData?.total_expenses || 0)} DH
            </span>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#064e3b', border: '1px solid #10b981', gridColumn: 'span 3' }}>
            <span className="stat-label" style={{ color: '#a7f3d0' }}>الصافي النهائي المتبقي للصالون (Laisse Net)</span>
            <span className="stat-value green" style={{ color: '#34d399', fontSize: '24px' }}>
              {selectedDate === 'current' ? laisseNetTotal.toFixed(2) : Number(archiveData?.laisseNet || archiveData?.laisse_net || 0).toFixed(2)} DH
            </span>
          </div>
        </div>
      </div>

      {selectedDate === 'current' && (
        <>
          <h3 style={{ color: '#fbbf24', marginBottom: '12px' }}>أعمال الحلاقين اليومية:</h3>
          <div className="barbers-columns-grid">
            {INITIAL_BARBERS.map(barber => {
              const barberTrans = validTransactions.filter(t => t.barber === barber.name);
              
              let bShare = 0;
              barberTrans.forEach(t => {
                const p = Number(t.price) || 0;
                const sName = (t.serviceName || '').toLowerCase();
                const sShort = (t.shortName || '').toLowerCase();
                const isProt = sName.includes('prot') || sName.includes('kératine') || sName.includes('cls') || sName.includes('بروتين') ||
                               sShort.includes('prot') || sShort.includes('kératine') || sShort.includes('cls') || sShort.includes('بروتين');
                if (isProt) {
                  bShare += p / 3;
                } else {
                  bShare += p / 2;
                }
              });

              const bTotal = barberTrans.reduce((acc, curr) => acc + Number(curr.price), 0);
              const bTips = barberTrans.reduce((acc, curr) => acc + Number(curr.tip || 0), 0);
              const bTotalTake = bShare + bTips;

              return (
                <div key={barber.id} className="barber-column-card">
                  <div>
                    <div className="barber-col-header">
                      <span>{barber.name}</span>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>({barberTrans.length})</span>
                    </div>

                    <div className="barber-col-services">
                      {barberTrans.length === 0 ? (
                        <span style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', display: 'block', padding: '10px' }}>لا توجد خدمات</span>
                      ) : (
                        barberTrans.map(t => (
                          <div key={t.id} className="barber-col-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 'bold' }}>{t.shortName}</span>
                              <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{t.price} DH</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #374151', paddingTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Gift size={12} /> Tip: {t.tip || 0} DH
                              </span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                  type="number"
                                  placeholder="Tip"
                                  defaultValue={t.tip || ''}
                                  onChange={(e) => setTipInputs({ ...tipInputs, [t.id]: e.target.value })}
                                  style={{ width: '50px', backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#34d399', borderRadius: '4px', fontSize: '12px', textAlign: 'center', padding: '2px' }}
                                />
                                <button
                                  onClick={() => handleUpdateTip(t.id)}
                                  style={{ backgroundColor: '#10b981', color: '#111827', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  حفظ
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="barber-col-totals">
                    <div className="barber-col-row">
                      <span>الخدمات (المجموع):</span>
                      <strong>{bTotal} DH</strong>
                    </div>
                    <div className="barber-col-row" style={{ color: '#4ade80' }}>
                      <span>واجب الحلاق:</span>
                      <strong>{bShare.toFixed(2)} DH</strong>
                    </div>
                    {bTips > 0 && (
                      <div className="barber-col-row" style={{ color: '#fbbf24' }}>
                        <span>الإكراميات (Pourboire):</span>
                        <strong>+{bTips} DH</strong>
                      </div>
                    )}
                    <div className="barber-col-row" style={{ borderTop: '1px solid #374151', paddingTop: '4px', marginTop: '4px', color: '#fff' }}>
                      <span>المجموع المستلم:</span>
                      <strong style={{ color: '#fbbf24' }}>{bTotalTake.toFixed(2)} DH</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="expenses-section">
            <h3 style={{ color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={20} /> إدارة المصاريف اليومية (Dépenses)
            </h3>

            <form onSubmit={handleAddExpense} className="expense-input-group">
              <input
                type="text"
                placeholder="بيان المصروف (مثلاً: mouchoir / ménage)"
                className="expense-input title"
                value={newExpTitle}
                onChange={(e) => setNewExpTitle(e.target.value)}
              />
              <input
                type="number"
                placeholder="المبلغ (DH)"
                className="expense-input amount"
                value={newExpAmount}
                onChange={(e) => setNewExpAmount(e.target.value)}
              />
              <button type="submit" className="add-expense-btn">
                <Plus size={16} style={{ display: 'inline' }} /> إضافة
              </button>
            </form>

            <div className="expenses-list">
              {!Array.isArray(expenses) || expenses.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>لا توجد مصاريف مسجلة حتى الآن.</p>
              ) : (
                expenses.map(e => (
                  <div key={e.id} className="expense-chip">
                    <span>{e.title}: <strong>{e.amount} DH</strong></span>
                    <button 
                      onClick={() => handleDeleteExpense(e.id)} 
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {selectedDate === 'current' && (
        <>
          <div className="laisse-banner">
            <div className="laisse-title">الصافي الكلي المتبقي للصالون (Laisse Net)</div>
            <div className="laisse-amount">{laisseNetTotal.toFixed(2)} DH</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
              (إجمالي الصندوق {totalCaisseBeforePay} DH - حصة الحلاقين {totalBarbersPay.toFixed(2)} DH - الإكراميات {totalTipsToday} DH)
            </div>
          </div>

          {/* أزرار العمليات النهائية */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                backgroundColor: '#25d366',
                color: '#ffffff',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flex: '1',
                minWidth: '220px',
                justifyContent: 'center'
              }}
            >
              <MessageCircle size={20} /> إرسال التقرير عبر واتساب
            </button>

            <button
              onClick={handleClotureDay}
              style={{
                backgroundColor: '#10b981',
                color: '#111827',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flex: '1',
                minWidth: '220px',
                justifyContent: 'center'
              }}
            >
              🔒 إغلاق اليوم وتدوير الحسابات (Clôture)
            </button>
          </div>
        </>
      )}
    </div>
  );
}