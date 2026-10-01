import express from "express";
import {
  archiveDepartment,
  createDepartment,
  listDepartments,
  updateDepartment,
} from "../controllers/admin.department.controllers.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(adminAuth);
router.get("/", listDepartments);
router.post("/", createDepartment);
router.patch("/:id", updateDepartment);
router.delete("/:id", archiveDepartment);

export default router;