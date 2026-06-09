import { Router } from 'express';
import { createHook, getHookBySlug, getRequestsByHookId, deleteHook, createRequest, Request as RequestType } from '../db/index.js';

export function hooksRoutes(): Router {
  const router = Router();
  
  router.post('/hooks', (req, res) => {
    try {
      const { name } = req.body;
      const hook = createHook(name);
      
      res.json({
        id: hook.id,
        slug: hook.slug,
        name: hook.name,
        url: `/hook/${hook.slug}`,
        createdAt: hook.createdAt.toISOString(),
        expiresAt: hook.expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Error creating hook:', error);
      res.status(500).json({ error: 'Failed to create hook' });
    }
  });
  
  router.get('/hooks/:id/requests', (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const requests = getRequestsByHookId(id, limit, offset);
      
      res.json({ requests });
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });
  
  router.get('/hooks/:slug', (req, res) => {
    try {
      const { slug } = req.params;
      const hook = getHookBySlug(slug);
      
      if (!hook) {
        return res.status(404).json({ error: 'Hook not found' });
      }
      
      res.json({
        id: hook.id,
        slug: hook.slug,
        name: hook.name,
        createdAt: hook.createdAt.toISOString(),
        expiresAt: hook.expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Error fetching hook:', error);
      res.status(500).json({ error: 'Failed to fetch hook' });
    }
  });
  
  router.delete('/hooks/:slug', (req, res) => {
    try {
      const { slug } = req.params;
      const hook = getHookBySlug(slug);
      
      if (!hook) {
        return res.status(404).json({ error: 'Hook not found' });
      }
      
      deleteHook(slug);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting hook:', error);
      res.status(500).json({ error: 'Failed to delete hook' });
    }
  });
  
  return router;
}

export function catchAllRoutes(): Router {
  const router = Router();
  
  router.all('/hook/:slug/*', (req, res) => {
    try {
      const { slug } = req.params;
      const hook = getHookBySlug(slug);
      
      if (!hook) {
        return res.status(404).json({ error: 'Hook not found' });
      }
      
      const path = (req.params as any)[0] || '';
      const query = Object.keys(req.query).length > 0 ? req.query as Record<string, string> : null;
      const headers = req.headers as Record<string, string>;
      const body = req.body && Object.keys(req.body).length > 0 ? req.body : null;
      const ipAddress = req.ip || req.connection.remoteAddress || null;
      const userAgent = req.get('user-agent') || null;
      
      const request = createRequest(
        hook.id,
        req.method,
        `/${path}`,
        query,
        headers,
        body,
        ipAddress,
        userAgent
      );
      
      res.json({
        success: true,
        hook: {
          slug: hook.slug,
          name: hook.name
        },
        request: {
          id: request.id,
          method: request.method,
          path: request.path,
          createdAt: request.createdAt.toISOString()
        }
      });
    } catch (error) {
      console.error('Error catching request:', error);
      res.status(500).json({ error: 'Failed to catch request' });
    }
  });
  
  router.all('/hook/:slug', (req, res) => {
    try {
      const { slug } = req.params;
      const hook = getHookBySlug(slug);
      
      if (!hook) {
        return res.status(404).json({ error: 'Hook not found' });
      }
      
      const query = Object.keys(req.query).length > 0 ? req.query as Record<string, string> : null;
      const headers = req.headers as Record<string, string>;
      const body = req.body && Object.keys(req.body).length > 0 ? req.body : null;
      const ipAddress = req.ip || req.connection.remoteAddress || null;
      const userAgent = req.get('user-agent') || null;
      
      const request = createRequest(
        hook.id,
        req.method,
        '/',
        query,
        headers,
        body,
        ipAddress,
        userAgent
      );
      
      res.json({
        success: true,
        hook: {
          slug: hook.slug,
          name: hook.name
        },
        request: {
          id: request.id,
          method: request.method,
          path: request.path,
          createdAt: request.createdAt.toISOString()
        }
      });
    } catch (error) {
      console.error('Error catching request:', error);
      res.status(500).json({ error: 'Failed to catch request' });
    }
  });
  
  return router;
}