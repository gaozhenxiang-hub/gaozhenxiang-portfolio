export type ProjectCategory = "Digital" | "Motion" | "Branding";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  image: string;
  video?: string;
};

export const projects: Project[] = [
  {
    id: "hubtown",
    title: "Hubtown",
    description: "Portfolio Website, Immersive Experience",
    category: "Digital",
    image: "/gallery/hubtown.webp",
  },
  {
    id: "poly",
    title: "Poly",
    description: "Website Design",
    category: "Digital",
    image: "/gallery/poly.webp",
  },
  {
    id: "oceanx",
    title: "OceanX",
    description: "A Year of Discovery",
    category: "Digital",
    image: "/gallery/oceanx.webp",
  },
  {
    id: "symphony-of-vines",
    title: "The Symphony Of Vines",
    description: "Interactive Cinematic Experience",
    category: "Motion",
    image: "/gallery/symphony-of-vines.webp",
  },
  {
    id: "klook",
    title: "Klook",
    description: "Interactive Quiz",
    category: "Digital",
    image: "/gallery/klook.webp",
  },
  {
    id: "rspca-animal-futures",
    title: "RSPCA Animal Futures",
    description: "Interactive Learning Experience",
    category: "Digital",
    image: "/gallery/rspca-animal-futures.webp",
  },
  {
    id: "blueyard",
    title: "BlueYard",
    description: "Portfolio Website",
    category: "Digital",
    image: "/gallery/blueyard.webp",
  },
  {
    id: "cosmos",
    title: "Cosmos",
    description: "Marketing Website",
    category: "Digital",
    image: "/gallery/cosmos.webp",
  },
  {
    id: "25-residences",
    title: "25 Residences",
    description: "Portfolio Website",
    category: "Digital",
    image: "/gallery/25-residences.webp",
  },
  {
    id: "organimo",
    title: "Organimo",
    description: "Digital",
    category: "Branding",
    image: "/gallery/organimo.webp",
  },
  {
    id: "hiring-calculator",
    title: "Hiring Calculator",
    description: "Gamified Digital Experience",
    category: "Digital",
    image: "/gallery/hiring-calculator.webp",
  },
  {
    id: "robco",
    title: "RobCo",
    description: "3D Motion",
    category: "Motion",
    image: "/gallery/robco.webp",
  },
  {
    id: "cinematic-study-01",
    title: "Cinematic Study 01",
    description: "AI Live-Action Film",
    category: "Motion",
    image: "/gallery/videos/cinematic-study-01.webp",
    video: "/gallery/videos/cinematic-study-01.mp4",
  },
  {
    id: "cinematic-study-02",
    title: "Cinematic Study 02",
    description: "AI Live-Action Film",
    category: "Motion",
    image: "/gallery/videos/cinematic-study-02.webp",
    video: "/gallery/videos/cinematic-study-02.mp4",
  },
  {
    id: "commercial-study-01",
    title: "Commercial Study 01",
    description: "AI Advertising Film",
    category: "Motion",
    image: "/gallery/videos/commercial-study-01.webp",
    video: "/gallery/videos/commercial-study-01.mp4",
  },
  {
    id: "commercial-study-02",
    title: "Commercial Study 02",
    description: "AI Advertising Film",
    category: "Motion",
    image: "/gallery/videos/commercial-study-02.webp",
    video: "/gallery/videos/commercial-study-02.mp4",
  },
  {
    id: "game-cinematic-01",
    title: "Game Cinematic 01",
    description: "AI Game CG",
    category: "Motion",
    image: "/gallery/videos/game-cinematic-01.webp",
    video: "/gallery/videos/game-cinematic-01.mp4",
  },
  {
    id: "cold-blue",
    title: "Cold Blue",
    description: "Game Promotional Film",
    category: "Motion",
    image: "/gallery/videos/cold-blue.webp",
    video: "/gallery/videos/cold-blue.mp4",
  },
  {
    id: "final-strike",
    title: "Final Strike",
    description: "Fantasy Action Film",
    category: "Motion",
    image: "/gallery/videos/final-strike.webp",
    video: "/gallery/videos/final-strike.mp4",
  },
  {
    id: "ai-hallucination",
    title: "AI Hallucination",
    description: "Paper Collage Film",
    category: "Motion",
    image: "/gallery/videos/ai-hallucination.webp",
    video: "/gallery/videos/ai-hallucination.mp4",
  },
  {
    id: "midnight-line",
    title: "Midnight Line",
    description: "Title Sequence",
    category: "Motion",
    image: "/gallery/videos/midnight-line.webp",
    video: "/gallery/videos/midnight-line.mp4",
  },
  {
    id: "urban-fault",
    title: "Urban Fault",
    description: "Game Promotional Film",
    category: "Motion",
    image: "/gallery/videos/urban-fault.webp",
    video: "/gallery/videos/urban-fault.mp4",
  },
];
