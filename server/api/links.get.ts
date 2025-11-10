import { defineEventHandler, getHeader, sendError, createError } from 'h3';
import { prisma } from '../db/prisma';

export default defineEventHandler(async (event) => {
  const username = getHeader(event, 'YNH_USER');
  if (!username) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'missing YNH_USER header' }));
  }

  const rows = await prisma.dqr_links.findMany({
    where: { ownerUsername: username },
    orderBy: { id: 'desc' },
  });
  return rows;
});
