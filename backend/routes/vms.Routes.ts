import { Router } from "express";
import { VmController } from "../controllers/VmController";
import { JwtMiddleware } from "../middleware/jwtMiddleware";
import { VmsRepository } from "../repository/vms/vmsRepository";
import { VmsService } from "../service/VmsService";

const router = Router();
const controller = new VmController(new VmsService(new VmsRepository()));

router.post("/", JwtMiddleware.authenticate, JwtMiddleware.admin, controller.create);
router.get("/", JwtMiddleware.authenticate, controller.getAll);
router.put("/:id", JwtMiddleware.authenticate, JwtMiddleware.admin, controller.update);
router.delete("/:id", JwtMiddleware.authenticate, JwtMiddleware.admin, controller.delete);

export default router;
