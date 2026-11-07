# TaskFlow Pro — Requirements & Acceptance Criteria

## 1. Roles
- ADMIN: full access to everything.
- PROJECT_MANAGER: create/manage own projects, assign tasks, add members.
- DEVELOPER: view projects they belong to, update tasks assigned to them, comment.

## 2. Acceptance Criteria

### Module A — Authentication
- [ ] Register with name, email, password, role.
- [ ] Duplicate email returns 409.
- [ ] Invalid input returns 400 with field errors (Zod).
- [ ] Login with wrong credentials returns 401.
- [ ] Passwords stored as bcrypt hashes (never plain text).
- [ ] Successful login returns a JWT.
- [ ] Protected endpoints return 401 without a valid token.
- [ ] Role-restricted endpoints return 403 for insufficient role.

### Module B — Projects
- [ ] Create, read, update, delete projects.
- [ ] Project has: id, name, description, ownerId, startDate, deadline, status, createdAt, updatedAt.
- [ ] Status in: PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED.
- [ ] Only owner or ADMIN can edit/delete.
- [ ] Add/remove team members.
- [ ] Project detail shows its tasks.

### Module C — Tasks
- [ ] Create, edit, delete tasks within a project.
- [ ] Task has: id, title, description, projectId, assignedUserId, createdBy, priority, status, dueDate, createdAt, updatedAt, updatedBy.
- [ ] Priority in: LOW, MEDIUM, HIGH, CRITICAL.
- [ ] Status in: TODO, IN_PROGRESS, REVIEW, COMPLETED.
- [ ] Search by title; filter by priority, status, assignee; sort by due date.
- [ ] Overdue tasks are identifiable (dueDate < today AND status != COMPLETED).
- [ ] Kanban drag-and-drop persists status change to the DB.

### Module D — Collaboration
- [ ] Add/remove project members (authorized users only).
- [ ] Comments on tasks, returned chronologically.
- [ ] Activity log entries stored in DB for: task created, priority changed, status changed, assignment changed.
- [ ] Notification created when a developer is assigned a task.

### Module E — Analytics (from real DB queries only)
- [ ] Totals: projects, active projects, completed projects.
- [ ] Task totals: all, completed, pending, overdue, critical.
- [ ] Charts: tasks by status, tasks by priority, project completion, developer workload, monthly completion trend.
- [ ] Loading and error states; responsive layout.

### Module F — API
- [ ] All endpoints under /api.
- [ ] Consistent error shape: { error: string, details?: unknown }.
- [ ] Correct status codes: 200/201/400/401/403/404/409/500.

## 3. Out of Scope (this iteration)
- File attachments, email delivery, real-time websockets, multi-tenant organizations.

## 4. Definition of Done (per module)
1. Implemented against the real database.
2. Tested manually (Thunder Client / browser).
3. Automated tests written and passing.
4. Code reviewed for validation, errors, and authorization.