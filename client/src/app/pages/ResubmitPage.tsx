import { useParams, useNavigate } from 'react-router';
import { API_URL } from '../config';

export default function ResubmitPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleResubmit = async () => {
    await fetch(`${API_URL}/claims/${id}/resubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 }),
    });

    alert('Resubmitted successfully');
    navigate('/my-claims');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Resubmit Claim #{id}</h2>

      <p>You can later enhance this page to allow editing.</p>

      <button onClick={handleResubmit}>Confirm Resubmit</button>
    </div>
  );
}