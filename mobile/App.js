import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, Platform } from 'react-native';

// *** CRITICAL NETWORKING PART ***
// We need to use the host machine's IP, not 'localhost'

// For iOS Simulator, 'localhost' works
const API_URL_IOS = 'http://localhost:3001/api/hello';

// For Android Emulator, you must use this special IP
const API_URL_ANDROID = 'http://10.0.2.2:3001/api/hello';

// Use the correct URL based on the platform
const apiUrl = Platform.OS === 'ios' ? API_URL_IOS : API_URL_ANDROID;

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => {
        console.error('Error fetching data:', error);
        setMessage('Failed to connect to server');
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>React Native Mobile App</Text>
      <Text style={styles.message}>
        Message from server: <strong>{message}</strong>
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  message: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default App;