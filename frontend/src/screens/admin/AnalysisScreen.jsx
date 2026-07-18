import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalysisScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Real numbers, computed from actual order data
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.isPaid).length;
  const unpaidOrders = totalOrders - paidOrders;
  const totalRevenue = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const downloadPDF = () => {
    const dashboardElement = document.getElementById('pdf-dashboard-content');

    html2canvas(dashboardElement, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape orientation handles wide dashboards better

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

        {/* Analytics Cards */}
        <div style={styles.cardsGrid}>

          {/* Total Revenue Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Total Revenue</h3>
            <p style={{ ...styles.cardValue, color: '#2ed573' }}>
              KSh {totalRevenue.toLocaleString()}
            </p>
          </div>

          {/* Total Orders Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Total Orders</h3>
            <p style={{ ...styles.cardValue, color: '#333' }}>
              {totalOrders}
            </p>
          </div>

          {/* Order Status Card */}
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
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#fff', padding: '40px 20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  cardTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#000', marginBottom: '20px' },
  cardValue: { fontSize: '2.5rem', fontWeight: 'bold', margin: 0 },
  statusGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  statusText: { fontSize: '1.2rem', margin: 0, color: '#333' }
};

export default AnalysisScreen;