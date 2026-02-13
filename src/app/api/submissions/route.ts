import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, url, description, category, pricing, tags } = body;

    // Validate required fields
    if (!name || !url || !description || !category) {
      return NextResponse.json(
        { error: "Name, URL, description, and category are required." },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid URL." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
        category: category.trim(),
        pricing: pricing || "free",
        tags: tags || [],
        submitted_email: user.email,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Submission error:", error);
      return NextResponse.json(
        { error: "Failed to submit tool. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: "Tool submitted successfully!" });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
