import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import { collectionProducts } from "@/lib/collection-products";

export const featuredProducts = [
  {
    id: "featured-1",
    source: "featured",
    slug: "character-collection",
    image: portfolio1,
    title: "Character Collection",
    category: "Custom OEM",
    description: "Branded character plush set for a major North American retailer.",
    details:
      "This custom OEM project involved designing and manufacturing a complete line of branded character plush toys for one of North America's leading retail chains. Each character was developed from concept sketches to final production, ensuring brand consistency and child-safe materials throughout.",
    features: [
      "Custom pattern development from client artwork",
      "EN71 & ASTM F963 certified materials",
      "Embroidered facial details for durability",
      "Eco-friendly polyester fiber fill",
      "Individual polybag packaging with hang tags",
      "MOQ: 3,000 pieces per style",
    ],
    specs: {
      size: "25 cm / 10 inches",
      material: "Super-soft plush fabric",
      fill: "100% recycled polyester",
      age: "3+ years",
    },
  },
  {
    id: "featured-2",
    source: "featured",
    slug: "fantasy-unicorn",
    image: portfolio2,
    title: "Fantasy Unicorn",
    category: "ODM Design",
    description: "Pastel unicorn series with embroidered details and eco-friendly fill.",
    details:
      "Our in-house design team created this enchanting pastel unicorn series as part of our ODM catalog. Featuring intricate embroidered details on the horn, mane, and hooves, this collection showcases our capability to produce whimsical, high-quality plush toys ready for private labeling.",
    features: [
      "Original ODM design available for private label",
      "Multi-color embroidered horn and mane",
      "Glitter-infused fabric accents",
      "CPSIA compliant for the US market",
      "Gift-ready window box packaging",
      "MOQ: 2,000 pieces per color",
    ],
    specs: {
      size: "30 cm / 12 inches",
      material: "Crystal super-soft plush",
      fill: "PP cotton, eco-friendly",
      age: "0+ years (infant safe)",
    },
  },
  {
    id: "featured-3",
    source: "featured",
    slug: "pet-pals-duo",
    image: portfolio3,
    title: "Pet Pals Duo",
    category: "Custom OEM",
    description: "Dog & cat plush pair for a European pet accessories brand.",
    details:
      "Developed for a leading European pet accessories brand, this adorable dog and cat duo was designed to complement their existing product line. The plush toys feature realistic proportions and premium materials, meeting strict EU safety standards for both children and pets.",
    features: [
      "Designed to match client's existing brand aesthetic",
      "CE marked, EN71 Parts 1-3 certified",
      "Reinforced stitching for pet-safe use",
      "Machine washable at 30°C",
      "Kraft paper eco-packaging",
      "MOQ: 5,000 pieces per set",
    ],
    specs: {
      size: "20 cm / 8 inches each",
      material: "Short pile plush fabric",
      fill: "Hypoallergenic hollow fiber",
      age: "All ages",
    },
  },
];

export const products = [...featuredProducts, ...collectionProducts];
