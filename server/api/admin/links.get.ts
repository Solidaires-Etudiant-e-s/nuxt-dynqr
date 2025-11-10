import { defineEventHandler, sendError, createError } from 'h3';
import { prisma } from '../../db/prisma';
import { getRole } from '../../utils/role';

export default defineEventHandler(async (event) => {
  try {
    const role = await getRole(event);
    if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' });
    const rows = await prisma.dqr_links.findMany({ orderBy: { id: 'desc' } });
    return rows;
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }));
  }
});
