import { Router } from "express";

const router = Router();

router.get("/monitor", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "API VMs IFX is running - " + new Date().toISOString(),
    });
});

export default router;