import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { postCreateRazorpayOrder, postVerifyRazorpaySignature } from '../api/paymentApi';
import { CreditCard, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { boolIsLoggedInState, strTokenState, objUserState } = useAuth();
  
  const [strAmount, setStrAmount] = useState('500');
  const [boolIsLoading, setBoolIsLoading] = useState(false);
  const [strErrorMsg, setStrErrorMsg] = useState('');
  const [boolIsSuccess, setBoolIsSuccess] = useState(false);
  const [strSuccessOrderId, setStrSuccessOrderId] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setStrErrorMsg('');
    
    if (!boolIsLoggedInState || !strTokenState) {
      setStrErrorMsg('You must be logged in to make a payment.');
      return;
    }

    const numAmount = parseFloat(strAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStrErrorMsg('Please enter a valid amount.');
      return;
    }

    setBoolIsLoading(true);

    try {
      // 1. Create order on backend
      const dictOrderResponse = await postCreateRazorpayOrder(numAmount, strTokenState);
      
      const options = {
        key: dictOrderResponse.strKeyId, // Enter the Key ID generated from the Dashboard
        amount: dictOrderResponse.numAmount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Synapse Live Exchange",
        description: "Test Transaction",
        order_id: dictOrderResponse.strOrderId, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: async function (response) {
          try {
            // 2. Verify signature on backend
            await postVerifyRazorpaySignature(response, strTokenState);
            setBoolIsSuccess(true);
            setStrSuccessOrderId(response.razorpay_order_id);
          } catch (verifyError) {
            setStrErrorMsg(verifyError.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: objUserState?.username || "Guest",
          email: objUserState?.email || "guest@example.com",
          contact: "9999999999" // Dummy contact
        },
        notes: {
          address: "Synapse Corporate Office"
        },
        theme: {
          color: "#8b5cf6" // Match our brand accent
        }
      };
      
      // Open Razorpay Checkout
      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
        setStrErrorMsg(`Payment Failed: ${response.error.description}`);
      });
      
      rzp1.open();

    } catch (err) {
      setStrErrorMsg(err.message || 'Failed to initiate checkout.');
    } finally {
      setBoolIsLoading(false);
    }
  };

  if (boolIsSuccess) {
    return (
      <div className="checkout-page">
        <div className="checkout-card success-card">
          <div className="success-icon-wrapper">
            <CheckCircle size={64} color="#34d399" />
          </div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase.</p>
          <div className="order-details">
            <span>Order ID:</span>
            <strong>{strSuccessOrderId}</strong>
          </div>
          <button className="checkout-btn" onClick={() => window.location.href = '/'}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <div className="checkout-header">
          <div className="checkout-icon">
            <CreditCard size={32} />
          </div>
          <h2>Secure Checkout</h2>
          <p>Powered by Razorpay</p>
        </div>

        {!boolIsLoggedInState ? (
          <div className="checkout-alert">
            <AlertCircle size={20} />
            <span>Please log in using the navigation bar to proceed with checkout.</span>
          </div>
        ) : (
          <form className="checkout-form" onSubmit={handlePayment}>
            {strErrorMsg && (
              <div className="checkout-error">
                <AlertCircle size={16} />
                <span>{strErrorMsg}</span>
              </div>
            )}
            
            <div className="input-group">
              <label>Amount (INR)</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  value={strAmount}
                  onChange={(e) => setStrAmount(e.target.value)}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{strAmount || '0'}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>₹0</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{strAmount || '0'}</span>
              </div>
            </div>

            <button type="submit" className="checkout-btn" disabled={boolIsLoading || !strAmount}>
              {boolIsLoading ? 'Processing...' : `Pay ₹${strAmount || '0'}`}
            </button>
            
            <div className="checkout-trust">
              <ShieldCheck size={16} />
              <span>256-bit SSL encrypted secure transaction</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

