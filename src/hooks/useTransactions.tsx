import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, UserSubscription } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";

export function useTransactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's transactions
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Fetch user's current subscription
  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription | null;
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ planId, paymentMethod, metadata = {} }: {
      planId: string;
      paymentMethod: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          plan_id: planId,
          payment_method: paymentMethod,
          metadata
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch transactions and subscriptions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      
      if (data.redirect_url) {
        // Open payment gateway in new tab for security
        window.open(data.redirect_url, '_blank');
      }

      toast({
        title: "Payment Initiated",
        description: "Your payment is being processed. Please complete the transaction in the new tab.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    transactionsLoading,
    transactionsError,
    currentSubscription,
    subscriptionLoading,
    subscriptionError,
    processPayment: processPaymentMutation.mutate,
    isProcessingPayment: processPaymentMutation.isPending,
  };
}