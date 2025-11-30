import api from "../utils/api";

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const issueService = {
  getIssues: async (): Promise<GithubIssue[]> => {
    const response = await api.fetch<GithubIssue[]>(API_URL + "/issues");
    return response;
  },

  createIssue: async (data: {
    title: string;
    body: string;
    image?: string;
    imageName?: string;
  }): Promise<GithubIssue> => {
    const response = await api.fetch<GithubIssue>(`${API_URL}/issues`, {
      method: "POST",
      data,
    });
    return response;
  },
};
