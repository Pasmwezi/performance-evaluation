import { prisma } from "./prisma";

interface AuditLogInput {
  userId: string;
  userEmail: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Logs a structured audit event to the database.
 */
export async function logAuditEvent({
  userId,
  userEmail,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        entityType,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
