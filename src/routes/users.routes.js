import express from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "#controllers/users.controller.js";
import { requireAuth, requireRole } from "#middleware/auth.middleware.js";

const router = express.Router();

router.get('/', requireAuth, getAllUsers);
router.get('/:id', requireAuth, getUserById);
router.put('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteUser);

export default router;