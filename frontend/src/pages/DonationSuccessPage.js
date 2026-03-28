import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkDonationStatus } from '../lib/api';
import { MIcon } from '../components/MIcon';
import { motion } from 'framer-motion';

export default function DonationSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    const check = async () => {
      try {
        const res = await checkDonationStatus(sessionId);
        setStatus(res.data.status === 'complete' ? 'success' : 'pending');
      } catch { setStatus('error'); }
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        className="max-w-lg w-full text-center"
      >
        {status === 'checking' && (
          <div className="p-12 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <MIcon icon="hourglass_top" className="text-primary" size="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verifying Donation...</h2>
            <p className="text-on-surface-variant">Please wait while we confirm your payment.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="p-12 rounded-[2.5rem] bg-surface-container-low border border-primary/20">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <MIcon icon="favorite" className="text-primary" size="text-4xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-on-surface-variant mb-8">Your generous donation has been received. Together, we're making a real difference.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/charities')} className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-all" data-testid="back-to-charities-btn">
                Back to Charities
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-surface-container-highest text-primary font-bold rounded-xl hover:bg-surface-bright transition-colors" data-testid="go-dashboard-btn">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
        {status === 'pending' && (
          <div className="p-12 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10">
            <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <MIcon icon="schedule" className="text-tertiary" size="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Processing</h2>
            <p className="text-on-surface-variant">Your donation is still being processed. This page will update automatically.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="p-12 rounded-[2.5rem] bg-surface-container-low border border-error/20">
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-6">
              <MIcon icon="error" className="text-error" size="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
            <p className="text-on-surface-variant mb-6">We couldn't verify your donation. Please try again or contact support.</p>
            <button onClick={() => navigate('/charities')} className="px-8 py-3 bg-surface-container-highest text-primary font-bold rounded-xl" data-testid="error-back-btn">
              Back to Charities
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
