import React from 'react';

const TermsServiceScreen = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Terms of Service</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: '30px' }}>
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>2. Use of the Site</h3>
        <p>
          You agree to use the site for lawful purposes only. You must not use this site to fraudulent effect or to commit a criminal offense.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>3. Product Information</h3>
        <p>
          We strive to be as accurate as possible with product descriptions and images. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>4. Pricing and Payment</h3>
        <p>
          Prices are shown in Kenyan Shillings (KSh). We reserve the right to change prices at any time without notice. Orders are subject to acceptance and availability.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>5. Intellectual Property</h3>
        <p>
          All content included on this site, such as text, graphics, logos, images, and software, is the property of Vivo Fashion Group or its content suppliers and protected by international copyright laws.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>6. Limitation of Liability</h3>
        <p>
          Vivo Fashion Group shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products.
        </p>
      </section>
    </div>
  );
};

export default TermsServiceScreen;