/**
 * CustomerLens AI Client-Side Tracking & Dynamic Micro-Survey SDK
 * Captures visitor behavioral telemetry and renders contextual exit-intent surveys.
 */
(function() {
  if (window.__CUSTOMERLENS_INITIALIZED__) return;
  window.__CUSTOMERLENS_INITIALIZED__ = true;

  // 1. Resolve Configuration & Site ID from Script Tag
  var scriptTag = document.currentScript ||
    document.querySelector('script[src*="customerlens.js"]') ||
    document.querySelector('script[src*="tracker.js"]') ||
    document.querySelector('script[data-site-id]');

  var siteId = scriptTag ? (scriptTag.getAttribute('data-site-id') || '') : '';
  var endpoint = scriptTag && scriptTag.src ? scriptTag.src.replace(/\/(customerlens|tracker)\.js.*/, '') : window.location.origin;

  if (!endpoint || endpoint === 'null' || endpoint.startsWith('file:')) {
    endpoint = window.location.origin;
  }

  // Session & Telemetry State
  var sessionId = 'cl_sess_' + Math.random().toString(36).substring(2, 11);
  var pageStartTime = Date.now();
  var maxScrollPercent = 0;
  var isExitIntentTriggered = false;
  var isHesitationTriggered = false;
  var clickTimestamps = [];
  var rageClicksCount = 0;
  var isSurveyActive = false;
  var answeredSurveyIds = [];
  var lastEventSentAt = 0;

  // Track Local Visit Count
  var visitKey = 'cl_visits_' + (siteId || 'default');
  var currentVisits = parseInt(localStorage.getItem(visitKey) || '0', 10) + 1;
  try { localStorage.setItem(visitKey, currentVisits.toString()); } catch(e) {}

  // 2. Dispatch Telemetry Event to /api/events
  function sendEvent(eventType, extraPayload) {
    if (!siteId) return;

    var timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
    var body = {
      site_id: siteId,
      siteId: siteId,
      session_id: sessionId,
      sessionId: sessionId,
      event: eventType,
      eventType: eventType,
      page: window.location.pathname || '/',
      pageUrl: window.location.href,
      time_on_page: timeOnPage,
      timeOnPage: timeOnPage,
      scroll_depth: maxScrollPercent,
      scrollDepth: maxScrollPercent,
      hesitation: isHesitationTriggered,
      rage_clicks: rageClicksCount,
      rageClicks: rageClicksCount,
      exit_intent: isExitIntentTriggered,
      exitIntent: isExitIntentTriggered,
      visit_count: currentVisits,
      answeredSurveyIds: answeredSurveyIds,
      payload: extraPayload || {}
    };

    lastEventSentAt = Date.now();

    fetch(endpoint + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.should_show_survey && data.survey && !isSurveyActive) {
        renderSurveyWidget(data.survey);
      }
    })
    .catch(function() {});
  }

  // 3. Render High-Converting Survey Widget
  function renderSurveyWidget(survey) {
    if (isSurveyActive || answeredSurveyIds.indexOf(survey.id) !== -1) return;
    isSurveyActive = true;

    var design = survey.design || {};
    var bg = design.background_color || '#0f172a';
    var textCol = design.text_color || '#ffffff';
    var accentCol = design.accent_color || '#10b981';
    var placement = design.placement || 'Exit Intent Popup';

    var container = document.createElement('div');
    container.id = 'customerlens-widget-root';
    container.style.cssText = [
      'position: fixed',
      placement.includes('Bottom') ? 'bottom: 24px' : 'top: 50%',
      placement.includes('Left') ? 'left: 24px' : (placement.includes('Right') ? 'right: 24px' : 'left: 50%'),
      placement.includes('Popup') || placement.includes('Modal') ? 'transform: translate(-50%, -50%)' : 'transform: none',
      'z-index: 2147483647',
      'max-width: 420px',
      'width: calc(100vw - 32px)',
      'background:' + bg,
      'color:' + textCol,
      'box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
      'border-radius: 16px',
      'padding: 24px',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      'box-sizing: border-box',
      'animation: clFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      'backdrop-filter: blur(8px)'
    ].join(';');

    var styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes clFadeIn { from { opacity: 0; transform: ' + (placement.includes('Popup') ? 'translate(-50%, -46%) scale(0.96)' : 'translateY(12px)') + '; } to { opacity: 1; transform: ' + (placement.includes('Popup') ? 'translate(-50%, -50%) scale(1)' : 'translateY(0)') + '; } }' +
      '.cl-btn-opt { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: inherit; padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; font-size: 14px; cursor: pointer; transition: all 0.15s ease; outline: none; }' +
      '.cl-btn-opt:hover { background: rgba(255,255,255,0.14); border-color: ' + accentCol + '; }' +
      '.cl-input-txt { width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.15); color: inherit; padding: 10px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 12px; outline: none; }' +
      '.cl-input-txt:focus { border-color: ' + accentCol + '; }' +
      '.cl-submit-btn { width: 100%; padding: 12px; border-radius: 10px; background: ' + accentCol + '; color: #ffffff; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: filter 0.15s ease; }' +
      '.cl-submit-btn:hover { filter: brightness(1.1); }' +
      '.cl-close-btn { position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: inherit; opacity: 0.6; cursor: pointer; font-size: 18px; line-height: 1; }' +
      '.cl-close-btn:hover { opacity: 1; }';
    document.head.appendChild(styleTag);

    var questions = survey.questions || [];
    var q = questions[0] || {
      id: 'q1',
      question_text: 'What almost stopped you from completing your purchase today?',
      type: 'multiple-choice',
      options: ['Pricing', 'Missing a feature', 'Need more info', 'Just browsing']
    };

    var contentHtml = [
      '<button class="cl-close-btn" id="cl-close">&times;</button>',
      '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.65; font-weight: 700; margin-bottom: 6px;">CustomerLens Feedback</div>',
      '<h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; line-height: 1.3;">' + (survey.headline || 'Quick question before you go...') + '</h3>',
      '<p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.85; line-height: 1.4;">' + (q.question_text || '') + '</p>',
      '<div id="cl-question-body">'
    ];

    if (q.type === 'multiple-choice' && q.options && q.options.length > 0) {
      q.options.forEach(function(opt) {
        contentHtml.push('<button class="cl-btn-opt" data-ans="' + opt.replace(/"/g, '&quot;') + '">' + opt + '</button>');
      });
    } else {
      contentHtml.push('<textarea class="cl-input-txt" id="cl-text-answer" rows="3" placeholder="Type your answer here..."></textarea>');
      contentHtml.push('<button class="cl-submit-btn" id="cl-submit">Submit Feedback</button>');
    }

    contentHtml.push('</div>');
    container.innerHTML = contentHtml.join('');
    document.body.appendChild(container);

    function closeSurvey() {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      isSurveyActive = false;
      answeredSurveyIds.push(survey.id);
    }

    // Close handler
    var closeBtn = container.querySelector('#cl-close');
    if (closeBtn) closeBtn.onclick = closeSurvey;

    // Submit handler
    function handleAnswer(ansText) {
      if (!ansText || !ansText.trim()) return;

      fetch(endpoint + '/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          survey_id: survey.id,
          session_id: sessionId,
          question_id: q.id,
          question_text: q.question_text,
          answer: ansText.trim(),
          page_url: window.location.href,
          time_to_answer: Math.round((Date.now() - pageStartTime) / 1000)
        })
      }).catch(function() {});

      // Show Thank You
      container.innerHTML = [
        '<div style="text-align: center; padding: 12px 0;">',
        '<div style="width: 44px; height: 44px; border-radius: 50%; background: ' + accentCol + '20; color: ' + accentCol + '; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 12px;">✓</div>',
        '<h4 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 700;">' + (survey.thank_you_message || 'Thank You!') + '</h4>',
        '<p style="margin: 0; font-size: 13px; opacity: 0.75;">Your feedback helps us improve.</p>',
        '</div>'
      ].join('');

      setTimeout(closeSurvey, 2200);
    }

    // Attach button listeners
    var optionBtns = container.querySelectorAll('.cl-btn-opt');
    optionBtns.forEach(function(btn) {
      btn.onclick = function() {
        var ans = btn.getAttribute('data-ans');
        handleAnswer(ans);
      };
    });

    var submitBtn = container.querySelector('#cl-submit');
    if (submitBtn) {
      submitBtn.onclick = function() {
        var textarea = container.querySelector('#cl-text-answer');
        if (textarea && textarea.value) {
          handleAnswer(textarea.value);
        }
      };
    }
  }

  // 4. Behavioral Sensors & Listeners

  // Pageview
  sendEvent('pageview');

  // Scroll Sensor
  window.addEventListener('scroll', function() {
    var totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      var currentPercent = Math.min(100, Math.round((window.scrollY / totalHeight) * 100));
      if (currentPercent > maxScrollPercent) {
        maxScrollPercent = currentPercent;
      }
    }
  }, { passive: true });

  // Rage Click Sensor (Detects 3+ clicks within 800ms)
  document.addEventListener('click', function() {
    var now = Date.now();
    clickTimestamps.push(now);
    clickTimestamps = clickTimestamps.filter(function(t) { return now - t < 800; });
    if (clickTimestamps.length >= 3) {
      rageClicksCount++;
      sendEvent('rage_click', { count: clickTimestamps.length });
      clickTimestamps = [];
    }
  }, { passive: true });

  // Exit Intent Sensor (Desktop Cursor Velocity + Viewport Boundary)
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 15 && !isExitIntentTriggered) {
      isExitIntentTriggered = true;
      sendEvent('exit_intent');
    }
  });

  // Long Hesitation Sensor (Periodic heartbeat at 20s, 45s, 90s)
  var intervals = [20, 45, 90];
  intervals.forEach(function(sec) {
    setTimeout(function() {
      if (!isSurveyActive) {
        isHesitationTriggered = true;
        sendEvent('hesitation', { elapsed: sec });
      }
    }, sec * 1000);
  });

})();
