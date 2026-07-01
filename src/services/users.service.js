import logger from "#config/logger.js";
import { eq } from "drizzle-orm";
import { db } from "#config/database.js";
import { hashPassword } from "#services/auth.service.js";
import { users } from "#models/user.model.js";

export const getAllUsers = async () => {
    try {
        return await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        }).from(users);
    } catch (e) {
        logger.error('Error getting users', e);
        throw e;
    }
};

export const getUserById = async (id) => {
    try {
        const [user] = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at,
        }).from(users).where(eq(users.id, id)).limit(1);

        return user || null;
    } catch (e) {
        logger.error('Error getting user by ID', e);
        throw e;
    }
};

export const updateUser = async (id, updates) => {
    try {
        const existingUser = await getUserById(id);

        if (!existingUser) {
            throw new Error('User not found');
        }

        const updatePayload = { ...updates };

        if (updatePayload.password) {
            updatePayload.password = await hashPassword(updatePayload.password);
        }

        const [updatedUser] = await db.update(users)
            .set(updatePayload)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            });

        return updatedUser;
    } catch (e) {
        logger.error('Error updating user', e);
        throw e;
    }
};

export const deleteUser = async (id) => {
    try {
        const deletedRows = await db.delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id });

        if (!deletedRows || deletedRows.length === 0) {
            throw new Error('User not found');
        }

        return deletedRows[0];
    } catch (e) {
        logger.error('Error deleting user', e);
        throw e;
    }
};