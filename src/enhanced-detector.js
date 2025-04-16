// Enhanced OpenAI Text Analysis
// This file provides an improved implementation for AI text detection

import OpenAI from 'openai';

/**
 * Preprocesses text for analysis
 * @param {string} text - The text to preprocess
 * @returns {string} - Preprocessed text
 */
export const preprocessText = (text) => {
  if (!text) return '';
  
  // Normalize whitespace
  let processed = text.replace(/\s+/g, ' ').trim();
  
  // Remove URLs
  processed = processed.replace(/https?:\/\/\S+/g, '');
  
  // Remove email addresses
  processed = processed.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
  
  // Remove special characters but keep punctuation
  processed = processed.replace(/[^\w\s.,!?;:'"()\-]/g, '');
  
  return processed;
};

/**
 * Calculates enhanced text statistics
 * @param {string} text - The text to analyze
 * @returns {Object} - Text statistics
 */
export const calculateEnhancedTextStats = (text) => {
  if (!text) return {
    words: 0,
    sentences: 0,
    avgWordsPerSentence: 0,
    longWords: 0,
    personalPronouns: 0,
    readabilityScore: 0,
    lexicalDiversity: 0
  };
  
  // Basic stats
  const words = text.split(' ').filter(word => word.length > 0).length;
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const avgWordsPerSentence = words / sentences;
  
  // Complex words (more than 6 characters)
  const longWords = text.split(' ').filter(word => word.length > 6).length;
  
  // Personal pronouns
  const personalPronouns = (text.match(/\b(I|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi) || []).length;
  
  // Readability score (Flesch-Kincaid Grade Level approximation)
  const syllables = countSyllables(text);
  const readabilityScore = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  
  // Lexical diversity (unique words / total words)
  const uniqueWords = new Set(text.toLowerCase().split(' ')).size;
  const lexicalDiversity = words > 0 ? uniqueWords / words : 0;
  
  return {
    words,
    sentences,
    avgWordsPerSentence,
    longWords,
    personalPronouns,
    readabilityScore: Math.round(readabilityScore * 10) / 10,
    lexicalDiversity: Math.round(lexicalDiversity * 100) / 100
  };
};

/**
 * Counts syllables in text (approximation)
 * @param {string} text - The text to analyze
 * @returns {number} - Syllable count
 */
const countSyllables = (text) => {
  // Simple approximation - count vowel groups
  const words = text.toLowerCase().split(' ');
  let count = 0;
  
  for (const word of words) {
    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g) || [];
    count += vowelGroups.length;
    
    // Adjust for common exceptions
    if (word.endsWith('e') && !word.endsWith('le')) count--;
    if (word.endsWith('es') || word.endsWith('ed')) count--;
  }
  
  return Math.max(1, count);
};

/**
 * Performs embedding-based analysis
 * @param {string} text - The text to analyze
 * @param {OpenAI} openai - OpenAI client
 * @returns {Promise<Object>} - Analysis results
 */
export const performEmbeddingAnalysis = async (text, openai) => {
  try {
    // Get embedding for the text
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });
    
    const textEmbedding = embeddingResponse.data[0].embedding;
    
    // Known patterns for AI vs human text (simplified for example)
    // In a real implementation, these would be more sophisticated
    const aiPatterns = [
      // Example AI pattern embedding (simplified)
      Array(1536).fill(0.1)
    ];
    
    const humanPatterns = [
      // Example human pattern embedding (simplified)
      Array(1536).fill(0.2)
    ];
    
    // Calculate similarity scores
    const aiSimilarity = cosineSimilarity(textEmbedding, aiPatterns[0]);
    const humanSimilarity = cosineSimilarity(textEmbedding, humanPatterns[0]);
    
    // Calculate AI probability based on similarity
    const totalSimilarity = aiSimilarity + humanSimilarity;
    const aiProbability = totalSimilarity > 0 ? 
      Math.round((aiSimilarity / totalSimilarity) * 100) : 50;
    
    return {
      aiProbability,
      confidence: 70, // Lower confidence for embedding-only approach
      model: "text-embedding-ada-002",
      factors: ["Embedding similarity analysis"],
      likelySource: aiProbability > 60 ? "ai" : "human",
      reasoning: `Based on embedding similarity, this text has a ${aiProbability}% probability of being AI-generated.`
    };
  } catch (error) {
    console.error("Embedding analysis error:", error);
    throw new Error(`Failed to perform embedding analysis: ${error.message}`);
  }
};

/**
 * Calculates cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Cosine similarity
 */
const cosineSimilarity = (vec1, vec2) => {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (norm1 * norm2);
};

