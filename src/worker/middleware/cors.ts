export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Shopify-Hmac-Sha256, X-Site-Id',
  'Access-Control-Max-Age': '86400'
};

export function handleCorsPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
