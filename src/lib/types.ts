export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  category_label: string;
  tags: string[];
  pricing: "free" | "paid" | "freemium";
  pricing_label: string;
  visits: string;
  rating: number;
  logo: string;
  is_new: boolean;
  is_trending: boolean;
  launch_date: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}