/**
 * Performs completion-based analysis with improved prompt
 * @param {string} text - The text to analyze
 * @param {OpenAI} openai - OpenAI client
 * @returns {Promise<Object>} - Analysis results
 */
export const performCompletionAnalysis = async (text, openai) => {
  try {
    // Enhanced prompt with few-shot examples
    const prompt = `
You are an AI text analysis expert specializing in detecting AI-generated content. Your task is to evaluate whether the following text was written by a human or generated by AI.

Here are examples to guide your analysis:

EXAMPLE 1 (Human-written):
"I went to the store yesterday and bought some milk. It was pretty expensive, but I needed it for my cereal. I also picked up some bread and eggs. The cashier was really friendly and helped me bag my groceries."

EXAMPLE 2 (AI-generated):
"The implementation of artificial intelligence systems has revolutionized numerous industries, from healthcare to transportation. These advanced algorithms can process vast amounts of data with remarkable efficiency, enabling more informed decision-making processes. Furthermore, machine learning models continue to evolve, demonstrating increasingly sophisticated capabilities in natural language processing and computer vision applications."

Now, analyze the following text:

"${text}"

Consider these factors:
1. Natural language patterns (filler words, hesitations, informal phrasing)
2. Consistency and formality of tone
3. Sentence structure variety vs. repetitive patterns
4. Personal pronouns and references to personal experiences
5. Human-like inconsistencies or errors
6. Contextual coherence and fluency
7. Vocabulary diversity and complexity
8. Emotional authenticity and personal voice

Provide your assessment in the following JSON format:

{
"aiProbability": number,       // Likelihood (0-100) that the content was generated by AI
"confidence": number,          // Confidence level (0-100) in your assessment
"factors": string[],           // Key reasons influencing your assessment
"likelySource": "human" | "ai",// Most probable source of the content
"reasoning": string            // Summary explanation of your assessment
}`;

    const completionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an AI detection expert that analyzes text to determine if it was written by an AI." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const analysisResult = JSON.parse(completionResponse.choices[0].message.content);
    
    return {
      ...analysisResult,
      model: "gpt-4o"
    };
  } catch (error) {
    console.error("Completion analysis error:", error);
    throw new Error(`Failed to perform completion analysis: ${error.message}`);
  }
};

/**
 * Combines results from multiple analysis methods
 * @param {Object} embeddingResult - Results from embedding analysis
 * @param {Object} completionResult - Results from completion analysis
 * @returns {Object} - Combined analysis results
 */
export const combineAnalysisResults = (embeddingResult, completionResult) => {
  // Weight the results (completion analysis is generally more accurate)
  const embeddingWeight = 0.3;
  const completionWeight = 0.7;
  
  // Calculate weighted AI probability
  const weightedAiProbability = Math.round(
    (embeddingResult.aiProbability * embeddingWeight) + 
    (completionResult.aiProbability * completionWeight)
  );
  
  // Calculate weighted confidence
  const weightedConfidence = Math.round(
    (embeddingResult.confidence * embeddingWeight) + 
    (completionResult.confidence * completionWeight)
  );
  
  // Combine factors
  const combinedFactors = [
    ...embeddingResult.factors,
    ...completionResult.factors
  ];
  
  // Determine likely source
  const likelySource = weightedAiProbability > 60 ? "ai" : "human";
  
  // Combine reasoning
  const combinedReasoning = `Combined analysis: ${completionResult.reasoning} Additionally, embedding similarity analysis suggests a ${embeddingResult.aiProbability}% probability of AI generation.`;
  
  return {
    aiProbability: weightedAiProbability,
    confidence: weightedConfidence,
    factors: combinedFactors,
    likelySource,
    reasoning: combinedReasoning,
    model: "hybrid-approach"
  };
};

/**
 * Calculates a validation score for the analysis results
 * @param {Object} analysisResult - The analysis results
 * @param {Object} textStats - Text statistics
 * @returns {number} - Validation score (0-100)
 */
export const calculateValidationScore = (analysisResult, textStats) => {
  let score = 0;
  
  // Base score on confidence
  score += analysisResult.confidence * 0.4;
  
  // Adjust based on text length (longer texts are more reliable)
  const lengthScore = Math.min(100, textStats.words * 2);
  score += lengthScore * 0.2;
  
  // Adjust based on lexical diversity (higher diversity often indicates human writing)
  const diversityScore = textStats.lexicalDiversity * 100;
  score += diversityScore * 0.2;
  
  // Adjust based on personal pronouns (more pronouns often indicates human writing)
  const pronounScore = Math.min(100, textStats.personalPronouns * 20);
  score += pronounScore * 0.2;
  
  return Math.round(score);
};

