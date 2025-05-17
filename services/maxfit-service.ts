export const fetchBotResponse = async (message: string): Promise<string> => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'HTTP-Referer': 'https://aether-fit.vercel.app',
          'X-Title': 'Aether Fit',
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.7-sonnet",
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "You are MaxFit, a friendly fitness assistant. Keep responses concise and fitness-focused. Your name is MaxFit."
                }
              ]
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: message
                }
              ]
            }
          ]
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error?.message || `API Error: ${response.status}`;
        throw new Error(errorMessage);
      }
  
      // Handle Claude's array-based content response
      const contentArray = data.choices?.[0]?.message?.content;
      if (!contentArray || !Array.isArray(contentArray)) {
        throw new Error('Invalid response structure from API');
      }
  
      // Extract text from content blocks
      const responseText = contentArray
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
  
      return responseText || "I couldn't process that request. Please try again.";
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to get fitness advice. Please try again later.');
    }
  };