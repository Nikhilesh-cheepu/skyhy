# Razorpay Webhooks Setup

Webhooks work in **Test Mode** and **Live Mode**. Use the same steps in the Razorpay Dashboard (switch to Test/Live as needed).

## 1. Get your webhook URL

- **Production:** `https://www.skyhy.live/api/razorpay/webhook`
- **Staging / preview:** `https://<your-preview-url>/api/razorpay/webhook`

Razorpay will send `POST` requests to this URL when events occur.

## 2. In Razorpay Dashboard

1. Log in: [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode** (toggle top-left) if you are testing.
3. Go to **Settings** (gear icon) → **Webhooks**.
4. Click **+ Add New Webhook**.
5. Fill in:
   - **Webhook URL:** `https://www.skyhy.live/api/razorpay/webhook`
   - **Active Events:** Select **Payment Captured** (`payment.captured`).
6. Save. Razorpay will show a **Secret** (e.g. `whsec_...`). Copy it once; it won’t be shown again.

## 3. Add the secret to your app

- **Vercel:** Project → Settings → Environment Variables → add:
  - Name: `RAZORPAY_WEBHOOK_SECRET`
  - Value: the secret from step 2
- **Local:** Add to `.env.local`:
  - `RAZORPAY_WEBHOOK_SECRET=whsec_...`

Redeploy (or restart dev server) after adding the variable.

## 4. What the app does when payment is captured

- Finds the **Event Booking** or **Order** linked to the Razorpay `order_id`.
- Sets **payment status** to **PAID** (so your live site shows the booking/order as confirmed).

No extra step is needed on your side for “confirm on live website”—the webhook does it automatically.

## 5. Optional: test webhooks locally

Use a tunnel (e.g. [ngrok](https://ngrok.com/)) so Razorpay can reach your machine:

```bash
ngrok http 3000
# Use the HTTPS URL: https://xxxx.ngrok.io/api/razorpay/webhook
```

Add that URL as a webhook in the dashboard (Test Mode) and use the same secret in `.env.local`.
