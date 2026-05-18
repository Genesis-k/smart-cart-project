import React from 'react';

const PrivacyPolicyScreen = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Privacy Policy</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: '30px' }}>
        <h3>1. Information We Collect</h3>
        <p>
          We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support. This includes:
        </p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
          <li>Name, email address, phone number, and shipping address.</li>
          <li>Payment information (processed securely by our payment partners).</li>
          <li>Order history and preferences.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect to:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
          <li>Process your orders and manage your account.</li>
          <li>Send you order updates and tracking information.</li>
          <li>Improve our website, products, and customer service.</li>
          <li>Send promotional emails (if you have opted in).</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>3. Data Security</h3>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information. Your password is hashed, and sensitive payment data is encrypted.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>4. Sharing of Information</h3>
        <p>
          We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except for trusted third parties who assist us in operating our website (e.g., delivery partners, payment processors), so long as those parties agree to keep this information confidential.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>5. Your Rights</h3>
        <p>
          You have the right to access, correct, or delete your personal data. You can manage your profile information directly through your account dashboard.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyScreen;