import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { JwtMiddleware } from "../middleware/jwtMiddleware";
import { UsersRepository } from "../repository/users/usersRepository";
import { AuthService } from "../services/AuthService";

const router = Router();
const repository = new UsersRepository();
// Cognito queda disponible en CognitoIdentityService.ts para una futura migración.
const service = new AuthService(repository);
const controller = new UsersController(service);

router.post("/refresh", controller.refresh);
router.post("/login", controller.login);
router.post("/sign-up", controller.signUp);
router.get("/session", JwtMiddleware.authenticate, controller.session);
router.post("/logout", controller.logout);
router.delete("/delete-user", JwtMiddleware.authenticate, controller.deleteUser);

export default router;
