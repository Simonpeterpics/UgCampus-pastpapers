import { Router, type IRouter } from "express";
import {
  GetPaperParams,
  GetPaperResponse,
  ListPapersQueryParams,
  ListPapersResponse,
  UnlockPaperBody,
  UnlockPaperParams,
  UnlockPaperResponse,
} from "@workspace/api-zod";

export type PaperRecord = {
  id: string;
  courseCode: string;
  courseName: string;
  faculty: string;
  university: string;
  year: number;
  downloads: number;
  priceUgx: number;
  previewLabel: string;
  accent: string;
  isTrending: boolean;
  pdfUrl: string | null;
};

export const papers: PaperRecord[] = [
  {
    id: "dev-310-2025",
    courseCode: "DEV 310",
    courseName: "Development Studies",
    faculty: "Faculty of Social Sciences",
    university: "Makerere University",
    year: 2025,
    downloads: 142,
    priceUgx: 2000,
    previewLabel: "End of Semester Examination",
    accent: "blue",
    isTrending: true,
    pdfUrl: null,
  },
  {
    id: "baf-210-2024",
    courseCode: "BAF 210",
    courseName: "Financial Accounting II",
    faculty: "Faculty of Business",
    university: "MUBS",
    year: 2024,
    downloads: 98,
    priceUgx: 2000,
    previewLabel: "Main Examination",
    accent: "gold",
    isTrending: true,
    pdfUrl: null,
  },
  {
    id: "edu-204-2023",
    courseCode: "EDU 204",
    courseName: "Educational Psychology",
    faculty: "Faculty of Education",
    university: "Kyambogo",
    year: 2023,
    downloads: 86,
    priceUgx: 2000,
    previewLabel: "Semester Two Examination",
    accent: "green",
    isTrending: false,
    pdfUrl: null,
  },
  {
    id: "law-202-2025",
    courseCode: "LAW 202",
    courseName: "Law of Contract",
    faculty: "Faculty of Law",
    university: "IUIU",
    year: 2025,
    downloads: 71,
    priceUgx: 2000,
    previewLabel: "Supplementary Examination",
    accent: "red",
    isTrending: true,
    pdfUrl: null,
  },
  {
    id: "cs-305-2022",
    courseCode: "CS 305",
    courseName: "Database Systems",
    faculty: "Faculty of Science and Technology",
    university: "UCU",
    year: 2022,
    downloads: 64,
    priceUgx: 2000,
    previewLabel: "Final Examination",
    accent: "purple",
    isTrending: false,
    pdfUrl: null,
  },
  {
    id: "eco-303-2024",
    courseCode: "ECO 303",
    courseName: "Development Economics",
    faculty: "Faculty of Economics",
    university: "Makerere University",
    year: 2024,
    downloads: 54,
    priceUgx: 2000,
    previewLabel: "Main Examination",
    accent: "orange",
    isTrending: false,
    pdfUrl: null,
  },
];

let creditsRemaining = 3;
let paidUnlocks = 128;
let totalEarningsUgx = 256000;
let pendingUploads = 4;

const demoPdfUrl =
  "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUj4+CmVuZG9iago=";

export const getStats = () => ({
  creditsRemaining,
  paidUnlocks,
  totalEarningsUgx,
  pendingUploads,
});

export const addPendingUpload = () => {
  pendingUploads += 1;
};

const router: IRouter = Router();

router.get("/papers", (req, res) => {
  const params = ListPapersQueryParams.parse(req.query);
  const normalizedSearch = params.search?.trim().toLowerCase();
  const result = papers.filter((paper) => {
    const matchesSearch =
      !normalizedSearch ||
      [paper.courseCode, paper.courseName, paper.faculty, paper.university]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesUniversity =
      !params.university || paper.university === params.university;
    const matchesFaculty = !params.faculty || paper.faculty === params.faculty;
    const matchesYear = !params.year || paper.year === params.year;
    const matchesTrending = !params.trending || paper.isTrending;
    return (
      matchesSearch &&
      matchesUniversity &&
      matchesFaculty &&
      matchesYear &&
      matchesTrending
    );
  });
  res.json(ListPapersResponse.parse(result));
});

router.get("/papers/:id", (req, res) => {
  const { id } = GetPaperParams.parse(req.params);
  const paper = papers.find((candidate) => candidate.id === id);
  if (!paper) {
    res.status(404).json({ error: "Paper not found" });
    return;
  }
  res.json(GetPaperResponse.parse(paper));
});

router.post("/papers/:id/unlock", (req, res) => {
  const { id } = UnlockPaperParams.parse(req.params);
  const { method } = UnlockPaperBody.parse(req.body);
  const paper = papers.find((candidate) => candidate.id === id);
  if (!paper) {
    res.status(404).json({ error: "Paper not found" });
    return;
  }

  paper.downloads += 1;
  if (method === "ad") {
    creditsRemaining = Math.max(0, creditsRemaining - 1);
  } else {
    paidUnlocks += 1;
    totalEarningsUgx += paper.priceUgx;
  }

  const response = UnlockPaperResponse.parse({
    unlocked: true,
    downloadUrl: demoPdfUrl,
    message:
      method === "ad"
        ? "Ad complete. Your paper is unlocked."
        : "Payment simulated successfully. Your paper is unlocked.",
    creditsRemaining,
  });
  res.json(response);
});

export default router;