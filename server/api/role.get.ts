import { defineEventHandler, sendError, createError } from 'h3';
import { getRole } from '../utils/role';

export default defineEventHandler(async (event) => {
  try {
    const role = await getRole(event);
    event.node.res.setHeader('content-type', 'text/plain');
    return role;
  } catch (err: any) {
    return sendError(event, createError({ statusCode: err?.statusCode || 500, statusMessage: String(err?.statusMessage || err) }));
  }
});
