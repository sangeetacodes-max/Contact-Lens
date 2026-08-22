import { Env, TrackingEvent, SurveyResponse, SurveyConfig, ResponseSignal } from '../types';
import { DatabaseService } from '../services/db';
import { StorageService } from '../services/storage';
import { OpenAIService } from '../services/openai';
import { NotificationService } from '../services/notifications';
import { jsonResponse, ApiError } from '../utils/errors';
import { corsHeaders } from '../middleware/cors';
import { Logger } from '../utils/logger';

export async function handleTrackingRoutes(request: Request, env: Env, pathname: string): Promise<Response> {
  const db = new DatabaseService(env);
  const storage = new StorageService(env);

  // -----------------------------------------------------------------------------------
  // 1. SERVE JAVASCRIPT TRACKER SDK (/tracker.js or /customerlens.js)
  // -----------------------------------------------------------------------------------
  if (pathname === '/customerlens.js' || pathname === '/tracker.js') {
    const url = new URL(request.url);
    const origin = url.origin;

    const trackerScript = `(function() {
  // Prevent duplicate initialization
  if (window.__CUSTOMERLENS_INITIALIZED__) return;
  window.__CUSTOMERLENS_INITIALIZED__ = true;

  var scriptTag = document.currentScript || document.querySelector('script[src*="customerlens.js"]') || document.querySelector('script[src*="tracker.js"]') || document.querySelector('script[data-site-id]') || document.querySelector('script[data-site]');
  var siteId = scriptTag ? (scriptTag.getAttribute('data-site-id') || scriptTag.getAttribute('data-site') || '') : '';
  var endpoint = scriptTag && scriptTag.src ? scriptTag.src.replace(/\\/(customerlens|tracker)\\.js.*/, '') : '${origin}';
  if (!endpoint || endpoint === 'null' || endpoint.startsWith('file:')) {
    endpoint = '${origin}';
  }

  var sessionId = 'session_' + Math.random().toString(36).substring(2, 11);
  var pageStartTime = Date.now();
  var maxScrollPercent = 0;
  var exitIntentDetected = false;
  var hesitationDetected = false;
  var clickTimestamps = [];
  var repeatedClicksCount = 0;
  var isWidgetOpen = false;
  var isSurveyCompleted = false;
  var widgetConfig = null;
  var lastEventSentTime = 0;

  var currentPage = window.location.pathname || '/';

  // 1. Fetch Widget Configuration from Backend for this specific site_id
  function initWidgetConfig() {
    if (!siteId) {
      console.warn('[CustomerLens] Missing data-site-id attribute on tracker script tag.');
      return;
    }
    var configUrl = endpoint + '/api/tracker/config?site_id=' + encodeURIComponent(siteId) + '&page=' + encodeURIComponent(currentPage);
    fetch(configUrl)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.enabled && data.surveys && data.surveys.length > 0) {
          widgetConfig = data;
          // Only start behavioral telemetry if site is active and verified
          sendBehaviorEvent({ event: 'pageview', eventType: 'pageview' });
          attachInteractionListeners();
        } else {
          console.warn('[CustomerLens] Survey widget is inactive or unconfigured for site_id: ' + siteId, data && data.error);
        }
      })
      .catch(function(err) {
        console.warn('[CustomerLens] Config fetch failed:', err);
      });
  }

  initWidgetConfig();

  // 2. Behavioral Telemetry Dispatcher
  function sendBehaviorEvent(customPayload) {
    if (isSurveyCompleted || isWidgetOpen || !siteId) return;

    var timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
    var payload = customPayload || {};

    var eventBody = {
      site_id: siteId,
      siteId: siteId,
      session_id: sessionId,
      sessionId: sessionId,
      page: currentPage,
      pageUrl: window.location.href,
      time_on_page: timeOnPage,
      timeOnPage: timeOnPage,
      scroll_depth: maxScrollPercent,
      scrollDepth: maxScrollPercent,
      hesitation: hesitationDetected,
      repeatedClicks: repeatedClicksCount,
      exitIntent: exitIntentDetected,
      event: payload.event || payload.eventType || 'behavior_update',
      eventType: payload.eventType || payload.event || 'behavior_update',
      payload: payload
    };

    lastEventSentTime = Date.now();

    fetch(endpoint + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventBody)
    })
    .then(function(res) { return res.json(); })
    .then(function(response) {
      if (response && (response.action === 'SHOW_SURVEY' || response.decision === 'SHOW') && !isWidgetOpen && !isSurveyCompleted) {
        var surveyToRender = response.survey || (widgetConfig && widgetConfig.surveys && widgetConfig.surveys[0]);
        if (surveyToRender) {
          renderSurveyWidget(surveyToRender);
        }
      }
    })
    .catch(function(err) {});
  }

  function attachInteractionListeners() {
    // Scroll Tracking
    window.addEventListener('scroll', function() {
      var h = document.documentElement, b = document.body;
      var st = 'scrollTop' in h ? h.scrollTop : b.scrollTop;
      var sh = 'scrollHeight' in h ? h.scrollHeight : b.scrollHeight;
      var clientH = h.clientHeight || window.innerHeight;
      var percent = Math.min(100, Math.round((st / (sh - clientH)) * 100) || 0);

      if (percent > maxScrollPercent) {
        maxScrollPercent = percent;
        if (maxScrollPercent >= 60 && !hesitationDetected) {
          sendBehaviorEvent({ eventType: 'scroll_depth', scrollPercent: maxScrollPercent });
        }
      }
    }, { passive: true });

    // Hesitation Detection (Idling > 20s or Cursor lingering)
    setTimeout(function() {
      if (!isWidgetOpen && !isSurveyCompleted) {
        hesitationDetected = true;
        sendBehaviorEvent({ eventType: 'hesitation', reason: 'time_dwell_20s' });
      }
    }, 20000);

    setTimeout(function() {
      if (!isWidgetOpen && !isSurveyCompleted) {
        hesitationDetected = true;
        sendBehaviorEvent({ eventType: 'hesitation', reason: 'time_dwell_40s' });
      }
    }, 40000);

    // Exit Intent Detection (Mouse moving to top window boundary)
    document.addEventListener('mouseleave', function(e) {
      if (e.clientY <= 15 && !exitIntentDetected && !isWidgetOpen && !isSurveyCompleted) {
        exitIntentDetected = true;
        sendBehaviorEvent({ eventType: 'exit_intent', clientY: e.clientY });
      }
    });

    // Repeated Clicks / Rage Click Detection
    document.addEventListener('click', function(e) {
      var now = Date.now();
      clickTimestamps.push(now);
      clickTimestamps = clickTimestamps.filter(function(t) { return now - t < 1500; });
      if (clickTimestamps.length >= 3) {
        repeatedClicksCount = clickTimestamps.length;
        sendBehaviorEvent({ eventType: 'rage_clicks', clickCount: repeatedClicksCount });
      }
    });
  }

  // ---------------------------------------------------------------------------------
  // 8. RENDER MICRO-SURVEY WIDGET IN CONNECTED WEBSITE
  // ---------------------------------------------------------------------------------
  function renderSurveyWidget(survey) {
    if (document.getElementById('customerlens-survey-widget') || isSurveyCompleted) return;
    isWidgetOpen = true;

    var container = document.createElement('div');
    container.id = 'customerlens-survey-widget';

    var bgColor = (survey.colors && survey.colors.background) || '#0B1320';
    var textColor = (survey.colors && survey.colors.text) || '#FFFFFF';
    var accentColor = (survey.colors && survey.colors.accent) || '#008060';
    var questionText = survey.question || (survey.questions && survey.questions[0] && survey.questions[0].questionText) || 'What is stopping you from continuing?';
    var headlineText = survey.headline || 'Quick question';

    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;width:380px;max-width:calc(100vw - 32px);background:' + bgColor + ';color:' + textColor + ';border:1px solid rgba(255,255,255,0.12);border-radius:18px;box-shadow:0 24px 48px -12px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.06);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:22px;box-sizing:border-box;transition:all 0.35s cubic-bezier(0.16, 1, 0.3, 1);animation:clSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);';

    var styleTag = document.createElement('style');
    styleTag.innerHTML = '@keyframes clSlideIn { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } } ' +
      '#customerlens-survey-widget * { box-sizing: border-box; } ' +
      '#customerlens-survey-widget textarea:focus { border-color:' + accentColor + ' !important; outline:none; } ' +
      '#customerlens-survey-widget button:active { transform: scale(0.98); }';
    document.head.appendChild(styleTag);

    container.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
      '<div style="display:flex;align-items:center;gap:7px;">' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + accentColor + ';box-shadow:0 0 8px ' + accentColor + ';"></span>' +
        '<span style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:' + accentColor + ';">' + headlineText + '</span>' +
      '</div>' +
      '<button id="cl-close-btn" style="background:transparent;border:none;color:' + textColor + ';opacity:0.6;font-size:20px;cursor:pointer;line-height:1;padding:2px 4px;border-radius:6px;">&times;</button>' +
    '</div>' +
    '<h3 style="margin:0 0 14px 0;font-size:15px;font-weight:600;line-height:1.4;color:' + textColor + ';">' + questionText + '</h3>' +
    '<div id="cl-widget-body">' +
      '<form id="cl-survey-form" style="display:flex;flex-direction:column;gap:10px;">' +
        '<textarea id="cl-answer-input" rows="2" placeholder="Type answer..." required style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:10px 12px;color:' + textColor + ';font-size:13px;resize:none;font-family:inherit;line-height:1.4;"></textarea>' +
        '<button type="submit" id="cl-submit-btn" style="width:100%;background:' + accentColor + ';color:#ffffff;border:none;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s ease;">Send Answer</button>' +
      '</form>' +
    '</div>';

    document.body.appendChild(container);

    var closeBtn = document.getElementById('cl-close-btn');
    if (closeBtn) {
      closeBtn.onclick = function() {
        container.style.opacity = '0';
        container.style.transform = 'translateY(16px)';
        setTimeout(function() { container.remove(); }, 350);
        isWidgetOpen = false;
        isSurveyCompleted = true;
      };
    }

    var form = document.getElementById('cl-survey-form');
    if (form) {
      form.onsubmit = function(e) {
        e.preventDefault();
        var answerInput = document.getElementById('cl-answer-input');
        var submitBtn = document.getElementById('cl-submit-btn');
        var answerVal = answerInput ? answerInput.value.trim() : '';

        if (!answerVal) return;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }

        // Send Survey Response to Backend
        fetch(endpoint + '/api/survey-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId: siteId,
            surveyId: survey.id || survey.surveyId || 'survey_123',
            sessionId: sessionId,
            answer: answerVal,
            page: currentPage,
            question: questionText
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var aiReply = (data && data.reply) ? data.reply : 'Which part felt unclear?';
          renderAiFollowUp(aiReply, answerVal);
        })
        .catch(function(err) {
          renderAiFollowUp('Which part of the pricing or features felt unclear?', answerVal);
        });
      };
    }

    function renderAiFollowUp(firstAiQuestion, visitorFirstAnswer) {
      var bodyEl = document.getElementById('cl-widget-body');
      if (!bodyEl) return;

      var conversationHistory = [
        { role: 'user', content: visitorFirstAnswer },
        { role: 'assistant', content: firstAiQuestion }
      ];

      bodyEl.innerHTML = '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-bottom:12px;">' +
        '<div style="font-size:11px;font-weight:700;color:' + accentColor + ';margin-bottom:4px;display:flex;align-items:center;gap:4px;">' +
          '<span>CustomerLens AI</span>' +
        '</div>' +
        '<div id="cl-ai-message-text" style="font-size:13px;line-height:1.45;color:' + textColor + ';">' + firstAiQuestion + '</div>' +
      '</div>' +
      '<form id="cl-followup-form" style="display:flex;gap:8px;">' +
        '<input type="text" id="cl-followup-text" placeholder="Type answer..." required style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:9px 12px;color:' + textColor + ';font-size:13px;outline:none;font-family:inherit;" />' +
        '<button type="submit" id="cl-followup-btn" style="background:' + accentColor + ';color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;">Reply</button>' +
      '</form>';

      var followUpInput = document.getElementById('cl-followup-text');
      if (followUpInput) followUpInput.focus();

      var followUpForm = document.getElementById('cl-followup-form');
      if (followUpForm) {
        followUpForm.onsubmit = function(ev) {
          ev.preventDefault();
          var input = document.getElementById('cl-followup-text');
          var btn = document.getElementById('cl-followup-btn');
          var text = input ? input.value.trim() : '';
          if (!text) return;

          if (btn) {
            btn.disabled = true;
            btn.textContent = '...';
          }

          conversationHistory.push({ role: 'user', content: text });

          fetch(endpoint + '/api/survey-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteId: siteId,
              surveyId: survey.id || survey.surveyId || 'survey_123',
              sessionId: sessionId,
              newMessage: text,
              answer: text,
              history: conversationHistory,
              page: currentPage
            })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            // Completion State
            bodyEl.innerHTML = '<div style="text-align:center;padding:16px 8px;">' +
              '<div style="width:36px;height:36px;border-radius:50%;background:' + accentColor + ';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;">✓</div>' +
              '<h4 style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:' + textColor + ';">Thank you for your feedback.</h4>' +
              '<p style="margin:0;font-size:12px;opacity:0.75;color:' + textColor + ';">Your feedback helps us continuously improve this experience.</p>' +
            '</div>';

            setTimeout(function() {
              container.style.opacity = '0';
              container.style.transform = 'translateY(16px)';
              setTimeout(function() { container.remove(); }, 400);
              isWidgetOpen = false;
              isSurveyCompleted = true;
            }, 2500);
          })
          .catch(function() {
            bodyEl.innerHTML = '<div style="text-align:center;padding:16px 8px;">' +
              '<h4 style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:' + textColor + ';">Thank you for your feedback.</h4>' +
            '</div>';
            setTimeout(function() { container.remove(); isWidgetOpen = false; }, 2000);
          });
        };
      }
    }
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

  // -----------------------------------------------------------------------------------
  // 2. GET WIDGET CONFIGURATION (GET /api/tracker/config or /api/widget-config)
  // -----------------------------------------------------------------------------------
  if ((pathname === '/api/tracker/config' || pathname === '/api/widget-config') && request.method === 'GET') {
    const url = new URL(request.url);
    const siteId = url.searchParams.get('site_id') || url.searchParams.get('siteId') || '';
    const page = url.searchParams.get('page') || '/';

    if (!siteId) {
      return jsonResponse({
        siteId,
        enabled: false,
        error: 'Missing site_id parameter.',
        surveys: []
      }, 400);
    }

    // Look up Site/Workspace in DB
    const siteInfo = await db.getSiteById(siteId);
    if (!siteInfo) {
      return jsonResponse({
        siteId,
        enabled: false,
        error: 'Site ID not found or inactive. Register your website domain in CustomerLens dashboard.',
        surveys: []
      }, 404);
    }

    if (siteInfo.status === 'PAUSED' || siteInfo.status === 'UNVERIFIED' || siteInfo.verified === false) {
      return jsonResponse({
        siteId,
        enabled: false,
        error: 'Domain is unverified or survey is paused in CustomerLens.',
        surveys: []
      });
    }

    // Look up active survey strictly for this site_id
    let activeSurvey = await storage.kvGet<SurveyConfig>(`active_survey:${siteId}`);
    if (!activeSurvey) {
      activeSurvey = await db.getSurveyBySiteId(siteId);
    }

    if (!activeSurvey) {
      return jsonResponse({
        siteId,
        enabled: false,
        error: 'No active survey configured for this site_id.',
        surveys: []
      });
    }

    const defaultQuestion = (activeSurvey.questions && activeSurvey.questions[0]?.questionText) ||
      activeSurvey.headline ||
      'What is stopping you from continuing?';

    const surveys = [
      {
        surveyId: activeSurvey.id || `survey_${siteId}`,
        question: defaultQuestion,
        headline: activeSurvey.headline || 'Quick question',
        pages: ['*', '/pricing', page],
        aiEnabled: true,
        maxFollowUps: 3,
        colors: activeSurvey.colors || {
          background: '#0B1320',
          text: '#ffffff',
          accent: '#008060'
        }
      }
    ];

    return jsonResponse({
      siteId,
      enabled: true,
      surveys
    });
  }

  // -----------------------------------------------------------------------------------
  // 3. VISITOR BEHAVIOR TELEMETRY & TRIGGER ENGINE (POST /api/events or /api/events/track)
  // -----------------------------------------------------------------------------------
  if ((pathname === '/api/events' || pathname === '/api/events/track') && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;

    const siteId = body.site_id || body.siteId || '';
    const sessionId = body.session_id || body.sessionId || 'session_xyz';
    const page = body.page || body.pageUrl || '/';
    const timeOnPage = typeof body.time_on_page === 'number' ? body.time_on_page : (typeof body.timeOnPage === 'number' ? body.timeOnPage : 0);
    const scrollDepth = typeof body.scroll_depth === 'number' ? body.scroll_depth : (typeof body.scrollDepth === 'number' ? body.scrollDepth : (body.payload?.scrollPercent || 0));
    const hesitation = Boolean(body.hesitation || body.eventType === 'hesitation' || body.event === 'hesitation');
    const repeatedClicks = typeof body.repeatedClicks === 'number' ? body.repeatedClicks : (body.eventType === 'rage_clicks' || body.event === 'rage_clicks' ? 3 : 0);
    const exitIntent = Boolean(body.exitIntent || body.eventType === 'exit_intent' || body.event === 'exit_intent');
    const eventType = body.event || body.eventType || 'behavior_update';

    if (!siteId) {
      return jsonResponse({ recorded: false, error: 'Missing site_id' }, 400);
    }

    const siteInfo = await db.getSiteById(siteId);
    if (!siteInfo) {
      return jsonResponse({ recorded: false, error: 'Site not recognized' }, 404);
    }

    // 1. Record event to Database
    const event: TrackingEvent = {
      id: 'evt_' + crypto.randomUUID().substring(0, 8),
      siteId,
      sessionId,
      eventType,
      pageUrl: body.pageUrl || body.page || page,
      referrer: body.referrer || '',
      timestamp: new Date().toISOString(),
      timeOnPage,
      device: body.device || 'Desktop',
      browser: body.browser || 'Browser',
      payload: {
        scrollDepth,
        hesitation,
        repeatedClicks,
        exitIntent,
        ...body.payload
      }
    };

    await db.recordEvent(event);
    await storage.r2PutLog(`events/${siteId}/${event.id}.json`, event);

    // 2. Rule-Based Trigger Check (Using persistent KV session store)
    const sessionStateKey = `session_trigger:${siteId}:${sessionId}`;
    const sessionState = await storage.kvGet<{ surveyShown: boolean; responsesCount: number; lastTriggerTime: number }>(sessionStateKey);
    if (sessionState?.surveyShown) {
      return jsonResponse({
        recorded: true,
        action: 'DONT_SHOW',
        reason: 'Survey already shown in this session.'
      });
    }

    // If visitor just arrived and shows no exit intent or rage clicks -> wait
    if (timeOnPage < 5 && !exitIntent && repeatedClicks < 2) {
      return jsonResponse({
        recorded: true,
        action: 'WAIT',
        reason: 'Visitor just arrived.'
      });
    }

    // 3. Determine if behavior is significant
    const isSignificant =
      exitIntent ||
      hesitation ||
      repeatedClicks >= 2 ||
      timeOnPage >= 35 ||
      scrollDepth >= 70;

    if (!isSignificant) {
      return jsonResponse({
        recorded: true,
        action: 'WAIT',
        reason: 'Monitoring visitor browsing activity.'
      });
    }

    // Retrieve available survey for page
    let activeSurvey = await storage.kvGet<SurveyConfig>(`active_survey:${siteId}`);
    if (!activeSurvey) {
      activeSurvey = await db.getSurveyBySiteId(siteId);
    }

    const availableSurvey = {
      surveyId: activeSurvey?.id || 'survey_123',
      question: (activeSurvey?.questions && activeSurvey.questions[0]?.questionText) || 'What is stopping you from continuing?',
      headline: activeSurvey?.headline || 'Quick question',
      colors: activeSurvey?.colors || { background: '#0B1320', text: '#ffffff', accent: '#008060' }
    };

    // 4. OpenAI AI Trigger Decision
    const openai = new OpenAIService(env);
    const aiDecision = await openai.evaluateBehaviorSummary(
      siteId,
      page,
      { timeOnPage, scrollDepth, hesitation, repeatedClicks, exitIntent },
      availableSurvey
    );

    if (aiDecision.decision === 'SHOW') {
      await storage.kvPut(sessionStateKey, { surveyShown: true, responsesCount: 0, lastTriggerTime: Date.now() }, 86400);
      return jsonResponse({
        recorded: true,
        action: 'SHOW_SURVEY',
        surveyId: availableSurvey.surveyId,
        survey: availableSurvey,
        decision: 'SHOW',
        reason: aiDecision.reason
      });
    }

    return jsonResponse({
      recorded: true,
      action: 'WAIT',
      decision: aiDecision.decision,
      reason: aiDecision.reason
    });
  }

  // -----------------------------------------------------------------------------------
  // 4. VISITOR SURVEY RESPONSE, OPENAI INDIVIDUAL ANALYSIS & MULTI-RESPONSE PATTERN RECOGNITION
  // -----------------------------------------------------------------------------------
  if ((pathname === '/api/survey-response' || pathname === '/api/events/survey-response') && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const url = new URL(request.url);
    const siteId = body.site_id || body.siteId || url.searchParams.get('site_id') || url.searchParams.get('siteId') || '';
    if (!siteId) {
      return jsonResponse({ error: 'site_id is required to record a response' }, 400);
    }
    const surveyId = body.survey_id || body.surveyId || 'survey_active';
    const sessionId = body.session_id || body.sessionId || ('sess_' + crypto.randomUUID().substring(0, 8));
    const answer = body.answer || (body.answers && body.answers[0]?.answer) || '';
    const question = body.question || 'What is stopping you from continuing?';
    const pageUrl = body.page || body.pageUrl || '/';

    const openai = new OpenAIService(env);

    // 1. OpenAI analyzes this response individually and classifies the business signal
    const aiSignal = await openai.analyzeIndividualResponse({
      answer,
      question,
      pageUrl,
      sessionId,
      visitorMeta: body.visitorMeta,
      websiteContext: { name: body.businessName || siteId, type: 'ecommerce' }
    });

    // 2. Save Response & AI Signal in Database
    const responseRecord: SurveyResponse = {
      id: 'resp_' + crypto.randomUUID().substring(0, 8),
      siteId,
      surveyId,
      sessionId,
      answers: body.answers || [{ questionId: 'q1', questionText: question, answer }],
      pageUrl,
      visitorMeta: {
        sessionId,
        submittedAt: new Date().toISOString(),
        aiSignal
      },
      timestamp: new Date().toISOString(),
      aiSignal
    };

    await db.recordResponse(responseRecord);

    // 3. Notify workspace owner if individual response is critical or needs urgent attention
    if (aiSignal.importance === 'high' || aiSignal.importance === 'critical' || aiSignal.needs_attention === true) {
      try {
        const siteInfo = await db.getSiteById(siteId);
        if (siteInfo && siteInfo.userId) {
          const notifService = new NotificationService(env);
          await notifService.sendNotification(
            siteInfo.userId,
            `High Impact Feedback on ${siteInfo.name || siteId}`,
            `AI classified: [${aiSignal.category.toUpperCase()}] "${answer}" - Business signal: ${aiSignal.signal}`,
            aiSignal.importance === 'critical' ? 'alert' : 'info'
          );
        }
      } catch (nErr: any) {
        Logger.warn('Notification dispatch error on individual response:', nErr.message);
      }
    }

    // 4. CustomerLens Backend compares signals over time & detects repeated patterns
    try {
      const recentResponses = await db.getRecentResponses(siteId, 25);
      const recentSignals: ResponseSignal[] = recentResponses
        .map(r => r.aiSignal || r.visitorMeta?.aiSignal)
        .filter((s): s is ResponseSignal => Boolean(s));

      const detectedPattern = await openai.detectMultiResponsePattern(recentSignals, { siteId });

      if (detectedPattern && detectedPattern.patternDetected && detectedPattern.triggerNotification) {
        const siteInfo = await db.getSiteById(siteId);
        if (siteInfo && siteInfo.userId) {
          const notifService = new NotificationService(env);
          await notifService.sendNotification(
            siteInfo.userId,
            detectedPattern.title,
            `${detectedPattern.summary} Action: ${detectedPattern.recommendation}`,
            detectedPattern.severity === 'critical' ? 'alert' : 'info'
          );
          Logger.info('Multi-response pattern recognized and owner notified:', {
            siteId,
            title: detectedPattern.title,
            category: detectedPattern.category,
            affectedCount: detectedPattern.affectedSignalsCount
          });
        }
      }
    } catch (err: any) {
      Logger.warn('Multi-response pattern evaluation error:', err.message);
    }

    // 5. Call OpenAI for short diplomatic follow-up question (Max 15 words)
    const followUp = await openai.generateShortDiplomaticFollowUp(answer, question, body.history);

    Logger.info('Response saved with AI classification signal:', {
      siteId,
      answer,
      importance: aiSignal.importance,
      category: aiSignal.category,
      business_impact: aiSignal.business_impact
    });

    return jsonResponse({
      recorded: true,
      saved: true,
      siteId,
      responseId: responseRecord.id,
      aiSignal,
      followup: followUp.reply,
      reply: followUp.reply,
      continue: followUp.continue,
      followUpCount: 1
    });
  }

  // -----------------------------------------------------------------------------------
  // 5. CONVERSATIONAL AI SURVEY CHAT & CONCLUSION (POST /api/survey-chat)
  // -----------------------------------------------------------------------------------
  if ((pathname === '/api/survey-chat' || pathname === '/api/events/survey-chat') && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as any;
    const { siteId, sessionId, surveyId, newMessage, answer, history } = body;
    if (!siteId) {
      return jsonResponse({ error: 'siteId is mandatory' }, 400);
    }
    const messageText = newMessage || answer || '';

    // Record interaction in DB
    const chatEvent: TrackingEvent = {
      id: 'evt_chat_' + crypto.randomUUID().substring(0, 8),
      siteId: siteId,
      sessionId: sessionId || 'session_xyz',
      eventType: 'ai_survey_chat',
      pageUrl: body.page || '',
      referrer: '',
      timestamp: new Date().toISOString(),
      timeOnPage: 0,
      device: 'Desktop',
      browser: 'Web',
      payload: { userMessage: messageText, surveyId, history }
    };
    await db.recordEvent(chatEvent);

    return jsonResponse({
      recorded: true,
      reply: 'Thank you for your feedback.',
      continue: false,
      conversationComplete: true
    });
  }

  return new Response('Not Found', { status: 404 });
}

