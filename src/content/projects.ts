export type ProjectCategory = "Digital" | "Motion" | "Branding";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  image: string;
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
    id: "visual-study-13",
    title: "Visual Study 13",
    description: "Interactive Image Study",
    category: "Digital",
    image: "/gallery/rspca-animal-futures.webp",
  },
  {
    id: "visual-study-14",
    title: "Visual Study 14",
    description: "Motion And Surface Study",
    category: "Motion",
    image: "/gallery/oceanx.webp",
  },
  {
    id: "visual-study-15",
    title: "Visual Study 15",
    description: "Digital Composition",
    category: "Digital",
    image: "/gallery/cosmos.webp",
  },
  {
    id: "visual-study-16",
    title: "Visual Study 16",
    description: "Identity Exploration",
    category: "Branding",
    image: "/gallery/organimo.webp",
  },
  {
    id: "visual-study-17",
    title: "Visual Study 17",
    description: "Immersive Layout Study",
    category: "Digital",
    image: "/gallery/poly.webp",
  },
  {
    id: "visual-study-18",
    title: "Visual Study 18",
    description: "Cinematic Motion Study",
    category: "Motion",
    image: "/gallery/symphony-of-vines.webp",
  },
  {
    id: "visual-study-19",
    title: "Visual Study 19",
    description: "Web Experience Study",
    category: "Digital",
    image: "/gallery/blueyard.webp",
  },
  {
    id: "visual-study-20",
    title: "Visual Study 20",
    description: "Spatial Interface Study",
    category: "Digital",
    image: "/gallery/hubtown.webp",
  },
  {
    id: "visual-study-21",
    title: "Visual Study 21",
    description: "Editorial Motion Study",
    category: "Motion",
    image: "/gallery/klook.webp",
  },
  {
    id: "visual-study-22",
    title: "Visual Study 22",
    description: "Digital Material Study",
    category: "Digital",
    image: "/gallery/25-residences.webp",
  },
];
