import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Declare global AI functions on window
declare global {
  interface Window {
    chatWithAI: (userMsg: string, siteId?: string) => Promise<string>;
    getAIInsights: (siteId?: string) => Promise<string>;
    generateSurvey: (siteId?: string, businessType?: string) => Promise<string[]>;
    sendChat: () => Promise<void>;
    loadInsights: () => Promise<void>;
    makeSurvey: () => Promise<void>;
  }
}

window.chatWithAI = async function(userMsg: string, siteId?: string): Promise<string> {
  if (!siteId) {
    return "Error: A valid siteId is required to chat with CustomerLens AI.";
  }
  try {
    const res = await fetch('/api/ai/survey-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newMessage: userMsg, siteId, option: 'General AI Chat' })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Response error');
    }
    const data = await res.json();
    return data.reply || "Thank you! CustomerLens AI has processed your message.";
  } catch (err: any) {
    return `AI Error: ${err.message || 'AI service unavailable.'}`;
  }
};

window.getAIInsights = async function(siteId?: string): Promise<string> {
  if (!siteId) {
    return "<strong>AI Insights:</strong> Error: A valid siteId is required.";
  }
  try {
    const res = await fetch('/api/ai/workspace-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, businessName: 'My Business', websiteUrl: window.location.hostname, businessType: 'eCommerce' })
    });
    if (!res.ok) throw new Error('Response error');
    const data = await res.json();
    if (data && data.insightsSummary) {
      return `<strong>AI Insights:</strong> ${data.insightsSummary}`;
    }
    if (data && data.today && data.today.insight) {
      return `<strong>AI Insights:</strong> ${data.today.insight}`;
    }
    return "<strong>AI Insights:</strong> No real data available yet. Collect visitor responses to view live AI analytics.";
  } catch (err) {
    return "<strong>AI Insights:</strong> No real data available yet. Collect visitor responses to view live AI analytics.";
  }
};

window.generateSurvey = async function(siteId?: string, businessType?: string): Promise<string[]> {
  if (!siteId) {
    throw new Error('A valid registered siteId is required to generate a survey.');
  }
  const res = await fetch('/api/ai/wizard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteId,
      businessName: 'My Store',
      websiteUrl: window.location.hostname,
      businessType: businessType || 'ecommerce',
      goal: 'Understand visitor drop-offs'
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to generate survey questions from OpenAI.');
  }
  const data = await res.json();
  if (data && data.suggestedQuestions && Array.isArray(data.suggestedQuestions)) {
    return data.suggestedQuestions.map((q: any) => typeof q === 'string' ? q : (q.questionText || q.title || JSON.stringify(q)));
  }
  return [];
};

window.sendChat = async function(): Promise<void> {
  const input = document.getElementById("chat-input") as HTMLInputElement | null;
  const messages = document.getElementById("chat-messages");
  if (!input || !messages) return;
  const userMsg = input.value;
  if (!userMsg) return;

  messages.innerHTML += "<p><b>You:</b> " + userMsg + "</p>";
  input.value = "";

  const reply = await window.chatWithAI(userMsg, "SITE_ID");
  messages.innerHTML += "<p><b>AI:</b> " + reply + "</p>";
};

window.loadInsights = async function(): Promise<void> {
  const container = document.getElementById("ai-insights");
  if (!container) return;
  const insights = await window.getAIInsights("SITE_ID");
  container.innerHTML = insights;
};

window.makeSurvey = async function(): Promise<void> {
  const container = document.getElementById("survey-output");
  if (!container) return;
  const questions = await window.generateSurvey("SITE_ID", "ecommerce");
  container.innerHTML = questions.map(q => "<p>" + q + "</p>").join("");
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
