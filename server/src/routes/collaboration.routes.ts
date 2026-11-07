import { Router } from 'express';
import * as CollabController from '../controllers/collaboration.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addCommentSchema } from '../validators/collaboration.validator';

const router = Router();

router.use(protect);

// Task-specific collaboration
router.get('/tasks/:taskId/comments', CollabController.getComments);
router.post('/tasks/:taskId/comments', validate(addCommentSchema), CollabController.addComment);
router.get('/tasks/:taskId/activities', CollabController.getActivities);

// Notifications
router.get('/notifications', CollabController.getMyNotifications);
router.patch('/notifications/:id/read', CollabController.readNotification);

export default router;