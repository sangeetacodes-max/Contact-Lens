import { Survey, VisitorSession, VisitorEvent, store } from '../db/schema';

export interface TriggerEvaluationResult {
  shouldShow: boolean;
  survey?: Survey;
  reason?: string;
  triggerType?: string;
  confidence?: number;
}

export class TriggerEngine {
  /**
   * Evaluates whether a survey should be triggered for the visitor session based on real behavior telemetry
   */
  public evaluate(
    session: VisitorSession,
    event: VisitorEvent,
    surveys: Survey[],
    answeredSurveyIds: string[] = []
  ): TriggerEvaluationResult {
    // Only published surveys can trigger
    const activeSurveys = surveys.filter(
      s => s.status === 'published' && !answeredSurveyIds.includes(s.id)
    );

    if (activeSurveys.length === 0) {
      return { shouldShow: false, reason: 'No active eligible surveys for this site.' };
    }

    const currentPage = (session.current_page || event.page || '').toLowerCase();
    const isPricingPage = currentPage.includes('pricing') || currentPage.includes('plan') || currentPage.includes('tier');
    const isCheckoutPage = currentPage.includes('checkout') || currentPage.includes('cart') || currentPage.includes('pay') || currentPage.includes('order');

    for (const survey of activeSurveys) {
      const triggers = survey.triggers || {};

      // 1. RULE: Target Page Filter (if specified)
      if (triggers.target_pages && triggers.target_pages.length > 0) {
        const matchesTarget = triggers.target_pages.some(pageRule => {
          const rule = pageRule.trim().toLowerCase();
          if (rule === '*' || rule === '/*') return true;
          return currentPage.includes(rule) || rule.includes(currentPage);
        });
        if (!matchesTarget) continue;
      }

      // 2. RULE: Exit Intent Trigger
      if (triggers.exit_intent && (event.event_type === 'exit_intent' || event.payload?.exitIntent)) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'exit_intent',
          reason: 'Visitor exhibited exit-intent gesture towards the browser top bar or tab closing.',
          confidence: 0.95
        };
      }

      // 3. RULE: Checkout Abandonment
      if (isCheckoutPage && (event.event_type === 'exit_intent' || session.time_on_page >= 20 || event.payload?.exitIntent)) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'checkout_abandonment',
          reason: 'Visitor hesitated or attempted exit on checkout/cart page.',
          confidence: 0.92
        };
      }

      // 4. RULE: Pricing Page Dwell Time (>45s or configured threshold)
      const dwellPricingThreshold = triggers.dwell_time_pricing || 45;
      if (isPricingPage && session.time_on_page >= dwellPricingThreshold) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'pricing_dwell',
          reason: `Visitor spent ${session.time_on_page}s (> ${dwellPricingThreshold}s) evaluating pricing options.`,
          confidence: 0.90
        };
      }

      // 5. RULE: 3+ Pricing Page Visits
      const pricingVisitThreshold = triggers.pricing_visit_count || 3;
      if (isPricingPage && (session.pricing_visits >= pricingVisitThreshold || session.visit_count >= pricingVisitThreshold)) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'repeated_pricing_visits',
          reason: `Visitor visited pricing page ${session.pricing_visits || session.visit_count} times without converting.`,
          confidence: 0.94
        };
      }

      // 6. RULE: Rage Clicking (frustration indicator)
      if (triggers.rage_clicks && (session.rage_clicks >= 2 || event.event_type === 'rage_click' || (event.payload?.rageClicks && event.payload.rageClicks >= 2))) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'rage_clicking',
          reason: 'Visitor experienced repeated rapid clicks / UX friction on page element.',
          confidence: 0.88
        };
      }

      // 7. RULE: Long Hesitation on Decision Elements
      if (triggers.hesitation && (session.hesitation || event.event_type === 'hesitation' || session.time_on_page >= 35)) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'hesitation',
          reason: 'Visitor paused interaction for over 20s without scrolling or clicking.',
          confidence: 0.85
        };
      }

      // 8. RULE: Generic Scroll Depth Trigger (e.g. scrolled > 60%)
      if (triggers.scroll_depth && session.scroll_depth >= triggers.scroll_depth) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'scroll_depth',
          reason: `Visitor reached ${session.scroll_depth}% scroll depth on ${currentPage}.`,
          confidence: 0.80
        };
      }

      // 9. RULE: Generic Time on Page Trigger (e.g. > 15s)
      if (triggers.time_on_page && session.time_on_page >= triggers.time_on_page) {
        return {
          shouldShow: true,
          survey,
          triggerType: 'time_on_page',
          reason: `Visitor engaged on page for ${session.time_on_page} seconds.`,
          confidence: 0.82
        };
      }
    }

    return {
      shouldShow: false,
      reason: 'No trigger conditions met for current visitor behavior.'
    };
  }
}

export const triggerEngine = new TriggerEngine();
