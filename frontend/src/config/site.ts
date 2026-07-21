export const siteConfig = {
  name: "PROMPT WAR",
  tagline: "THE ULTIMATE PROMPT ENGINEERING SHOWDOWN",
  description:
    "Craft the perfect prompt. Beat the competition. Rise to the top of the leaderboard!",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Rules", href: "/#rules" },
    { label: "Contact", href: "/#contact" },
  ],
  supportedUploadFormats: {
    images: [".png", ".jpg", ".jpeg", ".webp"],
    documents: [".md", ".json", ".pdf"],
  },
};

export const participantNav = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Resources", href: "/resources", icon: "BookOpen" },
  { label: "Challenge", href: "/challenge", icon: "Swords", lockable: true },
  { label: "Leaderboard", href: "/leaderboard", icon: "Trophy" },
] as const;

export const adminNav = [
  { label: "Admin Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Challenges", href: "/admin/challenges", icon: "Swords" },
  { label: "Resources", href: "/admin/resources", icon: "BookOpen" },
  { label: "Submissions", href: "/admin/submissions", icon: "FileText" },
  { label: "Participants", href: "/admin/participants", icon: "Users" },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: "Trophy" },
] as const;
