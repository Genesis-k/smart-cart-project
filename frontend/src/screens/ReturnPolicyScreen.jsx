import React from 'react';

const ReturnPolicyScreen = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Return, Refund & Exchange Policy</h1>

      <section style={{ marginBottom: '30px' }}>
        <h3>1. Return Policy</h3>
        <p>
          At Vivo Fashion, we want you to love your purchase. If you are not completely satisfied, 
          you may return eligible items within <strong>7 days</strong> of delivery.
        </p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
          <li>Items must be unused, unwashed, and in their original condition.</li>
          <li>All original tags and packaging must be intact.</li>
          <li>Footwear must be returned in the original shoe box.</li>
          <li><strong>Non-returnable items:</strong> Beauty products, earrings, and underwear cannot be returned for hygiene reasons.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>2. Refunds</h3>
        <p>
          Once we receive your return, it will be inspected by our team. If approved:
        </p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
          <li>Refunds will be processed within <strong>5-7 business days</strong>.</li>
          <li>Payments made via M-Pesa will be reversed to the same mobile number.</li>
          <li>Card payments will be refunded to the original card used.</li>
          <li>Shipping costs are non-refundable unless the item was damaged or incorrect upon arrival.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h3>3. Exchanges</h3>
        <p>
          Need a different size or color? We offer free exchanges for size issues within Nairobi.
        </p>
        <p style={{ marginTop: '10px' }}>
          To initiate an exchange, please contact our support team with your Order ID and the desired size. 
          Items must meet the return criteria listed above.
        </p>
      </section>

      <section style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
        <h3>Contact Us</h3>
        <p>If you have any questions about our policy, please contact us:</p>
        <p><strong>Email:</strong> support@vivofashion.com</p>
        <p><strong>Phone:</strong> +254 700 000 000</p>
      </section>
    </div>
  );
};

export default ReturnPolicyScreen;