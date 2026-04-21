import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cancelSubscription } from '../lib/api';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.19, 1, 0.22, 1] }
  })
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const handleCancelSub = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) { 
      try {
        await cancelSubscription(); 
        await refreshUser(); 
        alert('Subscription has been cancelled.');
      } catch (err) {
        alert('Failed to cancel subscription.');
      }
    }
  };

  const subActive = user?.subscription_status === 'active';

  return (
    <div className="pt-10 pb-32 px-6 md:px-12 max-w-4xl mx-auto overflow-x-hidden">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-2">Account Settings</h1>
        <p className="text-on-surface-variant max-w-xl">Manage your subscription, account details, and tier status.</p>
      </header>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-1 gap-6">
        <motion.section variants={fadeUp} className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
          <h3 className="text-xl font-bold mb-6">Subscription & Billing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Plan</p>
              <p className="font-bold capitalize text-primary">{user?.subscription_plan || 'Free / None'}</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
              <p className={`font-bold ${subActive ? 'text-primary' : 'text-error'}`}>{subActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Renewal Date</p>
              <p className="font-bold text-on-surface">{user?.subscription_end_date ? new Date(user.subscription_end_date).toLocaleDateString() : '--'}</p>
            </div>
          </div>
          
          <div className="border-t border-outline-variant/10 pt-6">
             <h4 className="font-bold text-lg mb-2 text-white">Danger Zone</h4>
             <p className="text-xs text-on-surface-variant mb-6">Cancelling your subscription will prevent you from entering upcoming draws or assigning charity contributions.</p>
             {subActive ? (
                <button onClick={handleCancelSub} className="px-6 py-3 bg-error/10 border border-error/30 text-error rounded-xl font-bold text-sm hover:bg-error/20 transition-colors" data-testid="cancel-subscription-btn">
                  Cancel Subscription
                </button>
             ) : (
                <button disabled className="px-6 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-bold text-sm opacity-50">
                  No Active Subscription to Cancel
                </button>
             )}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
          <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
          <p className="text-sm text-on-surface-variant mb-2">Profile editing is currently managed directly through your main provider. If you need to change your associated email address or personal details, please contact system administration.</p>
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-sm"><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
            <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
