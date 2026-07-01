import logger from "#config/logger.js";
import { formatValidationErrors } from "#utils/format.js";
import {
    getAllUsers as fetchUsers,
    getUserById as fetchUserById,
    updateUser as serviceUpdateUser,
    deleteUser as serviceDeleteUser,
} from "#services/users.service.js";
import { updateUserSchema, userIdSchema } from "#validations/users.validation.js";

export const getAllUsers = async (req, res, next) => {
    try {
        logger.info('Getting users...');

        const allUsers = await fetchUsers();

        res.json({
            message: 'Successfully retrieved users',
            users: allUsers,
            count: allUsers.length,
        });
    } catch (e) {
        logger.error(e);
        next(e);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        logger.info('Retrieving user by ID...');

        const validationResult = userIdSchema.safeParse(req.params);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error),
            });
        }

        const user = await fetchUserById(validationResult.data.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Successfully retrieved user', user });
    } catch (e) {
        logger.error(e);
        next(e);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        logger.info('Updating user...');

        const idResult = userIdSchema.safeParse(req.params);
        const validationResult = updateUserSchema.safeParse(req.body);

        if (!idResult.success || !validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(idResult.success ? validationResult.error : idResult.error),
            });
        }

        const targetUserId = idResult.data.id;
        const updates = validationResult.data;
        const currentUserId = Number(req.user?.id);
        const currentUserRole = req.user?.role || 'guest';

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (updates.role && currentUserRole !== 'admin') {
            return res.status(403).json({ error: 'Only admin users can update roles' });
        }

        if (currentUserRole !== 'admin' && currentUserId !== targetUserId) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const updatedUser = await serviceUpdateUser(targetUserId, updates);

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (e) {
        logger.error(e);

        if (e.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }

        next(e);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        logger.info('Deleting user...');

        const validationResult = userIdSchema.safeParse(req.params);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error),
            });
        }

        const targetUserId = validationResult.data.id;
        const currentUserId = Number(req.user?.id);
        const currentUserRole = req.user?.role || 'guest';

        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (currentUserRole !== 'admin' && currentUserId !== targetUserId) {
            return res.status(403).json({ error: 'You can only delete your own account' });
        }

        await serviceDeleteUser(targetUserId);

        res.json({ message: 'User deleted successfully', id: targetUserId });
    } catch (e) {
        logger.error(e);

        if (e.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }

        next(e);
    }
};