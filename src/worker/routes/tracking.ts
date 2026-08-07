import { Env, TrackingEvent, SurveyResponse } from '../types';
import { DatabaseService } from '../services/db';
import { StorageService } from '../services/storage';
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

  function sendEvent(eventType, payload) {
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
          if (resData && resData.data && resData.data.triggerSurvey && !document.getElementById('customerlens-survey-widget')) {
            renderSurveyWidget(resData.data.triggerSurvey);
          }
        }).catch(function(err){});
    } catch(e) {}
  }

  // 1. Initial Pageview
  sendEvent('pageview');

  // 2. Scroll Depth Tracker
  window.addEventListener('scroll', function() {
    var h = document.documentElement, b = document.body;
    var st = 'scrollTop' in h ? h.scrollTop : b.scrollTop;
    var sh = 'scrollHeight' in h ? h.scrollHeight : b.scrollHeight;
    var percent = Math.round((st / (sh - h.clientHeight)) * 100) || 0;
    if (percent > maxScrollPercent) {
      maxScrollPercent = percent;
      if (maxScrollPercent >= 50 && maxScrollPercent - 25 < percent) {
        sendEvent('scroll_depth', { scrollPercent: maxScrollPercent });
      }
    }
  }, { passive: true });

  // 3. Exit Intent Tracker
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 10 && !exitIntentTriggered) {
      exitIntentTriggered = true;
      sendEvent('exit_intent', { clientY: e.clientY });
    }
  });

  // 4. Cart / Checkout Action Tracker
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (target) {
      var text = (target.innerText || target.value || '').toLowerCase();
      if (text.includes('cart') || text.includes('checkout') || text.includes('buy') || text.includes('pricing')) {
        sendEvent('cart_action', { action: text.substring(0, 40) });
      }
    }
  });

  function renderSurveyWidget(survey) {
    if (document.getElementById('customerlens-survey-widget')) return;
    var container = document.createElement('div');
    container.id = 'customerlens-survey-widget';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;width:380px;max-width:90vw;background:' + (survey.colors?.background || '#09090b') + ';color:' + (survey.colors?.text || '#ffffff') + ';border:1px solid rgba(255,255,255,0.15);border-radius:16px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);font-family:system-ui,sans-serif;padding:20px;box-sizing:border-box;transition:all 0.3s ease;';

    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
      '<div style="font-size:11px;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;color:' + (survey.colors?.accent || '#3b82f6') + ';">CustomerLens AI</div>' +
      '<button id="cl-close-btn" style="background:none;border:none;color:inherit;font-size:18px;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<h3 style="margin:0 0 16px 0;font-size:15px;font-weight:700;">' + (survey.headline || 'Help us improve!') + '</h3>' +
      '<form id="cl-survey-form" style="display:flex;flex-direction:column;gap:12px;">';

    (survey.questions || []).forEach(function(q, i) {
      html += '<div><label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px;">' + (i+1) + '. ' + q.questionText + '</label>';
      if (q.type === 'multiple-choice' && q.options) {
        q.options.forEach(function(opt) {
          html += '<label style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:4px;cursor:pointer;"><input type="radio" name="q_' + q.id + '" value="' + opt.replace(/"/g, '&quot;') + '" required/> ' + opt + '</label>';
        });
      } else {
        html += '<textarea name="q_' + q.id + '" rows="2" style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:inherit;border-radius:8px;padding:8px;font-size:12px;" placeholder="Type your answer..."></textarea>';
      }
      html += '</div>';
    });

    html += '<button type="submit" style="background:' + (survey.colors?.accent || '#3b82f6') + ';color:#ffffff;border:none;padding:10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;margin-top:8px;">Submit Feedback</button></form>';

    container.innerHTML = html;
    document.body.appendChild(container);

    document.getElementById('cl-close-btn').onclick = function() { container.remove(); };

    document.getElementById('cl-survey-form').onsubmit = function(e) {
      e.preventDefault();
      var formData = new FormData(this);
      var answers = [];
      formData.forEach(function(val, key) { answers.push({ questionId: key.replace('q_', ''), answer: val }); });
      fetch(endpoint + '/api/events/survey-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: siteId, surveyId: survey.id || 'surv_live', answers: answers, pageUrl: window.location.href, timestamp: new Date().toISOString() })
      });
      container.innerHTML = '<div style="text-align:center;padding:24px 16px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 10px 25px rgba(0,0,0,0.08);"><div style="width:48px;height:48px;background:#dcfce7;color:#16a34a;border-radius:9999px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;font-weight:bold;">✓</div><div style="font-weight:900;font-size:18px;color:#0f172a;letter-spacing:-0.02em;margin-bottom:16px;">THANK YOU!</div><button type="button" onclick="this.parentElement.remove();" style="width:100%;padding:10px;background:#0f172a;color:#ffffff;border:none;border-radius:10px;font-weight:800;font-size:12px;cursor:pointer;">Close</button></div>';
      setTimeout(function() { container.remove(); }, 3000);
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
    const body = await request.json() as any;

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
    if (event.eventType === 'exit_intent' || (event.eventType === 'cart_action' && event.pageUrl.includes('cart'))) {
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
    const body = await request.json() as any;

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

  return new Response('Not Found', { status: 404 });
}
