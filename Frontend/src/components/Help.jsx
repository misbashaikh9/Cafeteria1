import React, { useState } from 'react';

const Help = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      id: 1,
      question: "How do I place an order?",
      answer: "Browse our menu, add items to your cart, and proceed to checkout. You'll need to provide delivery details and payment information to complete your order."
    },
    {
      id: 2,
      question: "What are your delivery times?",
      answer: "We typically deliver within 30-45 minutes of order placement. Delivery times may vary based on location and order volume."
    },
    {
      id: 3,
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 5 minutes of placement. Contact our support team immediately if you need to cancel your order."
    },
    {
      id: 4,
      question: "Do you offer refunds?",
      answer: "We offer refunds for incorrect orders or quality issues. Please contact us within 24 hours of delivery with your order details."
    },
    {
      id: 5,
      question: "How do I track my order?",
      answer: "You'll receive email updates about your order status. You can also check your order history in your profile section."
    },
    {
      id: 6,
      question: "What payment methods do you accept?",
      answer: "We accept cash on delivery, credit/debit cards, and digital wallets like Paytm, Google Pay, and PhonePe."
    }
  ];

  const handleFAQToggle = (id) => {
    setActiveFAQ(activeFAQ === id ? null : id);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e) => {
    setContactForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 24 }}>Help & Support</h1>
      
      <div style={{ display: 'grid', gap: 32 }}>
        {/* Quick Contact */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 20 }}>Quick Contact</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>📞</span>
              <div>
                <div style={{ fontWeight: 600 }}>Phone</div>
                <div style={{ color: '#666' }}>+91 98765 43210</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>📧</span>
              <div>
                <div style={{ fontWeight: 600 }}>Email</div>
                <div style={{ color: '#666' }}>support@brewhaven.com</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🕒</span>
              <div>
                <div style={{ fontWeight: 600 }}>Hours</div>
                <div style={{ color: '#666' }}>7:00 AM - 11:00 PM (Daily)</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 20 }}>Frequently Asked Questions</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {faqs.map((faq) => (
              <div key={faq.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <button
                  onClick={() => handleFAQToggle(faq.id)}
                  style={{
                    width: '100%',
                    padding: 16,
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 600,
                    color: '#3b2f2f'
                  }}
                >
                  {faq.question}
                  <span style={{ fontSize: 18, color: '#b8860b' }}>
                    {activeFAQ === faq.id ? '−' : '+'}
                  </span>
                </button>
                {activeFAQ === faq.id && (
                  <div style={{ 
                    padding: '0 16px 16px 16px', 
                    color: '#666', 
                    lineHeight: 1.6,
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 20 }}>Send us a Message</h3>
          <form onSubmit={handleContactSubmit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b8860b', fontSize: 15 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b8860b', fontSize: 15 }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Subject</label>
              <input
                type="text"
                name="subject"
                value={contactForm.subject}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b8860b', fontSize: 15 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Message</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                required
                rows={4}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #b8860b', fontSize: 15, resize: 'vertical' }}
                placeholder="Tell us how we can help you..."
              />
            </div>
            <button
              type="submit"
              style={{
                background: '#b8860b',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Live Chat */}
        <div style={{ background: '#fffaf5', borderRadius: 12, padding: 24, boxShadow: '0 1px 6px rgba(59,47,47,0.08)', textAlign: 'center' }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 16 }}>Need Immediate Help?</h3>
          <p style={{ color: '#666', marginBottom: 20 }}>
            Our customer support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <button
            onClick={() => alert('Live chat feature coming soon!')}
            style={{
              background: '#b8860b',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Start Live Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help; 