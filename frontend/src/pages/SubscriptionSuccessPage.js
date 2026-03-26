import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkPaymentStatus } from '../lib/api';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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
      if (res.data.payment_status === 'paid') {
        await refreshUser();
        setStatus('success');
        return;
      }
      if (res.data.status === 'expired') { setStatus('expired'); return; }
      setTimeout(() => pollPayment(sessionId, attempt + 1), 2000);
    } catch {
      setTimeout(() => pollPayment(sessionId, attempt + 1), 2000);
    }
  };

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        {status === 'polling' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-foreground mb-3">Processing Payment</h1>
            <p className="text-muted-foreground">Please wait while we confirm your subscription...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl text-foreground mb-3">Subscription Active!</h1>
            <p className="text-muted-foreground mb-8">Welcome to the platform. Start entering your scores and choose a charity.</p>
            <Button data-testid="success-dashboard-btn" onClick={() => navigate('/dashboard')} className="gold-glow px-8 py-5">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
        {(status === 'timeout' || status === 'expired' || status === 'error') && (
          <>
            <h1 className="font-serif text-3xl text-foreground mb-3">Payment Issue</h1>
            <p className="text-muted-foreground mb-8">There was an issue confirming your payment. Please contact support or try again.</p>
            <Button onClick={() => navigate('/subscription')} variant="outline" className="border-primary/30 text-primary">
              Try Again
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
