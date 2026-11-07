import { Router } from 'express';
import * as ProjectController from '../controllers/project.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/project.validator';

const router = Router();

// Apply the 'protect' middleware to ALL routes below this line
router.use(protect);

router.route('/')
  .get(ProjectController.getProjects)
  .post(validate(createProjectSchema), ProjectController.createProject);

router.route('/:id')
  .get(ProjectController.getProjectById)
  .patch(validate(updateProjectSchema), ProjectController.updateProject)
  .delete(ProjectController.deleteProject);

router.route('/:id/members')
  .get(ProjectController.getMembers)
  .post(validate(addMemberSchema), ProjectController.addMember);

router.route('/:id/members/:userId')
  .delete(ProjectController.removeMember);

export default router;