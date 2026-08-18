import { Env, TrackingEvent, SurveyResponse } from '../types';
import { DatabaseService } from '../services/db';
import { StorageService } from '../services/storage';
import { OpenAIService } from '../services/openai';
import { jsonResponse, ApiError } from '../utils/errors';
import { corsHeaders } from '../middleware/cors';

export async function handleTrackingRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);
  const storage = new StorageService(env);

  // 1. Serve JS Tracking SDK (/customerlens.js or /tracker.js)
  if (pathname === '/customerlens.js' || pathname === '/tracker.js') {
    const url = new URL(request.url);
    const origin = url.origin;

    const trackerScript = `(function() {
  var scriptTag = document.currentScript || document.querySelector('script[src*="customerlens.js"]') || document.querySelector('script[src*="tracker.js"]');
  var siteId = scriptTag ? scriptTag.getAttribute('data-site-id') : 'default_site';
  var endpoint = scriptTag ? scriptTag.src.replace(/\\/(customerlens|tracker)\\.js.*/, '') : '${origin}';

  var sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
  var pageStartTime = Date.now();
  var maxScrollPercent = 0;
  var exitIntentTriggered = false;
  var hesitationTriggered = false;
  var clickHistory = [];
  var isWidgetOpen = false;

  function sendEvent(eventType, payload, callback) {
    try {
      var data = {
        siteId: siteId,
        sessionId: sessionId,
        eventType: eventType,
        pageUrl: window.location.href,
        referrer: document.referrer || '',
        timestamp: new Date().toISOString(),
        timeOnPage: Math.round((Date.now() - pageStartTime) / 1000),
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        browser: navigator.userAgent,
        payload: payload || {}
      };
      fetch(endpoint + '/api/events/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function(res) { return res.json(); })
        .then(function(resData) {
          if (resData && resData.data && resData.data.triggerSurvey && !isWidgetOpen && !document.getElementById('customerlens-survey-widget')) {
            renderSurveyWidget(resData.data.triggerSurvey);
          }
          if (callback) callback(resData);
        }).catch(function(err){});
    } catch(e) {}
  }

  // 1. Initial Pageview Tracking
  sendEvent('pageview');

  // 2. Scroll Depth Tracking (50%, 75%, 90%)
  window.addEventListener('scroll', function() {
    var h = document.documentElement, b = document.body;
    var st = 'scrollTop' in h ? h.scrollTop : b.scrollTop;
    var sh = 'scrollHeight' in h ? h.scrollHeight : b.scrollHeight;
    var percent = Math.round((st / (sh - h.clientHeight)) * 100) || 0;
    if (percent > maxScrollPercent) {
      maxScrollPercent = percent;
      if (maxScrollPercent >= 50 && (maxScrollPercent === 50 || maxScrollPercent === 75 || maxScrollPercent >= 90)) {
        sendEvent('scroll_depth', { scrollPercent: maxScrollPercent });
      }
    }
  }, { passive: true });

  // 3. Exit Intent Detection
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 15 && !exitIntentTriggered) {
      exitIntentTriggered = true;
      sendEvent('exit_intent', { clientY: e.clientY });
    }
  });

  // 4. Time On Page / Hesitation Trigger (15s & 30s)
  setTimeout(function() {
    if (!hesitationTriggered) {
      sendEvent('time_on_page', { seconds: 15 });
    }
  }, 15000);

  setTimeout(function() {
    if (!hesitationTriggered && !exitIntentTriggered) {
      hesitationTriggered = true;
      sendEvent('hesitation', { seconds: 30 });
    }
  }, 30000);

  // 5. Cart / Checkout & Rage Click Detection
  document.addEventListener('click', function(e) {
    var now = Date.now();
    clickHistory.push(now);
    clickHistory = clickHistory.filter(function(t) { return now - t < 1500; });
    if (clickHistory.length >= 4) {
      sendEvent('rage_clicks', { clickCount: clickHistory.length });
    }

    var target = e.target;
    if (target) {
      var text = (target.innerText || target.value || '').toLowerCase();
      if (text.includes('cart') || text.includes('checkout') || text.includes('buy') || text.includes('pricing') || text.includes('subscribe')) {
        sendEvent('cart_action', { action: text.substring(0, 40) });
      }
    }
  });

  function renderSurveyWidget(survey) {
    if (document.getElementById('customerlens-survey-widget')) return;
    isWidgetOpen = true;

    var container = document.createElement('div');
    container.id = 'customerlens-survey-widget';
    var bg = (survey.colors && survey.colors.background) || '#09090b';
    var txt = (survey.colors && survey.colors.text) || '#ffffff';
    var acc = (survey.colors && survey.colors.accent) || '#3b82f6';

    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;width:390px;max-width:92vw;background:' + bg + ';color:' + txt + ';border:1px solid rgba(255,255,255,0.15);border-radius:16px;box-shadow:0 20px 30px -5px rgba(0,0,0,0.55);font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;padding:20px;box-sizing:border-box;transition:all 0.3s ease;animation:clSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);';

    var keyframeStyle = document.createElement('style');
    keyframeStyle.innerHTML = '@keyframes clSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
    document.head.appendChild(keyframeStyle);

    var questions = survey.questions || [];
    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:' + acc + ';display:flex;align-items:center;gap:6px;">' +
      '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + acc + ';"></span>CustomerLens AI</div>' +
      '<button id="cl-close-btn" style="background:none;border:none;color:inherit;font-size:20px;line-height:1;cursor:pointer;opacity:0.75;">&times;</button>' +
      '</div>' +
      '<h3 style="margin:0 0 14px 0;font-size:15px;font-weight:700;line-height:1.35;">' + (survey.headline || 'Help us improve your experience') + '</h3>' +
      '<div id="cl-survey-content">' +
      '<form id="cl-survey-form" style="display:flex;flex-direction:column;gap:12px;">';

    questions.forEach(function(q, i) {
      html += '<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px;opacity:0.9;">' + (questions.length > 1 ? (i+1) + '. ' : '') + q.questionText + '</label>';
      if (q.type === 'multiple-choice' && q.options) {
        q.options.forEach(function(opt) {
          html += '<label style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:5px;cursor:pointer;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,0.04);"><input type="radio" name="q_' + q.id + '" value="' + opt.replace(/"/g, '&quot;') + '" required/> ' + opt + '</label>';
        });
      } else if (q.type === 'rating') {
        html += '<div style="display:flex;gap:8px;justify-content:space-between;margin:4px 0;">';
        [1,2,3,4,5].forEach(function(star) {
          html += '<label style="flex:1;text-align:center;padding:6px;background:rgba(255,255,255,0.05);border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;"><input type="radio" name="q_' + q.id + '" value="' + star + '" style="display:none;" required/>' + star + '★</label>';
        });
        html += '</div>';
      } else {
        html += '<textarea name="q_' + q.id + '" rows="2" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:inherit;border-radius:8px;padding:8px;font-size:12px;resize:none;" placeholder="Type your answer..."></textarea>';
      }
      html += '</div>';
    });

    html += '<button type="submit" style="background:' + acc + ';color:#ffffff;border:none;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;margin-top:6px;">Submit Feedback</button></form></div>';

    container.innerHTML = html;
    document.body.appendChild(container);

    document.getElementById('cl-close-btn').onclick = function() {
      container.remove();
      isWidgetOpen = false;
    };

    document.getElementById('cl-survey-form').onsubmit = function(e) {
      e.preventDefault();
      var formData = new FormData(this);
      var answers = [];
      var primaryAnswer = '';
      formData.forEach(function(val, key) {
        answers.push({ questionId: key.replace('q_', ''), answer: val });
        if (!primaryAnswer) primaryAnswer = val;
      });

      // Submit Response to D1
      fetch(endpoint + '/api/events/survey-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteId,
          surveyId: survey.id || 'surv_live',
          sessionId: sessionId,
          answers: answers,
          pageUrl: window.location.href,
          timestamp: new Date().toISOString()
        })
      });

      // Render Interactive Real AI Follow-Up Interface
      var contentDiv = document.getElementById('cl-survey-content');
      if (contentDiv) {
        contentDiv.innerHTML = '<div style="margin-bottom:12px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.06);font-size:12px;line-height:1.4;">' +
          '<div style="font-weight:700;color:' + acc + ';margin-bottom:4px;">AI Assistant</div>' +
          '<div id="cl-ai-text">Thank you for your answer! Is there anything specific that would help you move forward today?</div>' +
          '</div>' +
          '<div id="cl-chat-messages" style="max-height:120px;overflow-y:auto;font-size:11px;display:flex;flex-direction:column;gap:6px;margin-bottom:10px;"></div>' +
          '<div style="display:flex;gap:6px;">' +
          '<input type="text" id="cl-followup-input" placeholder="Type a message or objection..." style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:inherit;border-radius:8px;padding:8px;font-size:12px;outline:none;" />' +
          '<button id="cl-send-btn" style="background:' + acc + ';color:#fff;border:none;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer;">Send</button>' +
          '</div>';

        var chatHistory = [];
        var sendBtn = document.getElementById('cl-send-btn');
        var chatInput = document.getElementById('cl-followup-input');
        var messagesDiv = document.getElementById('cl-chat-messages');

        function sendChat() {
          var userMsg = (chatInput.value || '').trim();
          if (!userMsg) return;
          chatInput.value = '';
          chatHistory.push({ role: 'user', content: userMsg });

          var userBubble = document.createElement('div');
          userBubble.style.cssText = 'align-self:flex-end;background:' + acc + ';color:#fff;padding:6px 10px;border-radius:8px;max-width:85%;';
          userBubble.textContent = userMsg;
          messagesDiv.appendChild(userBubble);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;

          sendBtn.disabled = true;
          sendBtn.textContent = '...';

          fetch(endpoint + '/api/events/survey-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteId: siteId,
              sessionId: sessionId,
              surveyId: survey.id || 'surv_live',
              option: primaryAnswer,
              newMessage: userMsg,
              history: chatHistory,
              pageUrl: window.location.href
            })
          }).then(function(r) { return r.json(); })
            .then(function(data) {
              sendBtn.disabled = false;
              sendBtn.textContent = 'Send';
              var reply = (data && data.data && data.data.reply) || data.reply || "Thank you! Our team has been notified.";
              chatHistory.push({ role: 'assistant', content: reply });
              var aiBubble = document.createElement('div');
              aiBubble.style.cssText = 'align-self:flex-start;background:rgba(255,255,255,0.1);padding:6px 10px;border-radius:8px;max-width:85%;';
              aiBubble.textContent = reply;
              messagesDiv.appendChild(aiBubble);
              messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }).catch(function() {
              sendBtn.disabled = false;
              sendBtn.textContent = 'Send';
            });
        }

        sendBtn.onclick = sendChat;
        chatInput.onkeydown = function(ev) { if (ev.key === 'Enter') sendChat(); };
      }
    };
  }
})();`;

    return new Response(trackerScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        ...corsHeaders
      }
    });
  }

  // 2. Track Behavioral Event Endpoint (/api/events/track)
  if (pathname === '/api/events/track' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;

    if (!body.siteId || !body.eventType) {
      throw new ApiError('siteId and eventType are required', 400, 'MISSING_EVENT_PARAMS');
    }

    const event: TrackingEvent = {
      id: 'evt_' + crypto.randomUUID().substring(0, 8),
      siteId: body.siteId,
      sessionId: body.sessionId || 'sess_anonymous',
      eventType: body.eventType,
      pageUrl: body.pageUrl || '',
      referrer: body.referrer || '',
      timestamp: body.timestamp || new Date().toISOString(),
      timeOnPage: body.timeOnPage || 0,
      device: body.device || 'Desktop',
      browser: body.browser || 'Chrome',
      payload: body.payload || {}
    };

    // Save to D1
    await db.recordEvent(event);

    // Archive raw log to R2
    await storage.r2PutLog(`events/${event.siteId}/${event.id}.json`, event);

    // Check behavioral trigger rules
    let triggerSurvey: any = null;
    if (
      event.eventType === 'exit_intent' ||
      event.eventType === 'hesitation' ||
      event.eventType === 'rage_clicks' ||
      (event.eventType === 'cart_action' && event.pageUrl.includes('cart')) ||
      (event.eventType === 'scroll_depth' && (event.payload?.scrollPercent || 0) >= 50)
    ) {
      triggerSurvey = await storage.kvGet(`active_survey:${event.siteId}`) || await db.getSurveyBySiteId(event.siteId);
    }

    return jsonResponse({
      recorded: true,
      eventId: event.id,
      triggerSurvey
    });
  }

  // 3. Survey Response Endpoint (/api/events/survey-response)
  if (pathname === '/api/events/survey-response' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;

    const responseRecord: SurveyResponse = {
      id: 'resp_' + crypto.randomUUID().substring(0, 8),
      siteId: body.siteId || 'default_site',
      surveyId: body.surveyId || 'surv_default',
      sessionId: body.sessionId || 'sess_submitted',
      answers: body.answers || [],
      pageUrl: body.pageUrl || '',
      visitorMeta: body.visitorMeta || {},
      timestamp: body.timestamp || new Date().toISOString()
    };

    await db.recordResponse(responseRecord);

    return jsonResponse({
      recorded: true,
      responseId: responseRecord.id
    });
  }

  // 4. Conversational Live AI Survey Chat (/api/events/survey-chat)
  if (pathname === '/api/events/survey-chat' && request.method === 'POST') {
    const body = await request.json().catch(() => ({})) as any;
    const { siteId, sessionId, surveyId, newMessage, option, history, pageUrl } = body;

    if (!newMessage) {
      throw new ApiError('newMessage is required', 400, 'MISSING_MESSAGE');
    }

    // Record interaction as an event in D1
    const event: TrackingEvent = {
      id: 'evt_chat_' + crypto.randomUUID().substring(0, 8),
      siteId: siteId || 'default_site',
      sessionId: sessionId || 'sess_chat',
      eventType: 'ai_survey_chat',
      pageUrl: pageUrl || '',
      referrer: '',
      timestamp: new Date().toISOString(),
      timeOnPage: 0,
      device: 'Desktop',
      browser: 'Web',
      payload: { userMessage: newMessage, option, surveyId }
    };
    await db.recordEvent(event);

    // Call Real OpenAI API
    const openai = new OpenAIService(env);
    const reply = await openai.surveyChat(newMessage, option, history);

    return jsonResponse({
      reply,
      sessionId,
      eventId: event.id
    });
  }

  return new Response('Not Found', { status: 404 });
}
