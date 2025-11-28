import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import IssueList from "./IssueList";
import IssueDetailModal from "./IssueDetailModal";
import CreateIssueModal from "./CreateIssueModal";
import { GithubIssue, issueService } from "../../../services/issueService";
import userEvent from "@testing-library/user-event";

// Mock the issueService
vi.mock("../../../services/issueService", () => ({
  issueService: {
    createIssue: vi.fn(),
  },
}));

// Mock matchMedia for Ant Design
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockIssues: GithubIssue[] = [
  {
    id: 1,
    number: 101,
    title: "Test Issue 1",
    body: "This is a test issue body",
    state: "open",
    html_url: "http://github.com/test/1",
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z",
    user: {
      login: "testuser",
      avatar_url: "http://avatar.url",
    },
  },
  {
    id: 2,
    number: 102,
    title: "Test Issue 2",
    body: "This is another test issue",
    state: "closed",
    html_url: "http://github.com/test/2",
    created_at: "2023-01-02T10:00:00Z",
    updated_at: "2023-01-02T10:00:00Z",
    user: {
      login: "testuser2",
      avatar_url: "http://avatar.url",
    },
  },
];

describe("IssueList", () => {
  it("renders open issues by default", () => {
    render(
      <IssueList issues={mockIssues} loading={false} onIssueClick={() => {}} />
    );

    expect(screen.getByText("Test Issue 1")).toBeInTheDocument();
    expect(screen.queryByText("Test Issue 2")).not.toBeInTheDocument();
    expect(screen.getByText("Todo (1)")).toBeInTheDocument();
  });

  it("renders closed issues when tab is clicked", async () => {
    render(
      <IssueList issues={mockIssues} loading={false} onIssueClick={() => {}} />
    );

    const closedTab = screen.getByText(/Completed/);
    fireEvent.click(closedTab);

    await waitFor(() => {
      expect(screen.getByText("Test Issue 2")).toBeVisible();
    });
    expect(screen.queryByText("Test Issue 1")).not.toBeVisible();
  });

  it("calls onIssueClick when an issue title is clicked", () => {
    const handleIssueClick = vi.fn();
    render(
      <IssueList
        issues={mockIssues}
        loading={false}
        onIssueClick={handleIssueClick}
      />
    );

    fireEvent.click(screen.getByText("Test Issue 1"));
    expect(handleIssueClick).toHaveBeenCalledWith(mockIssues[0]);
  });
});

describe("IssueDetailModal", () => {
  it("renders issue details when open", () => {
    render(<IssueDetailModal issue={mockIssues[0]} onClose={() => {}} />);

    // Ant Design Modal renders in a portal, so we look in the document body
    expect(screen.getByText("#101 Test Issue 1")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("OPEN")).toBeInTheDocument();
    // Check for body content (rendered via dangerouslySetInnerHTML)
    expect(screen.getByText("This is a test issue body")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    render(<IssueDetailModal issue={mockIssues[0]} onClose={handleClose} />);

    // The modal has an 'X' close button (aria-label="Close") and a footer "Close" button.
    // We want the footer button which has visible text "Close".
    const closeButton = screen.getByText("Close").closest("button");
    if (!closeButton) throw new Error("Close button not found");

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  it("does not render when issue is null", () => {
    render(<IssueDetailModal issue={null} onClose={() => {}} />);

    expect(screen.queryByText("Test Issue 1")).not.toBeInTheDocument();
  });
});

describe("CreateIssueModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form when visible", () => {
    render(
      <CreateIssueModal
        visible={true}
        onCancel={() => {}}
        onSuccess={() => {}}
      />
    );

    expect(screen.getByText("Submit New Issue")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("submits the form with valid data", async () => {
    const handleSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <CreateIssueModal
        visible={true}
        onCancel={() => {}}
        onSuccess={handleSuccess}
      />
    );

    await user.type(screen.getByLabelText("Title"), "New Bug");
    await user.type(screen.getByLabelText("Description"), "Bug description");

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(issueService.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Bug",
          body: "Bug description",
        })
      );
    });

    expect(handleSuccess).toHaveBeenCalled();
  });
});
