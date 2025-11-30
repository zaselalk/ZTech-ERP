import { Router } from "express";
import { Octokit } from "octokit";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

const router = Router();

// Initialize Octokit
// Note: In a real production app, you might want to handle the case where GITHUB_TOKEN is missing more gracefully
const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
});

// Initialize Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const OWNER = env.GITHUB_REPO_OWNER || "";
const REPO = env.GITHUB_REPO_NAME || "";
const CLIENT_ISSUE_LABEL = "client-issue";

// Helper to check if GitHub config is present
const checkGithubConfig = () => {
  if (!env.GITHUB_TOKEN || !OWNER || !REPO) {
    return false;
  }
  return true;
};

// Helper to check if Cloudinary config is present
const checkCloudinaryConfig = () => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    return false;
  }
  return true;
};

// GET /api/issues - List all issues with "client-issue" label
router.get("/", async (req, res) => {
  if (!checkGithubConfig()) {
    return res
      .status(503)
      .json({ message: "GitHub integration not configured" });
  }

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: OWNER,
      repo: REPO,
      labels: CLIENT_ISSUE_LABEL,
      state: "all", // Get both open and closed issues
      sort: "created",
      direction: "desc",
      headers: {
        accept: "application/vnd.github.html+json",
      },
    });

    const issues = response.data.map((issue: any) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body_html || issue.body, // Fallback to body if body_html is not present, though with the header it should be in body or body_html depending on api version
      state: issue.state,
      html_url: issue.html_url,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      user: {
        login: issue.user?.login,
        avatar_url: issue.user?.avatar_url,
      },
    }));

    res.json(issues);
  } catch (error: any) {
    console.error("Error fetching GitHub issues:", error);
    res.status(500).json({ message: "Failed to fetch issues from GitHub" });
  }
});

// POST /api/issues - Create a new issue
router.post("/", async (req, res) => {
  if (!checkGithubConfig()) {
    return res
      .status(503)
      .json({ message: "GitHub integration not configured" });
  }

  const { title, body, image, imageName } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required" });
  }

  try {
    let finalBody = body;

    if (image && imageName) {
      if (checkCloudinaryConfig()) {
        try {
          // Determine mime type from extension or default to png
          const ext = imageName.split(".").pop()?.toLowerCase();
          let mimeType = "image/png";
          if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
          else if (ext === "gif") mimeType = "image/gif";
          else if (ext === "webp") mimeType = "image/webp";

          // Upload to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(
            `data:${mimeType};base64,${image}`,
            {
              folder: "bookshop-issues",
              public_id: `${Date.now()}-${imageName.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
              )}`,
            }
          );

          finalBody += `\n\n![${imageName}](${uploadResponse.secure_url})`;
        } catch (uploadError: any) {
          console.error("Error uploading image to Cloudinary:", uploadError);
          finalBody += `\n\n(Image upload failed: ${uploadError.message})`;
        }
      } else {
        finalBody += `\n\n(Image upload failed: Cloudinary not configured)`;
      }
    }

    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: OWNER,
        repo: REPO,
        title,
        body: finalBody,
        labels: [CLIENT_ISSUE_LABEL],
      }
    );

    res.status(201).json(response.data);
  } catch (error: any) {
    console.error("Error creating GitHub issue:", error);
    res.status(500).json({ message: "Failed to create issue on GitHub" });
  }
});

export default router;

