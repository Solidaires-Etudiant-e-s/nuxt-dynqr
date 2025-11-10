import { defineEventHandler, getHeader, readBody, sendError, createError } from 'h3';
import { prisma } from '../db/prisma';
import { sanitizeHttpUrl } from '../utils/url';

function genSlug(len = 6) {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default defineEventHandler(async (event) => {
  const username = getHeader(event, 'YNH_USER');
  if (!username) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'missing YNH_USER header' }));
  }

  const body = await readBody<{ url?: string; slug?: string; title?: string }>(event);
  if (!body?.url) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'missing url' }));
  }
  const cleanUrl = sanitizeHttpUrl(body.url);
  if (!cleanUrl) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'invalid url' }));
  }

  // Ensure user exists (upsert)
  await prisma.dqr_users.upsert({
    where: { username },
    update: {},
    create: { username },
  });

  // Find unique slug
  let slug = (body.slug || '').trim();
  if (slug.length === 0) slug = genSlug();
  if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'invalid slug' }));
  }

  try {
    const created = await prisma.dqr_links.create({
      data: { slug, url: cleanUrl, ownerUsername: username, title: body.title?.trim() || null },
    });
    return created;
  } catch (err: any) {
    // Unique constraint on slug
    if (err?.code === 'P2002') {
      return sendError(event, createError({ statusCode: 409, statusMessage: 'slug already in use' }));
    }
    throw err;
  }
});
