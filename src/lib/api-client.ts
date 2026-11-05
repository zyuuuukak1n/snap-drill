import { TestSet, Question } from '@/types';
import { loadAllTestSets, saveTestSet as saveLocalTestSet, deleteTestSet as deleteLocalTestSet } from './storage';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function fetchUserTestSets(isLoggedIn: boolean): Promise<TestSet[]> {
  if (isLoggedIn) {
    try {
      const res = await fetch('/api/tests', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.testSets || [];
      }
    } catch (err) {
      console.error('Failed to fetch from server API:', err);
    }
  }
  return loadAllTestSets();
}

export async function fetchTestSetById(id: string, isLoggedIn: boolean): Promise<TestSet | null> {
  if (isLoggedIn) {
    try {
      const res = await fetch(`/api/tests/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.test || null;
      }
    } catch (err) {
      console.error('Failed to fetch test from server:', err);
    }
  }
  const tests = loadAllTestSets();
  return tests.find((t) => t.id === id) || null;
}

export async function saveTestSetUnified(test: TestSet, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    try {
      await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      });
      return;
    } catch (err) {
      console.error('Failed to save to server:', err);
    }
  }
  saveLocalTestSet(test);
}

export async function updateTestSetUnified(test: TestSet, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    try {
      await fetch(`/api/tests/${test.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
      });
      return;
    } catch (err) {
      console.error('Failed to update to server:', err);
    }
  }
  saveLocalTestSet(test);
}

export async function deleteTestSetUnified(id: string, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    try {
      await fetch(`/api/tests/${id}`, { method: 'DELETE' });
      return;
    } catch (err) {
      console.error('Failed to delete from server:', err);
    }
  }
  deleteLocalTestSet(id);
}

export async function resetTestProgressUnified(id: string, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    try {
      await fetch(`/api/tests/${id}/reset`, { method: 'POST' });
      return;
    } catch (err) {
      console.error('Failed to reset on server:', err);
    }
  }
  const test = loadAllTestSets().find((t) => t.id === id);
  if (test) {
    test.questions = test.questions.map((q) => ({
      ...q,
      status: 'unanswered',
      userDrawing: undefined,
    }));
    saveLocalTestSet(test);
  }
}

