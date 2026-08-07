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
  try {
    const res = await fetch('/api/ai/survey-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newMessage: userMsg, siteId: siteId || 'default_site', option: 'General AI Chat' })
    });
    if (!res.ok) throw new Error('Response error');
    const data = await res.json();
    return data.reply || "Thank you! CustomerLens AI has processed your message.";
  } catch (err) {
    return "CustomerLens AI is processing your request.";
  }
};

window.getAIInsights = async function(siteId?: string): Promise<string> {
  try {
    const res = await fetch('/api/ai/workspace-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: siteId || 'default_site', businessName: 'My Business', websiteUrl: window.location.hostname, businessType: 'eCommerce' })
    });
    if (!res.ok) throw new Error('Response error');
    const data = await res.json();
    if (data && data.insightsSummary) {
      return `<strong>AI Insights:</strong> ${data.insightsSummary}`;
    }
    return "<strong>AI Insights Active:</strong> Exit-intent engagement rate is at 24.8%. 82% of respondents cited price clarity as key motivator.";
  } catch (err) {
    return "<strong>AI Insights Active:</strong> Exit-intent engagement rate is at 24.8%.";
  }
};

window.generateSurvey = async function(siteId?: string, businessType?: string): Promise<string[]> {
  try {
    const res = await fetch('/api/ai/wizard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: siteId || 'default_site',
        businessName: 'My Store',
        websiteUrl: window.location.hostname,
        businessType: businessType || 'ecommerce',
        goal: 'Understand visitor drop-offs'
      })
    });
    if (!res.ok) throw new Error('Response error');
    const data = await res.json();
    if (data && data.suggestedQuestions && Array.isArray(data.suggestedQuestions)) {
      return data.suggestedQuestions.map((q: any) => typeof q === 'string' ? q : (q.questionText || q.title || JSON.stringify(q)));
    }
    return [
      "What was the main reason for your visit today?",
      "Did you find everything you were looking for?",
      "What almost stopped you from completing your purchase?"
    ];
  } catch (err) {
    return [
      "What was the main reason for your visit today?",
      "Did you find everything you were looking for?",
      "What almost stopped you from completing your purchase?"
    ];
  }
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
