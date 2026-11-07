import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "askmynanny" },
      { name: "description", content: "askmynanny — coming soon." },
      { property: "og:title", content: "askmynanny" },
      { property: "og:description", content: "askmynanny — coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-4xl font-semibold text-foreground">askmynanny</h1>
    </main>
  );
}
