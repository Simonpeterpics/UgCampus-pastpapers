import { Router, type IRouter } from "express";
import {
  CreateUploadBody,
  CreateUploadResponse,
} from "@workspace/api-zod";
import { addPendingUpload } from "./papers";

const router: IRouter = Router();

router.post("/uploads", (req, res) => {
  const data = CreateUploadBody.parse(req.body);
  const response = CreateUploadResponse.parse({
    id: `upload-${Math.random().toString(36).slice(2, 9)}`,
    creditsEarned: 2,
    status: "pending_review",
  });
  void data;
  addPendingUpload();
  res.status(201).json(response);
});

export default router;