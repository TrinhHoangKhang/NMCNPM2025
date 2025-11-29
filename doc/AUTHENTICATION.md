# Authentication — OAuth2 (Web & Mobile)

Short summary
- Recommended: use OAuth2/OpenID Connect via Auth0, Firebase Auth, or similar providers.
- For mobile apps use deep linking + backend token exchange (or PKCE) to securely deliver tokens.

Useful links
- Auth0: https://auth0.com/docs
- Firebase Auth: https://firebase.google.com/docs/auth

Table of contents
1. Overview
2. Recommended providers
3. Mobile deep-link flow (step-by-step)
4. Example snippets
5. Security notes (PKCE)
6. Questions / next steps

## 1. Overview
- Web: typical redirect-based OAuth2 flow with server-side token exchange.
- Mobile: use system browser + deep link to return token to app, or use PKCE if doing direct mobile OAuth.

## 2. Recommended providers
- Auth0 — full feature set, enterprise-ready.
- Firebase Auth — easy for Google/Facebook sign-in and mobile-first.
- Or a custom OAuth server if you need bespoke policies.

## 3. Mobile deep-link flow (concise)
1. App opens system browser to backend login endpoint:
   - Linking.openURL("https://your-server.com/auth/google/mobile")
2. User authenticates with provider (Google).
3. Provider redirects to backend callback (e.g. /auth/google/callback).
4. Backend exchanges code for profile and issues app token.
5. Backend redirects to app deep link:
   - driverapp://login-success?token=ABC...
6. OS opens the app and passes the URL. App extracts token and stores it securely.

## 4. Example snippets

Backend callback (Node/Express)
```js
// Example: src/routes/auth.js
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  const token = generateToken(req.user);
  // Redirect to mobile deep link
  res.redirect(`driverapp://login-success?token=${token}`);
});
```

React Native: open login and handle deep link
```js
// React Native (simplified)
import { Linking, useEffect } from 'react-native';

Linking.openURL("https://your-server.com/auth/google/mobile");

useEffect(() => {
  const handleDeepLink = (event) => {
    const url = event.url;
    const token = extractTokenFromUrl(url);
    if (token) {
      saveTokenSecurely(token);
      navigateToDashboard();
    }
  };
  Linking.addEventListener('url', handleDeepLink);
  return () => Linking.removeEventListener('url', handleDeepLink);
}, []);
```

## 5. Security notes
- PKCE: required for native apps if exchanging code directly from the app (no client secret stored).
- Prefer server-side token exchange when possible so client secret stays on the server.
- Use secure storage (Keychain/Keystore) on mobile for tokens.
- Validate redirect URIs and deep-link schemes.

## 6. Questions / next steps
- Do you want a sample server implementation (Express) with PKCE and mobile deep-link endpoints?
- Do you want app.json / AndroidManifest/iOS Info.plist entries for registering the deep link (driverapp://)?