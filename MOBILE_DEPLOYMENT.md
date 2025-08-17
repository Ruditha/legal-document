# 📱 Mobile Deployment Guide

## Building the App for Your Phone

### Option 1: EAS Build (Recommended)

1. **Install EAS CLI**
```bash
npm install -g @expo/eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure Your Project**
```bash
cd frontend
eas build:configure
```

4. **Build APK for Android**
```bash
eas build --platform android --profile preview
```

5. **Build for iOS** (requires Apple Developer account)
```bash
eas build --platform ios --profile preview
```

### Option 2: Local Build

**For Android:**
```bash
cd frontend
expo run:android
```

**For iOS:**
```bash
cd frontend
expo run:ios
```

## ⚠️ Important: Backend Configuration for Real Devices

### 1. Update Backend URL
Before building, update the backend URL in `frontend/components/AnalysisScreen.js`:

```javascript
// Replace with your actual server IP or domain
const backendUrl = 'http://YOUR_SERVER_IP:8000';
// or for production: 'https://yourdomain.com'
```

### 2. Find Your Server IP
```bash
# On Windows:
ipconfig

# On Mac/Linux:
ifconfig
# Look for your local network IP (usually 192.168.x.x)
```

### 3. Update Backend CORS
In `backend/.env`, add your mobile app's access:
```env
ALLOWED_ORIGINS=http://localhost:19009,http://YOUR_SERVER_IP:8000
```

### 4. Start Backend on Network
```bash
cd backend
python main.py
# Backend will be accessible at http://YOUR_SERVER_IP:8000
```

## Testing on Real Device

1. **Install the built APK** on your Android device
2. **Ensure your phone is on the same WiFi** as your backend server
3. **Test the backend connection** by opening a browser on your phone and navigating to `http://YOUR_SERVER_IP:8000/health`
4. **If successful**, the app should work normally

## Production Deployment

For production use:
1. Deploy backend to a cloud service (AWS, Google Cloud, etc.)
2. Use HTTPS with proper SSL certificates
3. Update the frontend backend URL to your production domain
4. Build and distribute through app stores

## Troubleshooting

- **"Failed to fetch"**: Check backend URL and ensure phone can reach server
- **CORS errors**: Add your IP to ALLOWED_ORIGINS in backend/.env
- **Build failures**: Ensure all dependencies are installed and EAS is configured
