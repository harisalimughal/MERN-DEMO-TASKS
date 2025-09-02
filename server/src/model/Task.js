import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["todo", "doing", "done"], default: "todo", index: true },
    priority: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// Acceptance: index on { createdAt: -1, status: 1 }
TaskSchema.index({ createdAt: -1, status: 1 });

export const Task = mongoose.model("Task", TaskSchema);
