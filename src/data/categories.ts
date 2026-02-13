export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "all", name: "All", icon: "🔍" },
  { id: "text", name: "Text", icon: "✍️" },
  { id: "image", name: "Image", icon: "🎨" },
  { id: "video", name: "Video", icon: "🎥" },
  { id: "code", name: "Code", icon: "💻" },
  { id: "audio", name: "Audio", icon: "🎵" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "marketing", name: "Marketing", icon: "📈" },
  { id: "productivity", name: "Productivity", icon: "⚡" },
  { id: "education", name: "Education", icon: "📚" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "3d", name: "3D", icon: "🧊" },
  { id: "fun", name: "Fun", icon: "🎮" },
];

export const HEADER_CATEGORIES = [
  { id: "text", name: "Text", icon: "✍️" },
  { id: "image", name: "Image", icon: "🎨" },
  { id: "video", name: "Video", icon: "🎥" },
  { id: "code", name: "Code", icon: "💻" },
  { id: "audio", name: "Audio", icon: "🎵" },
];
