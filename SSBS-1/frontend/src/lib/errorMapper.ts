// @ts-nocheck
// ── API error mapping — converts axios/API errors to user-friendly messages ──

import { AxiosError } from 'axios';
import type { ApiError, ApiErrorCode, DrfValidationErrors } from '../types/api';

/** Maps backend error codes to human-friendly messages */
const ERROR_MESSAGES: Record<ApiErrorCode | string, string> = {
  lifecycle_error: 'This action is not allowed in the current state.',
  freeze_error: 'This resource is in use and cannot be modified.',
  capacity_error: 'No seats available — the bus is full.',
  integrity_error: 'Cannot delete — this resource has dependencies.',
  domain_error: 'A business rule prevented this action.',
};

export interface ParsedApiError {
  message: string;
  code: string | null;
  status: number;
  validation: Record<string, string[]>;
}

/**
 * Extract a clean error from an Axios error response.
 * Works with the Fleetmark backend's `{ error, code }` format.
 */
export function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;

    // Backend custom error format: { error: "...", code: "..." }
    if (data && typeof data === 'object' && 'error' in data) {
      const apiErr = data as ApiError;
      return {
        message: ERROR_MESSAGES[apiErr.code ?? ''] || apiErr.error || 'Something went wrong.',
        code: apiErr.code ?? null,
        status,
        validation: {},
      };
    }

    // DRF default format: { detail: "..." }
    if (data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string') {
      return { message: data.detail, code: null, status, validation: {} };
    }

    // DRF validation errors: { field: ["error1", "error2"] }
    if (data && typeof data === 'object') {
      const messages: string[] = [];
      const validation = normalizeValidationErrors(data as DrfValidationErrors);

      for (const [field, errors] of Object.entries(validation)) {
        messages.push(`${field}: ${errors.join(', ')}`);
      }

      if (messages.length) {
        return { message: messages.join('. '), code: null, status, validation };
      }
    }

    // Simple string error
    if (typeof data === 'string') {
      return { message: data, code: null, status, validation: {} };
    }

    // Generic HTTP status messages
    const httpMessages: Record<number, string> = {
      400: 'Bad request — please check your input.',
      401: 'Session expired — please log in again.',
      403: 'You do not have permission for this action.',
      404: 'Resource not found.',
      409: 'Conflict — this action cannot be completed.',
      500: 'Server error — please try again later.',
    };

    return {
      message: httpMessages[status] || `Request failed (${status})`,
      code: null,
      status,
      validation: {},
    };
  }

  // Network / timeout errors
  if (error instanceof AxiosError && !error.response) {
    return {
      message: error.code === 'ECONNABORTED'
        ? 'Request timed out — please try again.'
        : 'Network error — please check your connection.',
      code: null,
      status: 0,
      validation: {},
    };
  }

  // Fallback
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    code: null,
    status: 0,
    validation: {},
  };
}

/** Convenience wrapper — returns just the message string */
export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

export function getValidationErrors(error: unknown): Record<string, string[]> {
  return parseApiError(error).validation;
}

function normalizeValidationErrors(data: DrfValidationErrors): Record<string, string[]> {
  const normalized: Record<string, string[]> = {};

  for (const [field, errors] of Object.entries(data)) {
    if (!errors) {
      continue;
    }

    if (Array.isArray(errors)) {
      normalized[field] = errors.map(String);
      continue;
    }

    if (typeof errors === 'string') {
      normalized[field] = [errors];
    }
  }

  return normalized;
}
