import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try to insert the email
    // We use insert() instead of upsert() to avoid needing SELECT permissions (RLS).
    // If the email exists (error code 23505 for unique_violation), we consider it a success.
    const { error } = await supabase
      .from("subscribers")
      .insert({ email });

    if (error) {
      // Check for Postgres unique violation error code (23505)
      if (error.code === '23505') {
        // Email already exists, treat as success
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }

      console.error("Error subscribing:", error);
      return NextResponse.json(
        { error: error.message || "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
