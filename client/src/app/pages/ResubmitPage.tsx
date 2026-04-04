import { useParams, useNavigate } from 'react-router';
import { API_URL } from '../config';
import { useUserContext } from '../context/UserContext';
import { useState } from 'react';

export default function ResubmitPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserContext();

  const [loading, setLoading] = useState(false);

  const handleResubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/claims/${id}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to resubmit');
      }

      alert('Resubmitted successfully');
      navigate('/my-claims');
    } catch (error: any) {
      console.error('Resubmit error:', error);
      alert(error.message || 'Could not resubmit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Resubmit Claim #{id}</h2>

      <p style={{ marginTop: 10 }}>
        You are resubmitting this claim as:
        <strong> {currentUser.fullName}</strong>
      </p>

      <p style={{ marginTop: 10 }}>
        Please ensure you have updated all required information before resubmitting.
      </p>

      <button
        onClick={handleResubmit}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: '10px 16px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Resubmitting...' : 'Confirm Resubmit'}
      </button>
    </div>
  );
}