import { defineEventHandler, sendError, createError } from 'h3';
import { prisma } from '../../../db/prisma';
import { getRole } from '../../../utils/role';

export default defineEventHandler(async (event) => {
  try {
    const role = await getRole(event);
    if (role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'forbidden' });

    const id = Number(event.context.params?.id);
    if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' });

    const res = await prisma.dqr_links.deleteMany({ where: { id } });
    return { deleted: res.count };
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }));
  }
});
