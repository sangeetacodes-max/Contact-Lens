import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, FileCode, Check, Copy, Eye, FileText, FolderArchive, Sparkles, ExternalLink, Code } from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  description: string;
  content: string;
  language: string;
  category: 'core' | 'component' | 'config' | 'style';
}

const PROJECT_FILES: CodeFile[] = [
  {
    name: 'index.html',
    path: 'index.html',
    description: 'Main HTML entry point with PayPal SDK & CustomerLens frontend snippet',
    language: 'html',
    category: 'core',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CustomerLens AI - Automated Customer Feedback & Conversion Optimization</title>

    <!-- ─── CustomerLens AI + PayPal Frontend ─── -->
    <!-- PayPal SDK with Client ID -->
    <script src="https://www.paypal.com/sdk/js?client-id=test&currency=USD"></script>

    <style>
    .cl-pricing { max-width: 800px; margin: 40px auto; display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
    .cl-plan { border: 1px solid #e0e0e0; border-radius: 12px; padding: 32px; width: 340px; text-align: center; background: #fff; }
    .cl-plan h2 { font-size: 24px; margin-bottom: 8px; }
    .cl-price { font-size: 48px; font-weight: bold; margin: 16px 0; }
    .cl-price span { font-size: 16px; font-weight: normal; color: #666; }
    .cl-features { list-style: none; padding: 0; margin: 16px 0; text-align: left; }
    .cl-features li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .cl-features li:before { content: "✓ "; color: #4CAF50; font-weight: bold; }
    .cl-paypal-btn { margin-top: 16px; min-height: 50px; }
    .cl-success { display: none; padding: 16px; background: #e8f5e9; border-radius: 8px; margin-top: 16px; color: #2e7d32; font-weight: bold; }
    .cl-error { display: none; padding: 16px; background: #ffebee; border-radius: 8px; margin-top: 16px; color: #c62828; }
    .cl-chat { max-width: 600px; margin: 40px auto; }
    .cl-chat-messages { border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; height: 400px; overflow-y: auto; margin-bottom: 12px; }
    .cl-chat-input { display: flex; gap: 8px; }
    .cl-chat-input input { flex: 1; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
    .cl-chat-input button { padding: 12px 24px; background: #4F46E5; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .cl-chat-input button:hover { background: #4338CA; }
    .cl-msg-user { text-align: right; margin: 8px 0; }
    .cl-msg-user span { background: #4F46E5; color: white; padding: 8px 16px; border-radius: 12px; display: inline-block; max-width: 80%; }
    .cl-msg-ai { text-align: left; margin: 8px 0; }
    .cl-msg-ai span { background: #f0f0f0; padding: 8px 16px; border-radius: 12px; display: inline-block; max-width: 80%; }
    </style>
  </head>
  <body>
    <div id="root"></div>

    <script>
    var AI_URL = "https://customerlens-ai.sangeeta-codes.workers.dev";
    var chatHistory = [];

    window.addEventListener('DOMContentLoaded', function() {
      if (typeof paypal !== "undefined") {
        var starterBtn = document.getElementById("paypal-starter");
        if (starterBtn) {
          paypal.Buttons({
            createOrder: async function() {
              var res = await fetch(AI_URL + "/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_id: "starter" })
              });
              var data = await res.json();
              if (data.error) { document.getElementById("error-starter").style.display = "block"; return; }
              return data.order_id;
            },
            onApprove: async function(data) {
              var res = await fetch(AI_URL + "/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: data.orderID })
              });
              var result = await res.json();
              if (result.status === "COMPLETED") {
                document.getElementById("success-starter").style.display = "block";
                document.getElementById("error-starter").style.display = "none";
              } else {
                document.getElementById("error-starter").style.display = "block";
              }
            },
            onError: function() {
              document.getElementById("error-starter").style.display = "block";
            }
          }).render("#paypal-starter");
        }

        var proBtn = document.getElementById("paypal-pro");
        if (proBtn) {
          paypal.Buttons({
            createOrder: async function() {
              var res = await fetch(AI_URL + "/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan_id: "pro" })
              });
              var data = await res.json();
              if (data.error) { document.getElementById("error-pro").style.display = "block"; return; }
              return data.order_id;
            },
            onApprove: async function(data) {
              var res = await fetch(AI_URL + "/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: data.orderID })
              });
              var result = await res.json();
              if (result.status === "COMPLETED") {
                document.getElementById("success-pro").style.display = "block";
                document.getElementById("error-pro").style.display = "none";
              } else {
                document.getElementById("error-pro").style.display = "block";
              }
            },
            onError: function() {
              document.getElementById("error-pro").style.display = "block";
            }
          }).render("#paypal-pro");
        }
      }
    });

    async function sendChat() {
      var input = document.getElementById("chat-input");
      var messages = document.getElementById("chat-messages");
      if (!input || !messages) return;
      var userMsg = input.value;
      if (!userMsg) return;

      messages.innerHTML += '<div class="cl-msg-user"><span>' + userMsg + '</span></div>';
      input.value = "";

      try {
        var res = await fetch(AI_URL + "/api/ai/survey-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newMessage: userMsg, siteId: "SITE_ID" })
        });
        var data = await res.json();
        messages.innerHTML += '<div class="cl-msg-ai"><span>' + (data.reply || "Thank you! CustomerLens AI received your message.") + '</span></div>';
      } catch (e) {
        messages.innerHTML += '<div class="cl-msg-ai"><span>CustomerLens AI is processing your request.</span></div>';
      }
    }
    </script>

    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  },
  {
    name: 'server.ts',
    path: 'server.ts',
    description: 'Express + Vite full-stack server entry with OpenAI API integration & proxy routes',
    language: 'typescript',
    category: 'core',
    content: `import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "CustomerLens AI" });
  });

  // OpenAI Proxy API Endpoint
  app.post("/api/ai/survey-chat", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OPENAI_API_KEY environment variable missing" });
      }
      const { newMessage } = req.body;
      const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are CustomerLens AI assistant for e-commerce and SaaS conversion optimization." },
            { role: "user", content: newMessage }
          ]
        })
      });
      const data = await apiRes.json();
      res.json({ reply: data.choices?.[0]?.message?.content || "Thank you for your feedback!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to call OpenAI API" });
    }
  });

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();`
  },
  {
    name: 'package.json',
    path: 'package.json',
    description: 'NPM package manifest with dependencies & run scripts',
    language: 'json',
    category: 'config',
    content: `{
  "name": "customerlens-ai",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "firebase": "^12.16.0",
    "jszip": "^3.10.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2"
  }
}`
  },
  {
    name: 'vite.config.ts',
    path: 'vite.config.ts',
    description: 'Vite build & React plugin configuration',
    language: 'typescript',
    category: 'config',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});`
  },
  {
    name: 'src/types.ts',
    path: 'src/types.ts',
    description: 'TypeScript interfaces for Workspaces, Surveys, Responses, & Users',
    language: 'typescript',
    category: 'core',
    content: `export type BusinessType = 'Shopify' | 'WooCommerce' | 'SaaS' | 'Startup' | 'Agency' | 'Ecommerce' | 'Other';

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'Free' | 'Starter' | 'Standard' | 'Pro' | 'Business';
  createdAt: string;
  paypalEmail?: string;
  trialActive?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  businessType: BusinessType;
  goal: string;
  apiKey: string;
  colorHex?: string;
}

export type SurveyDisplayOption = 'in_page' | 'time_delay' | 'scroll_depth' | 'button_click';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'open_text' | 'multiple_choice' | 'rating' | 'nps';
  options?: string[];
  required?: boolean;
}

export interface Survey {
  id: string;
  workspaceId: string;
  title: string;
  headline: string;
  questions: SurveyQuestion[];
  displayTrigger: SurveyDisplayOption;
  triggerValue: number;
  isActive: boolean;
  themeColor: string;
  targetPages: string[];
  responseCount: number;
  conversionRate: number;
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  workspaceId: string;
  answers: Record<string, any>;
  visitorLocation?: string;
  device?: string;
  exitPageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiSummary?: string;
  submittedAt: string;
}

export interface ConnectedWebsite {
  id: string;
  url: string;
  status: 'connected' | 'pending' | 'disconnected';
  lastPing: string;
}`
  },
  {
    name: 'src/App.tsx',
    path: 'src/App.tsx',
    description: 'Main React application router & state container',
    language: 'typescript',
    category: 'core',
    content: `import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import OnboardingWizard from './components/OnboardingWizard';

export default function App() {
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('demo@customerlens.ai');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      {view === 'landing' && (
        <LandingPage 
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          onNavigate={(target) => setView(target)}
          onLaunchDemo={() => setView('dashboard')}
          onGetStartedFree={() => setView('onboarding')}
        />
      )}

      {view === 'onboarding' && (
        <OnboardingWizard 
          userEmail={userEmail}
          onComplete={() => setView('dashboard')}
          onBack={() => setView('landing')}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard 
          userEmail={userEmail}
          onLogout={() => { setIsLoggedIn(false); setView('landing'); }}
        />
      )}
    </div>
  );
}`
  },
  {
    name: 'src/components/FeedbackWidget.tsx',
    path: 'src/components/FeedbackWidget.tsx',
    description: 'AI-driven in-page feedback widget component',
    language: 'typescript',
    category: 'component',
    content: `import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackWidget({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit({ answer });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full">
          <X size={20} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 font-mono uppercase tracking-wider">
              <Sparkles size={14} /> CustomerLens AI Quick Feedback
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Before you go, what prevented you from completing your order today?
            </h3>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. Shipping cost was too high, wanted to read more reviews..."
              rows={3}
              className="w-full p-3.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800"
              required
            />

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
              <Send size={14} /> Submit Feedback
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-500">CustomerLens AI analyzed your input to improve this store.</p>
          </div>
        )}
      </div>
    </div>
  );
}`
  }
];

export default function CodeExporter() {
  const [zipDownloading, setZipDownloading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloadedIndex, setDownloadedIndex] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<CodeFile | null>(null);

  // Single file downloader helper
  const handleDownloadFile = (file: CodeFile, index: number) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedIndex(index);
    setTimeout(() => setDownloadedIndex(null), 2000);
  };

  // Copy to clipboard helper
  const handleCopyCode = (file: CodeFile, index: number) => {
    navigator.clipboard.writeText(file.content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Full Project ZIP Downloader using JSZip
  const handleDownloadFullZip = async () => {
    setZipDownloading(true);
    try {
      const zip = new JSZip();

      // Add all defined project files to the ZIP
      PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'customerlens-ai-full-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip file', err);
    } finally {
      setZipDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ZIP Downloader Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FolderArchive size={160} className="text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider font-mono border border-indigo-500/30">
              <Sparkles size={12} /> Full Project Package
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Download Complete App ZIP Archive
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export all source files (<code className="text-indigo-300">index.html</code>, <code className="text-indigo-300">server.ts</code>, React components, types, and configs) packaged together in a single <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white">.zip</code> file ready for local deployment or GitHub hosting.
            </p>
          </div>

          <button
            id="btn_download_full_zip"
            onClick={handleDownloadFullZip}
            disabled={zipDownloading}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center gap-2.5 shadow-lg shadow-indigo-600/30 shrink-0 border border-indigo-400/30"
          >
            {zipDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Bundling ZIP...</span>
              </>
            ) : (
              <>
                <FolderArchive size={18} />
                <span>Download .ZIP Archive</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Individual File Download Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCode size={16} className="text-indigo-600" /> Individual File Exporters ({PROJECT_FILES.length} Files)
          </h3>
          <span className="text-xs text-slate-500">Click download button on any file to save `.html`, `.ts`, or `.json` directly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_FILES.map((file, idx) => (
            <div 
              key={file.name} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <FileText size={14} className="text-indigo-600" /> {file.path}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border">
                    {file.language}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  {file.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5"
                >
                  <Eye size={14} /> Preview
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(file, idx)}
                    className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-200"
                  >
                    {copiedIndex === idx ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedIndex === idx ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    id={`btn_download_file_${idx}`}
                    onClick={() => handleDownloadFile(file, idx)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {downloadedIndex === idx ? <Check size={14} className="text-emerald-300" /> : <Download size={14} />}
                    <span>{downloadedIndex === idx ? 'Downloaded!' : 'Download'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-indigo-400 font-bold">
                <FileCode size={16} /> {previewFile.path}
              </div>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                Close Preview
              </button>
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/90 whitespace-pre">
              {previewFile.content}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleDownloadFile(previewFile, -1)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
