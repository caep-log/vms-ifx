import { Router } from "express";
import usersRoutes from "./users.Routes";
import vmsRoutes from "./vms.Routes";

const router = Router();

router.get("/monitor", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "API VMs IFX is running - " + new Date().toISOString() + "holaa" + process.env.NODE_ENV,
    });
});

router.use("/users", usersRoutes);
router.use("/vms", vmsRoutes);

export default router;
