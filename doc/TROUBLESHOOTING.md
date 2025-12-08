# Troubleshooting Guide

## Backend Server

### `FirebaseAppError: Failed to parse private key`
**Symptoms**: The server crashes immediately upon startup with a `FirebaseAppError`.
**Cause**: The `FIREBASE_PRIVATE_KEY` in your `.env` file is likely formatted incorrectly. It contains newline characters (`\n`) that are not being parsed correctly if copy-pasted directly without handling.
**Solution**:
1.  Open your `.env` file.
2.  Ensure the private key is enclosed in quotes `"`.
3.  If you copied it from a JSON file, ensure the `\n` characters are literal backslashes followed by n, or use actual newlines if your environment loader supports it (standard dotenv usually prefers the single line with `\n`).

### `Error: Missing Google Maps API Key`
**Symptoms**: Route calculation requests fail with this error.
**Cause**: `GOOGLE_MAPS_API_KEY` is missing from `.env`.
**Solution**:
1.  Go to Google Cloud Console.
2.  Generate an API Key with "Distance Matrix API" enabled.
3.  Add it to `.env`.

### `Tests Failing`
**Symptoms**: `npm test` fails.
**Solution**:
- Ensure you have installed dev dependencies: `npm install`.
- Check if you have broken syntax in `app.js`.
- Tests mock the database, so real credentials are *not* required for testing, but `package.json` configurations are.
