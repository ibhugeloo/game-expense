import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const FREE_LIMITS = {
    maxTransactions: 50,
    multiCurrency: false,
    csvExport: false,
    budgetTracking: false,
    rawgCovers: false,
    advancedCharts: false, // genre + cumulative
};

const PREMIUM_LIMITS = {
    maxTransactions: Infinity,
    multiCurrency: true,
    csvExport: true,
    budgetTracking: true,
    rawgCovers: true,
    advancedCharts: true,
};

export function usePlan(userId) {
    const [plan, setPlan] = useState('free');
    const [loading, setLoading] = useState(true);

    const fetchPlan = async () => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('plan, expires_at')
                .eq('user_id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // No subscription row — create one with free plan
                await supabase
                    .from('subscriptions')
                    .insert({ user_id: userId, plan: 'free' });
                setPlan('free');
            } else if (data) {
                // Check if premium has expired
                if (data.plan === 'premium' && data.expires_at) {
                    const expired = new Date(data.expires_at) < new Date();
                    setPlan(expired ? 'free' : 'premium');
                } else {
                    setPlan(data.plan);
                }
            }
        } catch (err) {
            console.warn('Plan fetch error:', err);
            setPlan('free');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [userId]);

    const isPremium = plan === 'premium';
    const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

    const canAddTransaction = (currentCount) => {
        return isPremium || currentCount < FREE_LIMITS.maxTransactions;
    };

    // Manual upgrade (for admin/testing — Stripe can replace this later)
    const upgradeToPremium = async () => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .update({ plan: 'premium', started_at: new Date().toISOString() })
                .eq('user_id', userId);

            if (error) throw error;
            setPlan('premium');
            return true;
        } catch (err) {
            console.error('Upgrade error:', err);
            return false;
        }
    };

    const refreshPlan = () => fetchPlan();

    return { plan, isPremium, limits, loading, canAddTransaction, upgradeToPremium, refreshPlan };
}
