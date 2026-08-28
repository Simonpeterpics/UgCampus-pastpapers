import { Router, type IRouter } from "express";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { getStats, papers } from "./papers";

const router: IRouter = Router();

router.get("/dashboard/summary", (_req, res) => {
  const stats = getStats();
  const response = GetDashboardSummaryResponse.parse({
    totalPapers: papers.length,
    totalDownloads: papers.reduce((total, paper) => total + paper.downloads, 0),
    paidUnlocks: stats.paidUnlocks,
    totalEarningsUgx: stats.totalEarningsUgx,
    pendingUploads: stats.pendingUploads,
    topUniversity: "Makerere University",
  });
  res.json(response);
});

export default router;