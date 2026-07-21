import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalysisScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { userInfo } = useSelector((state) => state.auth);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Overall stats - unaffected by the date filter, always reflects everything
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.isPaid).length;
  const unpaidOrders = totalOrders - paidOrders;
  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Sales-by-day report - respects the date filter
  const dateFilteredPaidOrders = orders.filter((o) => {
    if (!o.isPaid || !o.paidAt) return false;
    const paidDate = o.paidAt.substring(0, 10); // YYYY-MM-DD
    if (dateFrom && paidDate < dateFrom) return false;
    if (dateTo && paidDate > dateTo) return false;
    return true;
  });

  const salesByDayMap = {};
  dateFilteredPaidOrders.forEach((o) => {
    const day = o.paidAt.substring(0, 10);
    if (!salesByDayMap[day]) salesByDayMap[day] = { date: day, orders: 0, revenue: 0 };
    salesByDayMap[day].orders += 1;
    salesByDayMap[day].revenue += o.totalPrice || 0;
  });

  const salesByDay = Object.values(salesByDayMap).sort((a, b) => b.date.localeCompare(a.date));
  const maxDayRevenue = Math.max(...salesByDay.map((d) => d.revenue), 1); // avoid divide-by-zero
  const filteredRevenue = dateFilteredPaidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const downloadPDF = () => {
    const dashboardElement = document.getElementById('pdf-dashboard-content');

    html2canvas(dashboardElement, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save('Vivo_Fashion_Sales_Report.pdf');
    });
  };

  if (loading) return <h2 style={{ padding: '30px' }}>Loading sales data...</h2>;
  if (error) return <h2 style={{ padding: '30px', color: 'red' }}>{error}</h2>;

  return (
    <div style={styles.container}>
      <div id="pdf-dashboard-content" style={styles.pdfWrapper}>

        {/* Header Section */}
        <div style={styles.headerRow}>
          <h1 style={styles.title}>Sales Analysis</h1>
          <button onClick={downloadPDF} style={styles.downloadBtn}>
            Download PDF Report
          </button>
        </div>

        {/* Overall Analytics Cards */}
        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Total Revenue</h3>
            <p style={{ ...styles.cardValue, color: '#2ed573' }}>
              KSh {totalRevenue.toLocaleString()}
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Total Orders</h3>
            <p style={{ ...styles.cardValue, color: '#333' }}>
              {totalOrders}
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Order Status</h3>
            <div style={styles.statusGroup}>
              <p style={styles.statusText}>
                Paid: <span style={{ color: '#2ed573', fontWeight: 'bold' }}>{paidOrders}</span>
              </p>
              <p style={styles.statusText}>
                Unpaid: <span style={{ color: '#ff4757', fontWeight: 'bold' }}>{unpaidOrders}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sales By Day Report */}
        <div style={styles.reportSection}>
          <div style={styles.reportHeaderRow}>
            <h2 style={styles.reportTitle}>Sales By Day</h2>
            <div style={styles.filterRow}>
              <div>
                <label style={styles.filterLabel}>From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div>
                <label style={styles.filterLabel}>To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  style={styles.clearFilterBtn}
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <p style={styles.filteredSummary}>
              Showing {dateFilteredPaidOrders.length} paid order{dateFilteredPaidOrders.length !== 1 ? 's' : ''}
              {' '}totaling <strong>KSh {filteredRevenue.toLocaleString()}</strong> in this range.
            </p>
          )}

          {salesByDay.length === 0 ? (
            <p style={{ color: '#666', padding: '20px 0' }}>No paid orders in this date range.</p>
          ) : (
            <div style={styles.dayTable}>
              {salesByDay.map((day) => (
                <div key={day.date} style={styles.dayRow}>
                  <div style={styles.dayLabel}>{day.date}</div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${(day.revenue / maxDayRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <div style={styles.dayStats}>
                    KSh {day.revenue.toLocaleString()} &middot; {day.orders} order{day.orders !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '30px', backgroundColor: '#f8f9fa', minHeight: '80vh' },
  pdfWrapper: { backgroundColor: '#f8f9fa', padding: '20px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  title: { fontSize: '2.5rem', fontWeight: 'bold', color: '#000', margin: 0 },
  downloadBtn: { backgroundColor: '#2ed573', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(46, 213, 115, 0.2)' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' },
  card: { backgroundColor: '#fff', padding: '40px 20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  cardTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '20px' },
  cardValue: { fontSize: '2.5rem', fontWeight: 'bold', margin: 0 },
  statusGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statusText: { fontSize: '1.2rem', margin: 0, color: '#333' },
  reportSection: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  reportHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '10px' },
  reportTitle: { fontSize: '1.6rem', fontWeight: 'bold', margin: 0 },
  filterRow: { display: 'flex', alignItems: 'flex-end', gap: '15px', flexWrap: 'wrap' },
  filterLabel: { display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '4px', fontWeight: 'bold' },
  dateInput: { padding: '8px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '0.9rem' },
  clearFilterBtn: { padding: '9px 16px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', color: '#555' },
  filteredSummary: { color: '#555', fontSize: '0.9rem', marginBottom: '20px' },
  dayTable: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' },
  dayRow: { display: 'grid', gridTemplateColumns: '110px 1fr 200px', alignItems: 'center', gap: '15px' },
  dayLabel: { fontSize: '0.9rem', fontWeight: 'bold', color: '#333' },
  barTrack: { backgroundColor: '#f0f0f0', borderRadius: '4px', height: '18px', overflow: 'hidden' },
  barFill: { backgroundColor: '#2ed573', height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  dayStats: { fontSize: '0.85rem', color: '#555', textAlign: 'right' },
};

export default AnalysisScreen;