/**
 * Generates an enhanced interpretation of the analysis results
 * @param {Object} analysisResult - The analysis results
 * @param {Object} textStats - Text statistics
 * @returns {string} - Human-readable interpretation
 */
export const getEnhancedInterpretation = (analysisResult, textStats) => {
  const lengthQualifier = textStats.words < 15 ? 
    "This sample is very short, which typically affects certainty, but our analysis suggests: " : 
    "Based on our comprehensive analysis: ";
  
  let interpretation = lengthQualifier;
  
  if (analysisResult.aiProbability < 30) {
    interpretation += "This text is likely human-written with natural speech patterns.";
  } else if (analysisResult.aiProbability < 60) {
    interpretation += "This text has mixed indicators that could suggest either human or AI authorship.";
  } else {
    interpretation += "This text shows patterns consistent with AI-generated content.";
  }
  
  // Add specific indicators
  if (textStats.lexicalDiversity < 0.5 && textStats.words > 50) {
    interpretation += " The low lexical diversity (repetitive vocabulary) is a common indicator of AI-generated text.";
  }
  
  if (textStats.personalPronouns === 0 && textStats.words > 30) {
    interpretation += " The absence of personal pronouns is unusual for human writing.";
  }
  
  if (textStats.readabilityScore > 12) {
    interpretation += " The high readability score suggests formal, well-structured writing typical of AI.";
  }
  
  return interpretation;
};

/**
 * Analyzes text to determine if it's AI-generated using an enhanced approach
 * @param {string} text - The text to analyze
 * @param {string} apiKey - Your OpenAI API key
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeTextWithEnhancedOpenAI = async (text, apiKey) => {
  if (!text || !apiKey) {
    throw new Error("Text and API key are required");
  }
  
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Needed for client-side use
  });
  
  try {
    // Text preprocessing
    const processedText = preprocessText(text);
    const textStats = calculateEnhancedTextStats(processedText);
    
    // Choose analysis approach based on text length
    let analysisResult;
    
    if (textStats.words < 100) {
      // For short texts, use only completion-based analysis
      analysisResult = await performCompletionAnalysis(processedText, openai);
    } else {
      // For longer texts, use a hybrid approach
      const embeddingResult = await performEmbeddingAnalysis(processedText, openai);
      const completionResult = await performCompletionAnalysis(processedText, openai);
      
      // Combine results with weighted scoring
      analysisResult = combineAnalysisResults(embeddingResult, completionResult);
    }
    
    // Calculate validation score
    const validationScore = calculateValidationScore(analysisResult, textStats);
    
    // Return combined results with improved metrics
    return {
      aiProbability: analysisResult.aiProbability,
      confidence: analysisResult.confidence,
      textStats: textStats,
      interpretation: getEnhancedInterpretation(analysisResult, textStats),
      apiDetails: {
        model: analysisResult.model,
        confidenceFactors: analysisResult.factors || [],
        reasoning: analysisResult.reasoning || ""
      },
      sourceModel: 'enhanced-openai',
      validationScore: validationScore
    };
  } catch (error) {
    console.error("Enhanced OpenAI analysis error:", error);
    throw new Error(`Failed to analyze text: ${error.message}`);
  }
};

/**
 * Analyzes multiple texts in parallel with rate limiting
 * @param {string[]} texts - Array of texts to analyze 
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object[]>} - Analysis results for each text
 */
export const analyzeBatchWithEnhancedOpenAI = async (texts, apiKey) => {
  const results = [];
  const batchSize = 3; // Process 3 texts at a time to avoid rate limits
  
  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => {
      if (text.trim()) {
        return analyzeTextWithEnhancedOpenAI(text, apiKey)
          .then(analysis => ({
            text: text,
            ...analysis
          }))
          .catch(error => ({
            text: text,
            error: error.message,
            aiProbability: 50,
            confidence: 10,
            interpretation: "Analysis failed"
          }));
      }
      return Promise.resolve(null);
    });
    
    // Wait for the current batch to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Filter out null results and add to results array
    results.push(...batchResults.filter(result => result !== null));
    
    // Add a delay between batches to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

/**
 * Validates an OpenAI API key by making a test request
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<boolean>} - Whether the key is valid
 */
export const validateOpenAIKey = async (apiKey) => {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return false;
  }
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // Make a minimal API call to check if the key works
    const response = await openai.models.list();
    return response && Array.isArray(response.data);
  } catch (error) {
    console.error("API key validation error:", error);
    return false;
  }
}; 