import { siteContent } from "@/content/site";

export default function Home() {
  return (
    <main>
      <h1>{siteContent.name}</h1>
      <p>{siteContent.tagline}</p>
    </main>
  );
}
