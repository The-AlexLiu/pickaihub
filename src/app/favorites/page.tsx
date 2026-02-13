import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolList from "@/components/ToolList";
import { Tool } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select("tool_id, tools(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
  }

  // Extract tools from the join
  const tools = (favorites?.map((f) => f.tools) || []) as unknown as Tool[];

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
          <p className="text-white/50">
            {tools.length} tool{tools.length === 1 ? "" : "s"} saved
          </p>
        </div>

        {tools.length > 0 ? (
          <ToolList tools={tools} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-3xl">
              ❤️
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No favorites yet</h3>
            <p className="mb-6 max-w-md text-white/50">
              Browse the directory and click the heart icon to save tools you want to check out later.
            </p>
            <a
              href="/"
              className="rounded-lg bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Explore Tools
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
