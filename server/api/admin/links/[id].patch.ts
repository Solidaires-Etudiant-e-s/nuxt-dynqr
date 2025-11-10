import { defineEventHandler, sendError, createError, readBody } from 'h3';
import { prisma } from '../../../db/prisma';
import { getRole } from '../../../utils/role';
import { sanitizeHttpUrl } from '../../../utils/url';

export default defineEventHandler(async (event) => {
  try {
    const role = await getRole(event);
    if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' });

    const id = Number(event.context.params?.id);
    if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' });

    const body = await readBody<{ url?: string; slug?: string; isActive?: boolean; ownerUsername?: string; title?: string }>(event);
    const updates: any = {};

    if (typeof body.url === 'string' && body.url.length > 0) {
      const clean = sanitizeHttpUrl(body.url);
      if (!clean) throw createError({ statusCode: 400, statusMessage: 'invalid url' });
      updates.url = clean;
    }
    if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;
    if (typeof body.title === 'string') updates.title = body.title.trim() || null;

    if (typeof body.slug === 'string') {
      const slug = body.slug.trim();
      if (slug.length === 0 || !/^[A-Za-z0-9_-]+$/.test(slug)) {
        throw createError({ statusCode: 400, statusMessage: 'invalid slug' });
      }
      updates.slug = slug;
    }

    if (typeof body.ownerUsername === 'string' && body.ownerUsername.trim().length > 0) {
      // ensure target user exists
      const target = body.ownerUsername.trim();
      await prisma.dqr_users.upsert({ where: { username: target }, update: {}, create: { username: target } });
      updates.ownerUsername = target;
    }

    if (Object.keys(updates).length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'no updates provided' });
    }

    try {
      const res = await prisma.dqr_links.updateMany({ where: { id }, data: updates });
      return { updated: res.count };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return sendError(event, createError({ statusCode: 409, statusMessage: 'slug already in use' }));
      }
      throw err;
    }
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }));
  }
});
