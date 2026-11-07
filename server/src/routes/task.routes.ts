import { Router } from 'express';
import * as TaskController from '../controllers/task.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';

const router = Router();

router.use(protect);

router.post('/', validate(createTaskSchema), TaskController.createTask);
router.get('/project/:projectId', TaskController.getTasks);
router.patch('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;