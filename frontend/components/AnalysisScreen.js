import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform, Image, TouchableOpacity } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Backend URL configuration for different platforms
  const backendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  useEffect(() => {
    if (imageUri) {
      processDocument();
    }
  }, [imageUri]);

  // Process the document (send to backend)
  const processDocument = async () => {
    if (!imageUri) {
      Alert.alert('No Document', 'Please select or take a photo of a document first.');
      return;
    }

    setLoading(true);
    setSummary('');
    setKeyPoints([]);
    setIsDemoMode(false);

    // Create FormData for file upload
    const formData = new FormData();

    // Handle different platforms for file upload
    if (Platform.OS === 'web') {
      try {
        console.log('Processing web image:', imageUri);
        const imageResponse = await fetch(imageUri);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image');
        }
        const blob = await imageResponse.blob();
        console.log('Blob created:', blob.type, blob.size);

        if (blob.size === 0) {
          throw new Error('Image file is empty or corrupted');
        }

        // Ensure we have a valid filename with extension
        const fileExtension = imageUri.split('.').pop() || 'jpg';
        const filename = `document.${fileExtension}`;

        // Ensure we have a valid file extension that backend accepts
        const validExtensions = ['png', 'jpg', 'jpeg', 'tiff', 'bmp'];
        const normalizedExtension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;

        if (!validExtensions.includes(normalizedExtension)) {
          throw new Error(`Invalid file extension: ${fileExtension}. Allowed: ${validExtensions.join(', ')}`);
        }

        // Create filename that backend will accept
        const validFilename = `document.${normalizedExtension}`;

        // Ensure proper MIME type for the backend
        const properMimeType = blob.type || (normalizedExtension === 'png' ? 'image/png' : 'image/jpeg');

        // Create a proper File object for web with correct MIME type and filename
        const file = new File([blob], validFilename, {
          type: properMimeType,
          lastModified: Date.now()
        });

        formData.append('file', file);
        console.log('FormData appended with File object:', {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: normalizedExtension,
          originalExtension: fileExtension
        });
      } catch (error) {
        console.error('Error converting image for upload:', error);
        Alert.alert('Upload Error', 'Failed to prepare image for upload. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      // For React Native mobile platforms
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpeg';

      // Validate and normalize file extension
      const validExtensions = ['png', 'jpg', 'jpeg', 'tiff', 'bmp'];
      const normalizedExtension = fileExtension === 'jpg' ? 'jpeg' : fileExtension;

      if (!validExtensions.includes(normalizedExtension)) {
        throw new Error(`Unsupported file format: ${fileExtension}. Allowed: ${validExtensions.join(', ')}`);
      }

      const mimeType = normalizedExtension === 'png' ? 'image/png' : 'image/jpeg';
      const filename = `document.${normalizedExtension}`;

      console.log('Processing mobile image:', {
        uri: imageUri,
        type: mimeType,
        name: filename,
        extension: normalizedExtension,
        originalExtension: fileExtension
      });

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      });
    }

    try {
      console.log('Connecting to BART + BERT backend at:', backendUrl);

      // First, test if the backend is reachable
      try {
        console.log('Testing backend connectivity...');
        const healthResponse = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          timeout: 5000,
        });
        console.log('Health check response:', healthResponse.status);

        if (healthResponse.ok) {
          const healthData = await healthResponse.text();
          console.log('Health check data:', healthData);
        } else {
          console.warn('Backend health check failed with status:', healthResponse.status);
          const errorText = await healthResponse.text();
          console.warn('Health check error:', errorText);
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        // This likely means the backend isn't running, so we should fail fast
        throw new Error('Backend server is not reachable. Please start the backend server first.');
      }

      console.log('FormData entries being sent to backend:');
      for (let pair of formData.entries()) {
        const [key, value] = pair;
        if (value instanceof File || value instanceof Blob) {
          console.log(`${key}:`, {
            name: value.name || 'unnamed',
            size: value.size,
            type: value.type,
            constructor: value.constructor.name,
            lastModified: value.lastModified || 'N/A'
          });
        } else if (typeof value === 'object') {
          console.log(`${key}:`, {
            uri: value.uri,
            name: value.name,
            type: value.type,
            platform: 'mobile'
          });
        } else {
          console.log(`${key}:`, value);
        }
      }

      console.log('Making request to:', `${backendUrl}/process_document`);
      console.log('Request method: POST');
      console.log('Request will include automatic multipart/form-data headers');

      const response = await fetch(`${backendUrl}/process_document`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser/fetch set it automatically with boundary
        timeout: 30000, // 30 second timeout
      });

      console.log('Response received - status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response ok:', response.ok);

      // Handle success and error without reading response body to avoid stream issues
      if (response.ok) {
        // Success case - try to parse as JSON
        try {
          const data = await response.json();
          console.log('Success response data:', data);

          setSummary(data.summary || 'No summary available.');
          setKeyPoints(data.key_points || ['No key points extracted.']);

          Alert.alert(
            '✅ Analysis Complete',
            `Document analyzed successfully using ${data.metadata?.processing_method || 'Local BART + BERT'}. Review the summary and key points below.`,
            [{ text: 'Review Results', style: 'default' }]
          );

          setLoading(false);
          return; // Exit early on success

        } catch (parseError) {
          console.error('Failed to parse success response:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        // Error case - provide basic error info without reading body to avoid stream conflicts
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          note: 'Body not read to avoid stream conflicts - check backend logs for details'
        };

        // For common HTTP errors, provide more specific messages
        if (response.status === 400) {
          errorMessage = 'Bad Request - likely file format or validation error. Check that you\'re uploading a valid image file (PNG, JPG, JPEG).';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint not found - check backend server configuration.';
        } else if (response.status === 500) {
          errorMessage = 'Internal server error - check backend logs for details.';
        }

        console.error('Backend error details:', JSON.stringify(errorDetails, null, 2));
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error processing document:', error);

      // Determine if it's a connection error or a backend error
      const isConnectionError = error.message.includes('Failed to fetch') ||
                               error.message.includes('Network request failed') ||
                               error.message.includes('ERR_CONNECTION_REFUSED') ||
                               error.message.includes('fetch');

      // Check if it's a 400 error that might be due to backend configuration
      const is400Error = error.message.includes('400') || error.message.includes('Bad Request');

      // Fallback to demo mode if backend connection fails
      console.log('Backend error detected, showing demo mode');
      setIsDemoMode(true);

      setTimeout(() => {
        if (isConnectionError || error.message.includes('not reachable')) {
          setSummary('⚠️ BACKEND NOT RUNNING: The backend server is not running on localhost:8000. To start the backend: 1) Navigate to backend folder 2) Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000 3) Make sure all dependencies are installed (pip install -r requirements.txt)');
          setKeyPoints([
            '🚀 Start backend server: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000',
            '📦 Install dependencies: cd backend && pip install -r requirements.txt',
            '🌐 Verify backend URL: http://localhost:8000/health should return {"status": "healthy"}',
            '🔧 Check Python environment: Make sure Python 3.8+ is installed',
            '📋 Alternative: Use node backend/mock-server.js for testing',
            '⚠️ This is demo mode - start backend for real AI analysis'
          ]);
        } else if (is400Error) {
          setSummary('⚠️ DEMO MODE: Since the backend is not properly configured or has validation issues, showing demo analysis instead. This legal document contains standard terms and conditions with key clauses around service delivery, payment terms, and liability limitations. Please review all sections carefully before signing.');
          setKeyPoints([
            '📋 Service Agreement: 12-month term with automatic renewal clause',
            '💰 Payment Terms: Net 30 days with late payment penalties',
            '⚖️ Liability Limitation: Damages limited to contract value',
            '🔚 Termination: Either party may terminate with 30 days notice',
            '🔒 Confidentiality: Non-disclosure obligations survive termination',
            '🏛️ Dispute Resolution: Binding arbitration required for conflicts',
            '⚠️ Demo content - start backend server for real AI analysis'
          ]);
        } else {
          setSummary(`⚠️ BACKEND ERROR: ${error.message}. This might be due to invalid file format, server configuration, or API issues. Please check the backend logs for more details.`);
          setKeyPoints([
            '📄 Ensure image is a valid format (PNG, JPG, JPEG)',
            '🔍 Check backend logs for detailed error information',
            '🌐 Verify backend URL configuration and CORS settings',
            '🔧 Check if all required dependencies are installed',
            '⚠️ This is demo mode - fix backend issues for real analysis'
          ]);
        }

        Alert.alert(
          isConnectionError ? '🚫 Backend Not Running' : is400Error ? '📋 Demo Mode' : '⚠️ Backend Error',
          isConnectionError
            ? 'The backend server is not running. Please start it and try again.'
            : is400Error
            ? 'Backend validation failed. Showing demo analysis instead.'
            : 'There was an error processing your document. Check the summary for details.',
          [{ text: 'OK', style: 'default' }]
        );
        setLoading(false);
      }, 1000);

      return;
    }
    setLoading(false);
  };

  const analyzeAnother = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>

      {isDemoMode && (
        <View style={styles.demoIndicator}>
          <Text style={styles.demoText}>⚠️ Demo Mode - Backend Offline</Text>
        </View>
      )}

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.label}>Analyzed Document:</Text>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Analyzing document...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      )}

      {!loading && (summary || keyPoints.length > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>📄 Document Summary</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{summary || 'No summary available.'}</Text>
          </View>

          <Text style={styles.sectionTitle}>🔍 Key Points</Text>
          {keyPoints.length > 0 ? (
            keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPointItem}>
                <Text style={styles.keyPointBullet}>•</Text>
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))
          ) : (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>No crucial points identified.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.analyzeButton} onPress={analyzeAnother}>
            <Text style={styles.analyzeButtonText}>Analyze Another Document</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F7F4',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  demoIndicator: {
    backgroundColor: '#ff9800',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  imagePreview: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  resultsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  keyPointItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyPointBullet: {
    fontSize: 18,
    color: '#007bff',
    marginRight: 10,
    fontWeight: 'bold',
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  analyzeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
