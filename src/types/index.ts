export type NavItem = {
  title: string;
  href: string;
  icon?: string;
};

export type Locale = "en" | "ar";

export type DashboardStat = {
  label: string;
  value: string;
  description: string;
  trend?: string;
};
