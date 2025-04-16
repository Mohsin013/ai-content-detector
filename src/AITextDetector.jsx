// React Component for OpenAI AI Detection
import React, { useState, useEffect } from 'react';
import { analyzeTextWithOpenAI, analyzeBatchWithOpenAI } from './openai-detector';
import { 
  validateOpenAIKey as validateEnhancedOpenAIKey, 
  analyzeTextWithEnhancedOpenAI, 
  analyzeBatchWithEnhancedOpenAI 
} from './enhanced-detector';

const AITextDetector = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [apiKeyValidating, setApiKeyValidating] = useState(false);
  const [error, setError] = useState('');
  const [useEnhancedAnalysis, setUseEnhancedAnalysis] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Validate OpenAI API Key
  const validateApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setApiKeyValidating(true);
    setError('');
    
    try {
      const isValid = await validateEnhancedOpenAIKey(apiKey.trim());
      setApiKeyValid(isValid);
      
      if (!isValid) {
        setError('Invalid API key. Please check your key and try again.');
      }
    } catch (err) {
      setError(`Error validating API key: ${err.message}`);
      setApiKeyValid(false);
    } finally {
      setApiKeyValidating(false);
    }
  };
  
  // Effect to validate API key when it changes
  useEffect(() => {
    if (apiKey.trim()) {
      const timer = setTimeout(() => {
        validateApiKey();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setApiKeyValid(false);
    }
  }, [apiKey]);
  
  // Analyze a single text
  const analyzeText = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    setAnalysisProgress(0);
    
    try {
      if (!apiKeyValid) {
        throw new Error("Please enter a valid OpenAI API key");
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Use enhanced or standard analysis based on user preference
      const analysis = useEnhancedAnalysis 
        ? await analyzeTextWithEnhancedOpenAI(inputText, apiKey)
        : await analyzeTextWithOpenAI(inputText, apiKey);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setResults(analysis);
    } catch (err) {
      setError(`Analysis error: ${err.message}`);
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };
  
  // Analyze multiple texts
  const analyzeBatch = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError('');
    setAnalysisProgress(0);
    
    try {
      if (!apiKeyValid) {
        throw new Error("Please enter a valid OpenAI API key");
      }
      
      // Split by line breaks, filtering out empty lines
      const lines = inputText.split('\n').filter(line => line.trim().length > 0);
      
      // Use enhanced or standard analysis based on user preference
      const results = useEnhancedAnalysis
        ? await analyzeBatchWithEnhancedOpenAI(lines, apiKey)
        : await analyzeBatchWithOpenAI(lines, apiKey);
      
      setBatchResults(results);
      setAnalysisProgress(100);
    } catch (err) {
      setError(`Batch analysis error: ${err.message}`);
      console.error("Batch analysis error:", err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };
  
  // Render a progress bar
  const renderProgressBar = () => {
    if (!isAnalyzing || analysisProgress === 0) return null;
    
    return (
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${analysisProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1 text-center">
          {analysisProgress < 100 ? 'Analyzing...' : 'Analysis complete'}
        </p>
      </div>
    );
  };
  
  // Render a metric bar
  const renderMetricBar = (label, value, maxValue = 100, colorClass = 'bg-blue-500') => {
    const percentage = Math.min(100, (value / maxValue) * 100);
    
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-700">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${colorClass} h-2.5 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
            AI-Generated Text Detector
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          <div className="mb-6 p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md">
            <label className="block text-gray-700 text-sm font-bold mb-3">
              OpenAI API Key:
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                className={`flex-1 px-4 py-3 text-gray-700 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  !apiKey.trim() ? 'border-red-300' : 
                  apiKeyValid ? 'border-green-300' : 'border-yellow-300'
                }`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key (starts with sk-...)"
              />
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                onClick={validateApiKey}
                disabled={!apiKey.trim() || apiKeyValidating}
              >
                {apiKeyValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
            {apiKey.trim() && (
              <p className={`mt-3 text-sm font-medium ${apiKeyValid ? 'text-green-600' : 'text-red-600'}`}>
                {apiKeyValid 
                  ? '✓ API key is valid' 
                  : '⚠ Please enter a valid OpenAI API key (starts with sk-)'}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Your API key is used only for detection and is never stored on our servers.
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold mb-3">
                  Mode:
                </label>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      !batchMode 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setBatchMode(false)}
                  >
                    Single Text
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      batchMode 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setBatchMode(true)}
                  >
                    Batch Mode
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold mb-3">
                  Analysis Type:
                </label>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      useEnhancedAnalysis 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setUseEnhancedAnalysis(true)}
                  >
                    Enhanced
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                      !useEnhancedAnalysis 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setUseEnhancedAnalysis(false)}
                  >
                    Standard
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                {batchMode ? 'Paste student responses (one per line):' : 'Paste student interview transcript:'}
              </label>
              <textarea
                className="w-full px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="8"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={batchMode ? "Enter each response on a new line..." : "Paste the text to analyze here..."}
              ></textarea>
            </div>
          </div>
          
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={batchMode ? analyzeBatch : analyzeText}
            disabled={isAnalyzing || !inputText.trim() || !apiKeyValid}
          >
            {isAnalyzing ? 'Analyzing...' : batchMode ? 'Analyze All Responses' : 'Analyze Text'}
          </button>
          
          {renderProgressBar()}
          
          {!batchMode && results && (
            <div className="mt-8 p-8 bg-gray-50 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results</h2>
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">AI Generation Probability</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Confidence:</span>
                    <span className="font-medium text-gray-700">{Math.round(results.confidence)}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      results.aiProbability > 70 ? 'bg-red-500' : 
                      results.aiProbability > 40 ? 'bg-yellow-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.round(results.aiProbability)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Likely Human</span>
                  <span>Uncertain</span>
                  <span>Likely AI</span>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <p className="text-blue-900">{results.interpretation}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">OpenAI Analysis</h3>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-700 mb-4">
                    Analysis performed using <span className="font-semibold">{results.apiDetails.model}</span>
                    {results.sourceModel === 'enhanced-openai' && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Enhanced Analysis
                      </span>
                    )}
                  </p>
                  
                  {results.apiDetails.reasoning && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Analysis:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{results.apiDetails.reasoning}</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Key Factors:</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                      {results.apiDetails.confidenceFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {results.validationScore && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Validation Score:</h4>
                      {renderMetricBar('Overall Reliability', results.validationScore, 100, 'bg-purple-500')}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Text Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Word Count</p>
                    <p className="text-2xl font-bold text-gray-800">{results.textStats.words}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Sentences</p>
                    <p className="text-2xl font-bold text-gray-800">{results.textStats.sentences}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Avg. Words Per Sentence</p>
                    <p className="text-2xl font-bold text-gray-800">{results.textStats.avgWordsPerSentence.toFixed(1)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Complex Words</p>
                    <p className="text-2xl font-bold text-gray-800">{results.textStats.longWords}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500">Personal Pronouns</p>
                    <p className="text-2xl font-bold text-gray-800">{results.textStats.personalPronouns}</p>
                  </div>
                  {results.textStats.lexicalDiversity !== undefined && (
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-sm text-gray-500">Lexical Diversity</p>
                      <p className="text-2xl font-bold text-gray-800">{(results.textStats.lexicalDiversity * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  {results.textStats.readabilityScore !== undefined && (
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <p className="text-sm text-gray-500">Readability Score</p>
                      <p className="text-2xl font-bold text-gray-800">{results.textStats.readabilityScore}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Detection Notes
                </h3>
                <p className="text-sm text-gray-700">
                  {results.textStats.words < 20 ? 
                    `Note: This text is very short (${results.textStats.words} words), which typically reduces certainty. The OpenAI API is specifically optimized for analysis of short texts.` : 
                    "Text length is sufficient for reliable analysis. For even more confidence, compare multiple samples from the same student."
                  }
                </p>
              </div>
            </div>
          )}
          
          {batchMode && batchResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Batch Analysis Results</h2>
              
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Words</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batchResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-900">{result.text}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {result.textStats && result.textStats.words || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {result.error ? (
                            <span className="text-red-500 text-sm">Error</span>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    result.aiProbability > 70 ? 'bg-red-500' : 
                                    result.aiProbability > 40 ? 'bg-yellow-400' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.round(result.aiProbability)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-700">{Math.round(result.aiProbability)}%</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {result.error ? "N/A" : `${Math.round(result.confidence)}%`}
                        </td>
                        <td className="px-6 py-4">
                          {result.error ? (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Analysis Failed
                            </span>
                          ) : (
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              result.aiProbability > 70 ? 'bg-red-100 text-red-800' : 
                              result.aiProbability > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {result.aiProbability > 70 ? 'Likely AI' : 
                               result.aiProbability > 40 ? 'Uncertain' : 'Likely Human'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Batch Analysis Notes</h3>
                <p className="text-sm text-gray-700">
                  • OpenAI API provides high-accuracy detection for short responses<br />
                  • The analysis examines patterns that may not be obvious to human readers<br />
                  • Each response is analyzed individually using GPT-4's understanding of AI text patterns
                  {useEnhancedAnalysis && (
                    <>
                      <br />• Enhanced analysis uses a hybrid approach combining embeddings and completions
                      <br />• Validation scores provide additional confidence in the results
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITextDetector;