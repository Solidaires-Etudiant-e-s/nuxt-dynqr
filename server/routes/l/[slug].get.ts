import { defineEventHandler, sendRedirect, createError, sendError } from 'h3';
import { prisma } from '../../db/prisma';
import { sanitizeHttpUrl } from '../../utils/url';

export default defineEventHandler(async (event) => {
  try {
    const slug = String(event.context.params?.slug || '').trim();
    if (!slug) throw createError({ statusCode: 404, statusMessage: 'not found' });

    const link = await prisma.dqr_links.findFirst({ where: { slug, isActive: true } });
    if (!link) throw createError({ statusCode: 404, statusMessage: 'not found' });

    // Validate target URL before redirect (defense-in-depth)
    const clean = sanitizeHttpUrl(link.url);
    if (!clean) throw createError({ statusCode: 400, statusMessage: 'invalid target url' });

    prisma.dqr_links
      .update({ where: { id: link.id }, data: { visitCount: { increment: 1 } } })
      .catch(() => {});

    return sendRedirect(event, clean, 302);
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }));
  }
});
