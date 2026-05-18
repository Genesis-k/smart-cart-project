import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AnalysisScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Fetch all orders to calculate stats
  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      const fetchOrders = async () => {
        try {
          const { data } = await axios.get('/api/orders');
          setOrders(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  // --- CALCULATE STATS ---
  const totalOrders = orders.length;
  const totalSales = orders
    .filter((order) => order.isPaid)
    .reduce((acc, order) => acc + order.totalPrice, 0);
  const paidOrders = orders.filter((order) => order.isPaid).length;
  const unpaidOrders = totalOrders - paidOrders;

  // --- PDF GENERATION LOGIC ---
  const downloadReportHandler = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Vivo Fashion - Sales Analysis Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    // Summary Section
    doc.autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `KSh ${totalSales.toLocaleString()}`],
        ['Total Orders', totalOrders],
        ['Paid Orders', paidOrders],
        ['Unpaid Orders', unpaidOrders],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] }, // Black header
    });

    // Orders Table
    doc.text('Order Details (Paid Orders)', 14, doc.lastAutoTable.finalY + 15);
    
    const tableRows = [];
    orders.forEach((order) => {
      if (order.isPaid) {
        const orderData = [
          order._id.substring(0, 10) + '...',
          order.user?.name || 'Deleted User',
          order.createdAt.substring(0, 10),
          `KSh ${order.totalPrice}`,
          order.paymentMethod,
        ];
        tableRows.push(orderData);
      }
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['ID', 'Customer', 'Date', 'Amount', 'Method']],
      body: tableRows,
      theme: 'striped',
    });

    doc.save('vivo-sales-report.pdf');
  };

  if (loading) return <h2>Loading Analysis...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Sales Analysis</h1>
        <button 
          onClick={downloadReportHandler}
          className="btn-black"
          style={{ 
            padding: '10px 20px', 
            background: '#25D366', // Green for download
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '5px'
          }}
        >
          Download PDF Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        
        {/* Card 1: Total Revenue */}
        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            KSh {totalSales.toLocaleString()}
          </p>
        </div>

        {/* Card 2: Total Orders */}
        <div style={cardStyle}>
          <h3>Total Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {totalOrders}
          </p>
        </div>

        {/* Card 3: Paid vs Unpaid */}
        <div style={cardStyle}>
          <h3>Order Status</h3>
          <p>Paid: <span style={{ color: 'green', fontWeight: 'bold' }}>{paidOrders}</span></p>
          <p>Unpaid: <span style={{ color: 'red', fontWeight: 'bold' }}>{unpaidOrders}</span></p>
        </div>

      </div>
    </div>
  );
};

const cardStyle = {
  flex: '1',
  minWidth: '250px',
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  border: '1px solid #eee',
  textAlign: 'center'
};

export default AnalysisScreen;