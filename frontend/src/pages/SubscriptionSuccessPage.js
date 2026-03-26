import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkPaymentStatus } from '../lib/api';
import { MIcon } from '../components/MIcon';

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('polling');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) pollPayment(sessionId);
    else setStatus('error');
  }, []);

  const pollPayment = async (sessionId, attempt = 0) => {
    if (attempt >= 8) { setStatus('timeout'); return; }
    try {
      const res = await checkPaymentStatus(sessionId);
      if (res.data.payment_status === 'paid') { await refreshUser(); setStatus('success'); return; }
      if (res.data.status === 'expired') { setStatus('expired'); return; }
      setTimeout(() => pollPayment(sessionId, attempt + 1), 2000);
    } catch { setTimeout(() => pollPayment(sessionId, attempt + 1), 2000); }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {status === 'polling' && (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-on-surface mb-3">Processing Payment</h1>
            <p className="text-on-surface-variant">Please wait while we confirm your subscription...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <MIcon icon="check" className="text-primary" size="text-4xl" />
            </div>
            <h1 className="text-3xl font-bold text-on-surface mb-3">Subscription Active!</h1>
            <p className="text-on-surface-variant mb-8">Welcome to The Kinetic. Start entering scores and choose your charity.</p>
            <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-lg" data-testid="success-dashboard-btn">
              Go to Dashboard
            </button>
          </>
        )}
        {(status === 'timeout' || status === 'expired' || status === 'error') && (
          <>
            <MIcon icon="error" className="text-error text-5xl mx-auto mb-6" size="text-5xl" />
            <h1 className="text-3xl font-bold text-on-surface mb-3">Payment Issue</h1>
            <p className="text-on-surface-variant mb-8">There was an issue confirming your payment. Please try again.</p>
            <button onClick={() => navigate('/subscription')} className="px-8 py-4 bg-surface-container-highest text-primary font-bold rounded-xl border border-outline-variant/10">Try Again</button>
          </>
        )}
      </div>
    </div>
  );
}
