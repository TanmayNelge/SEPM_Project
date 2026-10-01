import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  workspaceCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
  permissions: {
    type: [String],
    default: [],
  },
  profileImage: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

adminSchema.pre("validate", function () {
  if (!this.workspaceCode) {
    this.workspaceCode = `WRK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }
});

adminSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);