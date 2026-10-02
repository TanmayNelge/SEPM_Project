import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
    index: true,
  },
  workspaceCode: {
    type: String,
    uppercase: true,
    trim: true,
    default: "",
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  normalizedName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    trim: true,
    default: "",
    maxlength: 80,
  },
  description: {
    type: String,
    trim: true,
    default: "",
    maxlength: 500,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

departmentSchema.pre("validate", function () {
  if (this.name) this.normalizedName = this.name.trim().toLowerCase();
});

departmentSchema.index({ adminId: 1, normalizedName: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model("Department", departmentSchema);