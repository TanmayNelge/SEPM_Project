import mongoose from "mongoose";
import Department from "../models/Department.model.js";

const getAdminId = (req) => req.admin?._id || req.admin?.id;

export const listDepartments = async (req, res, next) => {
  try {
    const filter = { adminId: getAdminId(req) };
    if (req.query.includeInactive !== "true") filter.isActive = true;

    const departments = await Department.find(filter)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    return next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, category = "", description = "" } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Department name is required" });
    }

    const department = await Department.create({
      adminId: getAdminId(req),
      workspaceCode: req.admin.workspaceCode,
      name: name.trim(),
      category,
      description,
    });

    return res.status(201).json({ success: true, data: department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A department with that name already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid department id" });
    }

    const updates = {};
    for (const field of ["name", "category", "description", "isActive"]) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (typeof updates.name === "string") {
      updates.name = updates.name.trim();
      updates.normalizedName = updates.name.toLowerCase();
    }
    if (updates.name === "") {
      return res.status(400).json({ success: false, message: "Department name cannot be empty" });
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "At least one department field is required" });
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, adminId: getAdminId(req) },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    return res.status(200).json({ success: true, data: department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A department with that name already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

export const archiveDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid department id" });
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, adminId: getAdminId(req) },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    return res.status(200).json({ success: true, message: "Department archived", data: department });
  } catch (error) {
    return next(error);
  }
};