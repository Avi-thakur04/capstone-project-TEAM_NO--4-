import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  RadialBarChart, RadialBar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Mic, FileText, Briefcase, BarChart2, CheckCircle, XCircle, Brain, Star, Wind, TrendingUp,
  Loader2, ServerCrash, User, MessageSquare, Play, StopCircle, RefreshCw
} from 'lucide-react';

// --- Configuration ---
const API_URL = 'http://localhost:5001';

// const API_URL = 'http://localhost:5002';
// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('upload'); // upload, report, setup, interview, final_report
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetApp = () => {
    setSessionData(null);
    setError(null);
    setLoading(false);
    setView('upload');
  };

  const renderView = () => {
    switch (view) {
      case 'upload':
        return (
          <UploadView
            setSessionData={setSessionData}
            setView={setView}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
          />
        );
      case 'report':
        return (
          <ReportView
            sessionData={sessionData}
            setView={setView}
          />
        );
      case 'setup':
        return (
          <SetupView
            sessionData={sessionData}
            setSessionData={setSessionData}
            setView={setView}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
          />
        );
      case 'interview':
        return (
          <InterviewView
            sessionData={sessionData}
            setSessionData={setSessionData}
            setView={setView}
            setError={setError}
          />
        );
      case 'final_report':
        return (
          <FinalReportView
            sessionData={sessionData}
            resetApp={resetApp}
          />
        );
      default:
        return <UploadView setSessionData={setSessionData} setView={setView} setLoading={setLoading} setError={setError} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {error && <ErrorMessage message={error} clearError={() => setError(null)} />}
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

// --- Header & Footer Components ---
const Header = () => (
  <header className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Brain className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">AI Interview Engine</h1>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="text-center p-4 text-sm text-gray-500">
    © {new Date().getFullYear()} AI Interview Intelligence Engine
  </footer>
);

// --- View 1: Upload ---
const UploadView = ({ setSessionData, setView, setLoading, setError, loading }) => {
  const [jd, setJd] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jd || !resumeFile) {
      setError('Please provide both a job description and a resume PDF.');
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('jd', jd);
    formData.append('resume', resumeFile);

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSessionData({
        session_id: response.data.session_id,
        analysis: response.data.analysis,
      });
      setView('report');
    } catch (err) {
      setError('Failed to analyze. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Get Started</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            id="jd"
            rows="10"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
            Resume (PDF)
          </label>
          <input
            id="resume"
            type="file"
            accept=".pdf"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => setResumeFile(e.target.files[0])}
            disabled={loading}
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- View 2: Report ---
const ReportView = ({ sessionData, setView }) => {
  const { analysis } = sessionData;
  const matchScoreData = [{ name: 'Match', value: analysis['Match Score'] }];

  const skillAnalysis = analysis['Skill Analysis'];
  const skillData = [
    {
      name: 'Skills Overview',
      'JD Skills': skillAnalysis['JD Skills'].length,
      'Matched': skillAnalysis['Matched Skills'].length,
      'Missing': skillAnalysis['Missing Skills'].length,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Analysis Report</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCard title="Match Score" icon={<Star className="text-yellow-500" />}>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="80%"
                outerRadius="100%"
                barSize={20}
                data={matchScoreData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  label={{
                    position: 'center',
                    fill: '#1f2937',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    formatter: (value) => `${value}%`
                  }}
                  background
                  clockWise
                  dataKey="value"
                  fill="#4f46e5"
                />
                <text x="50%" y="50%" textAnchor="middle" dy="-10px" fontSize="24px" fontWeight="bold" fill="#1f2937">
                  {analysis['Match Score']}%
                </text>
                <text x="50%" y="50%" textAnchor="middle" dy="20px" fill="#6b7280">
                  Match
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>

        <InfoCard title="S-BERT Similarity" icon={<Brain className="text-blue-500" />}>
          <div className="flex items-center justify-center h-60">
            <h3 className="text-6xl font-bold text-gray-800">{analysis['S-BERT Similarity']}</h3>
          </div>
        </InfoCard>

        <InfoCard title="Experience Fit" icon={<Briefcase className="text-green-500" />}>
          <div className="flex flex-col items-center justify-center h-60 space-y-4">
            <h3 className="text-3xl font-bold text-gray-800">{analysis['Experience Fit'].fit_status}</h3>
            <p className="text-sm text-gray-600 px-4 text-center">{analysis['Experience Fit'].explanation}</p>
          </div>
        </InfoCard>
      </div>

      <InfoCard title="Skill Analysis" icon={<BarChart2 className="text-purple-500" />}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip />
              <Legend />
              <Bar dataKey="JD Skills" stackId="a" fill="#a5b4fc" name="Total JD Skills" />
              <Bar dataKey="Matched" stackId="a" fill="#4f46e5" name="Matched Skills" />
              <Bar dataKey="Missing" stackId="a" fill="#ef4444" name="Missing Skills" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </InfoCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Matched Skills" icon={<CheckCircle className="text-green-600" />}>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {skillAnalysis['Matched Skills'].map((skill, i) => (
              <li key={i} className="text-sm text-gray-700">{skill}</li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard title="Missing Skills" icon={<XCircle className="text-red-600" />}>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {skillAnalysis['Missing Skills'].map((skill, i) => (
              <li key={i} className="text-sm text-gray-700">{skill}</li>
            ))}
          </ul>
        </InfoCard>
      </div>

      <InfoCard title="Summary" icon={<MessageSquare className="text-gray-500" />}>
        <p className="text-gray-700">{analysis.Summary}</p>
      </InfoCard>

      <InfoCard title="Recommendations" icon={<TrendingUp className="text-indigo-500" />}>
        <p className="text-gray-700">{analysis.Recommendations}</p>
      </InfoCard>

      <div className="text-center pt-4">
        <button
          onClick={() => setView('setup')}
          className="py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Would you like to continue to the interview?
        </button>
      </div>
    </div>
  );
};

// --- View 3: Setup ---
const SetupView = ({ sessionData, setSessionData, setView, setLoading, setError, loading }) => {
  const { analysis, session_id } = sessionData;
  const [duration, setDuration] = useState(15);
  const [jobRole, setJobRole] = useState('Senior Data Scientist');
  const [expLevel, setExpLevel] = useState(analysis['Experience Fit'].fit_status || 'Senior');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      session_id,
      duration,
      job_role: jobRole,
      experience_level: expLevel,
    };

    try {
      const response = await axios.post(`${API_URL}/start-interview`, payload);
      setSessionData({
        ...sessionData,
        firstQuestion: response.data.text_question,
        firstAudio: response.data.audio_data,
        firstMimeType: response.data.mime_type,
      });
      setView('interview');
    } catch (err) {
      setError('Failed to start interview. ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Interview Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Preferred Duration
          </label>
          <select
            id="duration"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={loading}
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </div>
        <div>
          <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700">
            Confirm Job Role
          </label>
          <input
            id="jobRole"
            type="text"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="expLevel" className="block text-sm font-medium text-gray-700">
            Confirm Experience Level
          </label>
          <input
            id="expLevel"
            type="text"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={expLevel}
            onChange={(e) => setExpLevel(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Start Interview'}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- View 4: Interview (5 SECOND SILENCE TIMEOUT) ---
const InterviewView = ({ sessionData, setSessionData, setView, setError }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [interviewStatus, setInterviewStatus] = useState('IDLE'); // IDLE, SPEAKING, LISTENING, PROCESSING
  const [isEnding, setIsEnding] = useState(false);

  const speechRecognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const chatContainerRef = useRef(null);

  // New refs for 5-second silence logic
  const silenceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef("");

  const onResultRef = useRef();
  const onErrorRef = useRef();
  const onEndRef = useRef();

  // --- Audio Helper Functions ---
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const playPcmAudio = useCallback(async (base64Data, mimeType) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;

      const pcmData = new Int16Array(base64ToArrayBuffer(base64Data));

      if (pcmData.length === 0) {
        console.warn("Received empty audio buffer.");
        return null;
      }

      const audioBuffer = audioContext.createBuffer(1, pcmData.length, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < pcmData.length; i++) {
        channelData[i] = pcmData[i] / 32768.0;
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      return source;
    } catch (err) {
      console.error("Failed to play audio:", err);
      setError("Audio error. Please click 'Start' to enable audio.");
      setInterviewStatus('IDLE');
      return null;
    }
  }, [setError]);

  const startSpeaking = useCallback(async (audioData, mimeType, onEnded) => {
    setInterviewStatus('SPEAKING');
    const source = await playPcmAudio(audioData, mimeType);
    if (source) {
      source.onended = onEnded;
    } else {
      console.warn("Skipping playback (source is null).");
      onEnded();
    }
  }, [playPcmAudio]);


  const handleEndInterview = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);
    setInterviewStatus('PROCESSING');
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.abort(); // Force stop
    }

    try {
      const response = await axios.post(`${API_URL}/end-interview`, { session_id: sessionData.session_id });
      setSessionData({ ...sessionData, finalReport: response.data });
      setView('final_report');
    } catch (err) {
      setError('Failed to end interview. ' + (err.response?.data?.error || err.message));
      setIsEnding(false);
      setInterviewStatus('IDLE');
    }
  }, [isEnding, sessionData, setSessionData, setError, setView]);

  // --- STT Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();

    // --- 5 SEC PAUSE CONFIGURATION ---
    recognition.continuous = true; // IMPORTANT: Don't stop automatically
    recognition.interimResults = true; // IMPORTANT: Get partial results to reset timer
    recognition.lang = 'en-US';

    // Attach proxy handlers
    recognition.onresult = (event) => onResultRef.current(event);
    recognition.onerror = (event) => onErrorRef.current(event);
    recognition.onend = () => onEndRef.current();

    speechRecognitionRef.current = recognition;

    // Set first message
    const { firstQuestion } = sessionData;
    setChatHistory([{ speaker: 'AI', text: firstQuestion }]);

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- SUBMISSION LOGIC ---
  const submitAnswer = useCallback(async (transcript) => {
    if (!transcript.trim()) return; // Don't submit empty

    setInterviewStatus('PROCESSING');
    setChatHistory(prev => [...prev, { speaker: 'User', text: transcript }]);

    // Clear buffer for next turn
    accumulatedTranscriptRef.current = "";

    try {
      const payload = { session_id: sessionData.session_id, answer: transcript };
      const response = await axios.post(`${API_URL}/next-question`, payload);
      const { text_question, audio_data, mime_type } = response.data;

      setChatHistory(prev => [...prev, { speaker: 'AI', text: text_question }]);
      startSpeaking(audio_data, mime_type, () => setInterviewStatus('LISTENING'));
    } catch (err) {
      const errorMsg = 'Error processing your answer. ' + (err.response?.data?.error || err.message);
      setError(errorMsg);
      setChatHistory(prev => [...prev, { speaker: 'AI', text: "I'm sorry, I had a technical issue. Please say that again." }]);
      setInterviewStatus('LISTENING');
    }
  }, [sessionData.session_id, startSpeaking, setError]);


  // --- Logic Loop ---
  const handleResult = useCallback((event) => {
    // 1. Clear existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // 2. Build current transcript from all results
    let currentTranscript = "";
    for (let i = 0; i < event.results.length; i++) {
      currentTranscript += event.results[i][0].transcript;
    }
    accumulatedTranscriptRef.current = currentTranscript;

    // 3. Set NEW 5-second timer
    silenceTimerRef.current = setTimeout(() => {
      // Silence detected! Stop mic and submit.
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      submitAnswer(accumulatedTranscriptRef.current);
    }, 5000); // 5000ms = 5 seconds

  }, [submitAnswer]);

  const handleError = useCallback((event) => {
    // Ignore 'no-speech' error if we are just waiting for the user to start talking
    if (event.error === 'no-speech') {
      return;
    }
    console.error('Speech recognition error', event.error);
    if (event.error !== 'aborted') {
      setError('Speech recognition error: ' + event.error);
    }
    setInterviewStatus('IDLE');
  }, [setError]);

  const handleEnd = useCallback(() => {
    // If the browser stops by itself (not by our timer), and we haven't submitted yet
    if (interviewStatus === 'LISTENING') {
      // If we have text, assume they are done and submit
      if (accumulatedTranscriptRef.current.trim().length > 0) {
        submitAnswer(accumulatedTranscriptRef.current);
      } else {
        // No text, just silence/timeout
        setInterviewStatus('IDLE');
      }
    }
  }, [interviewStatus, submitAnswer]);

  // Update refs
  useEffect(() => {
    onResultRef.current = handleResult;
    onErrorRef.current = handleError;
    onEndRef.current = handleEnd;
  }, [handleResult, handleError, handleEnd]);


  // Start Mic
  useEffect(() => {
    if (interviewStatus === 'LISTENING') {
      try {
        // Reset buffer
        accumulatedTranscriptRef.current = "";
        speechRecognitionRef.current.start();
      } catch (e) {
        console.log("STT start error (likely already running):", e.message);
      }
    }
  }, [interviewStatus]);


  const handleStartInterviewClick = () => {
    const { firstAudio, firstMimeType } = sessionData;
    startSpeaking(firstAudio, firstMimeType, () => setInterviewStatus('LISTENING'));
  };

  const handleManualStop = () => {
    // User clicked stop. Cancel timer and submit immediately.
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (speechRecognitionRef.current) speechRecognitionRef.current.stop();

    const text = accumulatedTranscriptRef.current;
    if (text.trim()) {
      submitAnswer(text);
    } else {
      setInterviewStatus('IDLE');
    }
  };

  // Scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Interview in Progress</h2>

      {/* Chat History */}
      <div ref={chatContainerRef} className="h-96 w-full bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-auto mb-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${msg.speaker === 'AI' ? 'bg-indigo-100 text-gray-800' : 'bg-blue-500 text-white'}`}>
              <div className="flex items-center space-x-2 mb-1">
                {msg.speaker === 'AI' ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
                <span className="font-semibold text-sm">{msg.speaker === 'AI' ? 'Interviewer' : 'You'}</span>
              </div>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status & Controls */}
      <div className="flex flex-col items-center space-y-4">

        {interviewStatus === 'IDLE' && chatHistory.length === 1 && (
          <button
            onClick={handleStartInterviewClick}
            className="w-full max-w-xs flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Play className="w-5 h-5" />
            <span>Click to Start Interview</span>
          </button>
        )}

        {!(interviewStatus === 'IDLE' && chatHistory.length === 1) && (
          <InterviewStatusIndicator status={interviewStatus} />
        )}

        <button
          onClick={() => {
            if (interviewStatus === 'LISTENING') {
              handleManualStop();
            } else if (interviewStatus === 'IDLE') {
              setInterviewStatus('LISTENING');
            }
          }}
          disabled={interviewStatus === 'SPEAKING' || interviewStatus === 'PROCESSING' || isEnding}
          className={`relative w-20 h-20 flex items-center justify-center rounded-full text-white ${interviewStatus === 'LISTENING' ? 'bg-red-500 hover:bg-red-600' :
              interviewStatus === 'IDLE' ? 'bg-green-500 hover:bg-green-600' :
                'bg-gray-400 cursor-not-allowed'
            } transition-all duration-300 ${(interviewStatus === 'IDLE' && chatHistory.length === 1) ? 'hidden' : 'flex'
            }`}
        >
          {interviewStatus === 'LISTENING' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
          <Mic className="w-10 h-10" />
        </button>

        <button
          onClick={handleEndInterview}
          disabled={isEnding || interviewStatus === 'PROCESSING'}
          className="w-full max-w-xs flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
        >
          {isEnding ? <Loader2 className="animate-spin" /> : <StopCircle className="w-5 h-5" />}
          <span>{isEnding ? 'Ending...' : 'End Interview'}</span>
        </button>
      </div>
    </div>
  );
};

const InterviewStatusIndicator = ({ status }) => {
  let text = '';
  let icon = null;
  switch (status) {
    case 'SPEAKING':
      text = "Interviewer is speaking...";
      icon = <Play className="w-5 h-5 text-blue-500" />;
      break;
    case 'LISTENING':
      text = "Listening... (Stops after 5s silence)";
      icon = <Mic className="w-5 h-5 text-red-500 animate-pulse" />;
      break;
    case 'PROCESSING':
      text = "Processing your answer...";
      icon = <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
      break;
    default:
      text = "Ready to listen";
      icon = <Mic className="w-5 h-5 text-gray-500" />;
  }
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-full">
      {icon}
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  );
};


// --- View 5: Final Report ---
const FinalReportView = ({ sessionData, resetApp }) => {
  const { finalReport } = sessionData;
  const radarData = [
    { subject: 'Technical', A: finalReport.technical_rating, fullMark: 10 },
    { subject: 'Behavioral', A: finalReport.behavioral_rating, fullMark: 10 },
    { subject: 'Communication', A: finalReport.communication_rating, fullMark: 10 },
    { subject: 'Project', A: finalReport.project_understanding_rating, fullMark: 10 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Final Interview Report</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Performance Ratings" icon={<Star className="text-yellow-500" />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Rating" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </InfoCard>

        <InfoCard title="Strengths" icon={<TrendingUp className="text-green-500" />}>
          <p className="text-gray-700">{finalReport.strengths}</p>
        </InfoCard>

        <InfoCard title="Weaknesses" icon={<Wind className="text-red-500" />}>
          <p className="text-gray-700">{finalReport.weaknesses}</p>
        </InfoCard>

        <InfoCard title="Skill Gap Summary" icon={<XCircle className="text-red-600" />}>
          <p className="text-gray-700">{finalReport.skill_gap_summary}</p>
        </InfoCard>
      </div>

      <InfoCard title="Suggestions for Improvement" icon={<CheckCircle className="text-indigo-500" />}>
        <p className="text-gray-700">{finalReport.suggestions_for_improvement}</p>
      </InfoCard>

      <div className="text-center pt-4">
        <button
          onClick={resetApp}
          className="w-full max-w-xs flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Start New Interview</span>
        </button>
      </div>
    </div>
  );
};

// --- Helper Components ---

const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center space-x-2 mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    </div>
    <div className="text-gray-600">
      {children}
    </div>
  </div>
);

const ErrorMessage = ({ message, clearError }) => (
  <div className="max-w-4xl mx-auto p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
    <div className="flex items-center">
      <ServerCrash className="w-5 h-5 mr-3" />
      <span>{message}</span>
    </div>
    <button onClick={clearError} className="font-bold text-xl">&times;</button>
  </div>
);