import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('purchase_date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const saveTransaction = async (transaction, editingId = null) => {
        if (editingId) {
            const { data, error } = await supabase
                .from('transactions')
                .update(transaction)
                .eq('id', editingId)
                .select()
                .single();

            if (error) throw error;
            setTransactions(prev => prev.map(t => t.id === editingId ? data : t));
        } else {
            const { data, error } = await supabase
                .from('transactions')
                .insert({ ...transaction, user_id: userId })
                .select()
                .single();

            if (error) throw error;
            setTransactions(prev => [data, ...prev]);
        }
    };

    const deleteTransaction = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    return { transactions, loading, fetchTransactions, saveTransaction, deleteTransaction };
}
