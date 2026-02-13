import { NextResponse } from "next/server";
import { getTools } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = (searchParams.get("sort") as "recommended" | "newest" | "popular") || "recommended";

  const tools = await getTools(
    {
      category,
      search,
      sort,
    },
    page,
    limit
  );

  return NextResponse.json({
    data: tools,
    nextPage: tools.length === limit ? page + 1 : null,
  });
}
