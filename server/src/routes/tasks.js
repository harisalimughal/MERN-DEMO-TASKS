import express from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../middleware/error.js";

const router = express.Router();

const ALLOWED_STATUS = new Set(["todo", "doing", "done"]);
const MAX_LIMIT = 50;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Validate & normalize inputs
    const rawLimit = parseInt(req.query.limit ?? "10", 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : 10;

    const status = req.query.status;
    if (status && !ALLOWED_STATUS.has(status)) {
      const err = new Error("Invalid status. Allowed: todo, doing, done");
      err.statusCode = 400;
      throw err;
    }

    const cursor = req.query.cursor;
    let cursorDoc = null;

    if (cursor) {
      if (!mongoose.isValidObjectId(cursor)) {
        const err = new Error("Invalid cursor (must be a Mongo ObjectId)");
        err.statusCode = 400;
        throw err;
      }
      cursorDoc = await Task.findById(cursor).select({ createdAt: 1 }).lean();
      if (!cursorDoc) {
        const err = new Error("Cursor not found");
        err.statusCode = 400;
        throw err;
      }
    }

    // Build query
    const filter = {};
    if (status) filter.status = status;

    // Cursor logic: sort by createdAt desc, _id desc. If cursor provided,
    // fetch docs "after" the cursor (i.e., older than cursor in this ordering).
    if (cursorDoc) {
      filter.$or = [
        { createdAt: { $lt: cursorDoc.createdAt } },
        { createdAt: cursorDoc.createdAt, _id: { $lt: new mongoose.Types.ObjectId(cursor) } }
      ];
    }

    const sort = { createdAt: -1, _id: -1 };

    // Overfetch by 1 to know if there's a next page
    const docs = await Task.find(filter)
      .sort(sort)
      .limit(limit + 1)
      .select({ title: 1, status: 1, priority: 1, createdAt: 1 }) // avoid overfetching
      .lean();

    let items = docs;
    let nextCursor = null;

    if (docs.length > limit) {
      const last = docs[limit - 1];
      nextCursor = String(last._id);
      items = docs.slice(0, limit);
    }

    res.json({
      items,
      nextCursor
    });
  })
);

export default router;
