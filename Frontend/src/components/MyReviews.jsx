import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const MyReviews = () => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3001/reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReviews(data.reviews || []);
        } else {
          setError(data.error || 'Failed to fetch reviews.');
        }
      } catch (err) {
        setError('Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [token]);

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div className="menu-container"><h2>Loading reviews...</h2></div>;
  if (error) return <div className="menu-container"><h2 style={{ color: 'red' }}>{error}</h2></div>;

  return (
    <div className="menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
      <h1 style={{ color: '#3b2f2f', fontWeight: 700, marginBottom: 24 }}>My Reviews</h1>
      
      {reviews.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          background: '#fffaf5', 
          borderRadius: 12, 
          boxShadow: '0 1px 6px rgba(59,47,47,0.08)' 
        }}>
          <h3 style={{ color: '#3b2f2f', marginBottom: 16 }}>No Reviews Yet</h3>
          <p style={{ color: '#666', marginBottom: 20 }}>
            You haven't submitted any reviews yet. After placing an order, you can leave feedback!
          </p>
          <button 
            onClick={() => window.history.back()} 
            style={{ 
              background: '#b8860b', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 24px', 
              fontWeight: 600, 
              fontSize: 15, 
              cursor: 'pointer' 
            }}
          >
            Go Back
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {reviews.map((review) => (
            <div key={review._id} style={{ 
              background: '#fffaf5', 
              borderRadius: 12, 
              padding: 20, 
              boxShadow: '0 1px 6px rgba(59,47,47,0.08)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ color: '#3b2f2f', marginBottom: 8 }}>Order #{review.orderId}</h3>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>
                    {renderStars(review.rating)}
                  </div>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {review.rating}/5 stars
                  </div>
                </div>
              </div>
              {review.comment && (
                <div style={{ 
                  background: '#f9f9f9', 
                  padding: 12, 
                  borderRadius: 8, 
                  marginTop: 12,
                  fontStyle: 'italic',
                  color: '#3b2f2f'
                }}>
                  "{review.comment}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews; 