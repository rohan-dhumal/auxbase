import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { activate, deactivate, editUser, getUser, getUsers, updatePassword } from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);

router.get('/:id', authorize('ADMIN'), getUser);

router.patch('/:id', authorize('ADMIN'), editUser);

router.patch('/:id/deactivate', authorize('ADMIN'), deactivate);

router.patch('/:id/activate', authorize('ADMIN'), activate);

router.patch('/:id/password', authorize('VIEWER'), updatePassword);

export default router;
