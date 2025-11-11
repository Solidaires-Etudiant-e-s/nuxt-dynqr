import { defineEventHandler, sendRedirect, createError } from 'h3';

export default defineEventHandler(async (event) => {
  if (process.env.EMULATE_DYNAMICQRCODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'not found' });
  }

  try {
    const query = getQuery(event)
    const redirectId = query.id as string;
    if (!redirectId) throw createError({ statusCode: 500, statusMessage: 'No redirect ID provided' });

    return sendRedirect(event, `/l/${redirectId}`, 301);
  } catch (err: any) {
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) });
  }
});
