import { ApiResponse } from '../types';

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function jsonResponse<T>(data: T, status = 200, headers: Record<string, string> = {}): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

export function errorResponse(error: ApiError | Error | string, status = 400, headers: Record<string, string> = {}): Response {
  let message = 'An unexpected error occurred';
  let statusCode = status;
  let code = 'INTERNAL_SERVER_ERROR';
  let details: any = undefined;

  if (error instanceof ApiError) {
    message = error.message;
    statusCode = error.statusCode;
    code = error.code;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}
