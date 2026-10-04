import { Router } from "express";
import { UsersController } from "../controllers/UsersController";
import { JwtMiddleware } from "../middleware/jwtMiddleware";
import { UsersRepository } from "../repository/users/usersRepository";
import { AuthService } from "../services/AuthService";
import { CognitoIdentityService } from "../services/CognitoIdentityService";

const router = Router();
const repository = new UsersRepository();
const identity = new CognitoIdentityService();
const service = new AuthService(repository, identity);
const controller = new UsersController(service);

router.post("/refresh", controller.refresh);
router.post("/login", controller.login);
router.post("/sign-up", controller.signUp);
router.get("/session", JwtMiddleware.authenticate, controller.session);
router.post("/logout", controller.logout);
router.delete("/delete-user", JwtMiddleware.authenticate, controller.deleteUser);

export default router;
