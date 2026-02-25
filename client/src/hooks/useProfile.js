import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useProfile(userId) {
    const [profile, setProfile] = useState({ display_name: '', avatar: '🎮', default_currency: 'EUR', onboarding_completed: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (data) {
                    // Backwards compat: if column doesn't exist yet, infer from display_name
                    if (data.onboarding_completed === null || data.onboarding_completed === undefined) {
                        data.onboarding_completed = !!data.display_name;
                    }
                    setProfile(data);
                }
                // If no profile exists, we'll create it on first save via upsert
            } catch (err) {
                console.warn('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const updateProfile = async (updates) => {
        try {
            // Use upsert so it works whether the row exists or not
            const payload = {
                user_id: userId,
                ...updates,
            };

            const { data, error } = await supabase
                .from('profiles')
                .upsert(payload, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) {
                console.error('Profile upsert error:', error);
                return false;
            }
            setProfile(data);
            return true;
        } catch (err) {
            console.error('Profile upsert exception:', err);
            return false;
        }
    };

    const completeOnboarding = async (profileData) => {
        return updateProfile({
            ...profileData,
            onboarding_completed: true,
        });
    };

    return { profile, loading, updateProfile, completeOnboarding };
}
