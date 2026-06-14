import { isAxiosError } from 'axios';
import type { ProblemDetail } from '@/types/api';

export function extractProblem(error: unknown): ProblemDetail | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data;
  if (data && typeof data === 'object' && 'type' in data && 'status' in data) {
    return data as ProblemDetail;
  }
  return null;
}

export function firstFieldError(problem: ProblemDetail, field: string): string | undefined {
  return problem.errors?.[field]?.[0];
}
