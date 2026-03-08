import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/supporters/route";

vi.mock("@/app/actions/supporters", () => ({
  getPublicSupporters: vi.fn(),
}));

const { getPublicSupporters } = await import("@/app/actions/supporters");

function createRequest(url: string): Request {
  return new Request(url);
}

describe("GET /api/supporters", () => {
  beforeEach(() => {
    vi.mocked(getPublicSupporters).mockReset();
  });

  it("returns supporters and total from getPublicSupporters", async () => {
    vi.mocked(getPublicSupporters).mockResolvedValue({
      supporters: [
        {
          id: "1",
          fullName: "Jane Doe",
          country: "US",
          affiliation: "Acme",
          isInitialSupporter: false,
        },
      ],
      total: 1,
    });

    const req = createRequest("http://localhost/api/supporters");
    const res = await GET(req as import("next/server").NextRequest);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.supporters).toHaveLength(1);
    expect(data.supporters[0].fullName).toBe("Jane Doe");
    expect(data.total).toBe(1);
    expect(getPublicSupporters).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      search: undefined,
    });
  });

  it("passes page and pageSize from query string", async () => {
    vi.mocked(getPublicSupporters).mockResolvedValue({
      supporters: [],
      total: 0,
    });

    const req = createRequest(
      "http://localhost/api/supporters?page=2&pageSize=50"
    );
    await GET(req as import("next/server").NextRequest);

    expect(getPublicSupporters).toHaveBeenCalledWith({
      page: 2,
      pageSize: 50,
      search: undefined,
    });
  });

  it("passes search from query string", async () => {
    vi.mocked(getPublicSupporters).mockResolvedValue({
      supporters: [],
      total: 0,
    });

    const req = createRequest(
      "http://localhost/api/supporters?search=smith"
    );
    await GET(req as import("next/server").NextRequest);

    expect(getPublicSupporters).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      search: "smith",
    });
  });

  it("defaults to page 1 and pageSize 100 when query params missing", async () => {
    vi.mocked(getPublicSupporters).mockResolvedValue({
      supporters: [],
      total: 0,
    });

    const req = createRequest("http://localhost/api/supporters");
    await GET(req as import("next/server").NextRequest);

    expect(getPublicSupporters).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      search: undefined,
    });
  });

  it("clamps invalid page to 1 and pageSize to at least 1", async () => {
    vi.mocked(getPublicSupporters).mockResolvedValue({
      supporters: [],
      total: 0,
    });

    const req = createRequest(
      "http://localhost/api/supporters?page=0&pageSize=-1"
    );
    await GET(req as import("next/server").NextRequest);

    expect(getPublicSupporters).toHaveBeenCalledWith({
      page: 1,
      pageSize: 1, // -1 parsed then Math.max(1, ...) => 1
      search: undefined,
    });
  });

  it("returns 500 and empty data on getPublicSupporters throw", async () => {
    vi.mocked(getPublicSupporters).mockRejectedValue(new Error("db error"));

    const req = createRequest("http://localhost/api/supporters");
    const res = await GET(req as import("next/server").NextRequest);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.supporters).toEqual([]);
    expect(data.total).toBe(0);
  });
});
