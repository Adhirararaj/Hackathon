import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

interface QueryResponse {
  success: boolean;
  query?: {
    shortAnswer: string;
    longAnswer: string;
  };
  message: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'document'>('text');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // API base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleVoiceSubmit(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  } as any);

  // API call functions
  const handleVoiceSubmit = async (audioBlob: Blob) => {
    await submitQuery({ voiceData: audioBlob });
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text');
      return;
    }
    await submitQuery({ text: textInput });
  };

  const handleDocumentSubmit = async () => {
    if (!uploadedFile) {
      setError('Please upload a document');
      return;
    }
    await submitQuery({ document: uploadedFile });
  };

  const submitQuery = async (data: { voiceData?: Blob; text?: string; document?: File }) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const token = localStorage.getItem('token');
      let extractedText = '';

      // API 1: Speech-to-text conversion
      if (data.voiceData || data.text) {
        const formData1 = new FormData();
        
        if (data.voiceData) {
          formData1.append('voiceData', data.voiceData, 'recording.wav');
        }
        if (data.text) {
          formData1.append('text', data.text);
        }

        console.log('Calling API 1: Speech-to-text conversion...');
        const response1 = await axios.post(`${API_BASE_URL}/query/speech-to-text`, formData1, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response1.data.success) {
          extractedText = response1.data.extractedText;
          console.log('API 1 Response - Extracted Text:', extractedText);
        } else {
          throw new Error(response1.data.message || 'Failed to extract text');
        }
      }

      // API 2: Answer generation (if we have extracted text or document)
      if (extractedText || data.document) {
        const formData2 = new FormData();
        
        if (extractedText) {
          formData2.append('text', extractedText);
        }
        if (data.document) {
          formData2.append('pdfUrl', data.document);
        }

        console.log('Calling API 2: Answer generation...');
        const response2 = await axios.post(`${API_BASE_URL}/query/generate-answer`, formData2, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response2.data.success) {
          setResponse(response2.data);
          console.log('API 2 Response:', response2.data);
        } else {
          throw new Error(response2.data.message || 'Failed to generate answer');
        }
      } else {
        throw new Error('No text or document provided for processing');
      }

    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
    setTextInput('');
    setUploadedFile(null);
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-title">AI Banking Assistant</div>
        <p className="subtitle">Ask questions about banking services using voice, text, or upload documents</p>

        {/* Tab Navigation */}
        <div className="tab-container">
          <button 
            className={`tab ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            🎤 Voice
          </button>
          <button 
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            ✏️ Text
          </button>
          <button 
            className={`tab ${activeTab === 'document' ? 'active' : ''}`}
            onClick={() => setActiveTab('document')}
          >
            📄 Document
          </button>
        </div>

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="input-section">
            <div className="voice-controls">
              {!isRecording ? (
                <button 
                  className="record-btn"
                  onClick={startRecording}
                  disabled={isLoading}
                >
                  🎤 Start Recording
                </button>
              ) : (
                <button 
                  className="stop-btn"
                  onClick={stopRecording}
                >
                  ⏹️ Stop Recording
                </button>
              )}
            </div>
            <p className="help-text">
              Click "Start Recording" to begin voice input. Click "Stop Recording" when finished.
            </p>
          </div>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="input-section">
            <textarea
              className="text-input"
              placeholder="Type your banking question here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
            <button 
              className="submit-btn"
              onClick={handleTextSubmit}
              disabled={isLoading || !textInput.trim()}
            >
              {isLoading ? 'Processing...' : 'Submit Question'}
            </button>
          </div>
        )}

        {/* Document Tab */}
        {activeTab === 'document' && (
          <div className="input-section">
            <div 
              {...getRootProps()} 
              className={`dropzone ${isDragActive ? 'active' : ''} ${uploadedFile ? 'has-file' : ''}`}
            >
              <input {...getInputProps()} type="file" />
              {uploadedFile ? (
                <div className="file-info">
                  <p>📄 {uploadedFile.name}</p>
                  <button 
                    className="remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="dropzone-content">
                  <p>{isDragActive ? 'Drop the file here' : 'Drag & drop a document here, or click to select'}</p>
                  <p className="file-types">Supported: PDF, DOC, DOCX, TXT</p>
                </div>
              )}
            </div>
            {uploadedFile && (
              <button 
                className="submit-btn"
                onClick={handleDocumentSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Submit Document'}
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your request...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error">
            <p>❌ {error}</p>
            <button className="clear-btn" onClick={clearResponse}>
              Clear
            </button>
          </div>
        )}

        {/* Response Display */}
        {response && response.success && (
          <div className="response">
            <div className="response-header">
              <h3>Response</h3>
              <button className="clear-btn" onClick={clearResponse}>
                Clear
              </button>
            </div>
            
            <div className="response-content">
              <div className="short-answer">
                <h4>Short Answer</h4>
                <p>{response.query?.shortAnswer}</p>
              </div>
              
              <div className="long-answer">
                <h4>Detailed Answer</h4>
                <p>{response.query?.longAnswer}</p>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}


