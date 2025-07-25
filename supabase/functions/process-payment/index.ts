import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYMENT] ${step}${detailsStr}`);
};

// Mock payment providers for demo
const PAYMENT_PROVIDERS = {
  'credit-card': 'Secure Card Payment Gateway',
  'bank-transfer': 'Bank Transfer System',
  'mobile-payment': 'Mobile Payment Gateway'
};

// Plan pricing (should match your plans.ts)
const PLAN_PRICING = {
  'free': 0,
  'pro': 1500,
  'ultimate': 5000
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role for secure operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get and validate request body
    const body = await req.json();
    const { plan_id, payment_method, metadata = {} } = body;

    if (!plan_id || !payment_method) {
      throw new Error("Missing required fields: plan_id and payment_method");
    }

    logStep("Request validated", { plan_id, payment_method });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Validate plan and get pricing
    const amount = PLAN_PRICING[plan_id as keyof typeof PLAN_PRICING];
    if (amount === undefined) {
      throw new Error(`Invalid plan_id: ${plan_id}`);
    }

    // Free plan doesn't require payment processing
    if (amount === 0) {
      logStep("Processing free plan upgrade");
      
      // Update user profile directly for free plan
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ plan_type: plan_id })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      // Create a completed transaction record for free plan
      const { data: transaction, error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: user.id,
          plan_id,
          amount: 0,
          currency: 'NPR',
          status: 'completed',
          payment_method: 'free',
          payment_provider: 'internal',
          completed_at: new Date().toISOString(),
          metadata: { ...metadata, free_plan: true }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create subscription record
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id,
          transaction_id: transaction.id,
          status: 'active',
          activated_at: new Date().toISOString()
        });

      if (subscriptionError) throw subscriptionError;

      logStep("Free plan upgrade completed", { transactionId: transaction.id });

      return new Response(JSON.stringify({
        transaction_id: transaction.id,
        status: 'completed',
        message: 'Successfully upgraded to free plan'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For paid plans, create pending transaction first
    logStep("Creating transaction record", { amount, plan_id });

    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        plan_id,
        amount,
        currency: 'NPR',
        status: 'pending',
        payment_method,
        payment_provider: PAYMENT_PROVIDERS[payment_method as keyof typeof PAYMENT_PROVIDERS] || payment_method,
        metadata: {
          ...metadata,
          user_email: user.email,
          initiated_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (transactionError) throw transactionError;
    logStep("Transaction record created", { transactionId: transaction.id });

    // Simulate secure payment processing
    logStep("Processing payment with provider", { provider: payment_method });
    
    // Update transaction to processing
    await supabaseClient
      .from('transactions')
      .update({ 
        status: 'processing',
        transaction_reference: `TXN-${Date.now()}-${transaction.id.slice(-8)}`,
        encrypted_payment_data: {
          provider_response: 'Processing',
          processing_started_at: new Date().toISOString()
        }
      })
      .eq('id', transaction.id);

    // Simulate payment gateway delay and processing
    setTimeout(async () => {
      try {
        logStep("Completing payment simulation", { transactionId: transaction.id });
        
        // Simulate successful payment (90% success rate for demo)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          // Complete the transaction
          await supabaseClient
            .from('transactions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              encrypted_payment_data: {
                provider_response: 'Payment Successful',
                confirmation_code: `CONF-${Date.now()}`,
                completed_at: new Date().toISOString()
              }
            })
            .eq('id', transaction.id);

          // Update user's plan
          await supabaseClient
            .from('profiles')
            .update({ plan_type: plan_id })
            .eq('id', user.id);

          // Deactivate previous subscriptions
          await supabaseClient
            .from('user_subscriptions')
            .update({ status: 'cancelled' })
            .eq('user_id', user.id)
            .eq('status', 'active');

          // Create new subscription
          await supabaseClient
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              plan_id,
              transaction_id: transaction.id,
              status: 'active',
              activated_at: new Date().toISOString()
            });

          logStep("Payment completed successfully", { transactionId: transaction.id });
        } else {
          // Simulate payment failure
          await supabaseClient
            .from('transactions')
            .update({
              status: 'failed',
              failed_reason: 'Payment gateway declined the transaction',
              encrypted_payment_data: {
                provider_response: 'Payment Failed',
                error_code: 'PAYMENT_DECLINED',
                failed_at: new Date().toISOString()
              }
            })
            .eq('id', transaction.id);

          logStep("Payment simulation failed", { transactionId: transaction.id });
        }
      } catch (error) {
        logStep("Error in payment completion", { error: error.message });
      }
    }, 3000); // 3 second delay to simulate real payment processing

    // Create mock payment URL for demo purposes
    const mockPaymentUrl = `${req.headers.get("origin")}/payment-gateway?transaction=${transaction.id}&amount=${amount}&method=${payment_method}`;

    logStep("Payment processing initiated", { 
      transactionId: transaction.id, 
      redirectUrl: mockPaymentUrl 
    });

    return new Response(JSON.stringify({
      transaction_id: transaction.id,
      status: 'processing',
      redirect_url: mockPaymentUrl,
      message: 'Payment processing initiated. Please complete the payment in the new tab.'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      transaction_id: null,
      status: 'failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});