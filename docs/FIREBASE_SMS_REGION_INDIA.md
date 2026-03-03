# Firebase: Set SMS region to India only

To restrict Firebase Phone Auth SMS to India only (recommended for cost and compliance):

1. Open [Firebase Console](https://console.firebase.google.com/) and select your project.
2. In the left sidebar, go to **Build** → **Authentication**.
3. Open the **Sign-in method** tab.
4. Click **Phone** to expand it, then click **Enable** if it is not already enabled.
5. In the same **Phone** section, find **SMS regions** (or **Authorized domains** / **Phone numbers** settings).  
   - If you see **"SMS regions"** or **"Regions"**:  
     - Click **Add region** or **Edit**, then select **India (+91)** and remove other regions if listed.  
     - Save.
   - If the UI shows **"Phone numbers for testing"** only:  
     - Use **Project settings** (gear icon) → **General** → scroll to **Your apps**.  
     - For Phone Auth, the region is often tied to the project’s **Google Cloud** quota.  
6. In **Google Cloud Console** (same project):  
   - Go to [APIs & Services → Enabled APIs](https://console.cloud.google.com/apis/dashboard) and ensure **Identity Toolkit API** (Firebase Auth) is enabled.  
   - Go to **APIs & Services** → **Credentials** → select your **API key** used by Firebase.  
   - Under **Application restrictions**, you can restrict the key; under **API restrictions**, restrict to **Identity Toolkit API** if you use a dedicated key.  
7. **Identity Platform (if enabled)**  
   - In Firebase Console: **Build** → **Authentication** → **Settings** (or **Providers**).  
   - Look for **SMS** or **Phone** settings and set allowed regions to **India** only where the option exists.

Exact labels can vary by Firebase/Google Cloud UI. If you don’t see “SMS regions”, the restriction may be enforced by enabling only Indian numbers in your app logic (e.g. `+91` prefix only) and by setting **Budget alerts** in Google Cloud Billing to avoid unexpected SMS cost.
