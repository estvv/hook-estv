import { v4 as uuidv4 } from 'uuid';

export interface Hook {
  id: string;
  slug: string;
  name: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface Request {
  id: string;
  hookId: string;
  method: string;
  path: string;
  query: Record<string, string> | null;
  headers: Record<string, string>;
  body: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// In-memory storage
const hooks = new Map<string, Hook>();
const requests = new Map<string, Request[]>();

// Cleanup expired hooks every hour
setInterval(() => {
  const now = new Date();
  for (const [slug, hook] of hooks.entries()) {
    if (hook.expiresAt < now) {
      hooks.delete(slug);
      requests.delete(hook.id);
      console.log(`Cleaned up expired hook: ${slug}`);
    }
  }
}, 60 * 60 * 1000);

export function createHook(name?: string): Hook {
  const id = uuidv4();
  const slug = uuidv4().substring(0, 8);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  
  const hook: Hook = {
    id,
    slug,
    name: name || null,
    createdAt: now,
    expiresAt
  };
  
  hooks.set(slug, hook);
  requests.set(id, []);
  
  return hook;
}

export function getHookBySlug(slug: string): Hook | undefined {
  return hooks.get(slug);
}

export function getHookById(id: string): Hook | undefined {
  for (const hook of hooks.values()) {
    if (hook.id === id) return hook;
  }
  return undefined;
}

export function createRequest(
  hookId: string,
  method: string,
  path: string,
  query: Record<string, string> | null,
  headers: Record<string, string>,
  body: any,
  ipAddress: string | null,
  userAgent: string | null
): Request {
  const hookRequests = requests.get(hookId) || [];
  
  const request: Request = {
    id: uuidv4(),
    hookId,
    method,
    path,
    query,
    headers,
    body,
    ipAddress,
    userAgent,
    createdAt: new Date()
  };
  
  hookRequests.unshift(request); // Add to beginning
  requests.set(hookId, hookRequests);
  
  return request;
}

export function getRequestsByHookId(hookId: string, limit: number = 50, offset: number = 0): Request[] {
  const hookRequests = requests.get(hookId) || [];
  return hookRequests.slice(offset, offset + limit);
}

export function deleteHook(slug: string): void {
  const hook = hooks.get(slug);
  if (hook) {
    hooks.delete(slug);
    requests.delete(hook.id);
  }
}

export function cleanupExpiredHooks(): void {
  const now = new Date();
  let count = 0;
  
  for (const [slug, hook] of hooks.entries()) {
    if (hook.expiresAt < now) {
      hooks.delete(slug);
      requests.delete(hook.id);
      count++;
    }
  }
  
  console.log(`Cleaned up ${count} expired hooks`);
}