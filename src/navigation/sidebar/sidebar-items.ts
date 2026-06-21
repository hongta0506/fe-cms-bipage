import {
  BookOpen,
  Calendar,
  FileText,
  Fingerprint,
  Gauge,
  Globe,
  ImageIcon,
  LayoutDashboard,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Navigation,
  Palette,
  Server,
  Settings,
  Shield,
  SquareArrowUpRight,
  Tag,
  Users,
  Webhook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        id: "default",
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Content",
    items: [
      {
        id: "posts",
        title: "Posts",
        url: "/dashboard/posts",
        icon: FileText,
      },
      {
        id: "categories",
        title: "Categories",
        url: "/dashboard/categories",
        icon: BookOpen,
      },
      {
        id: "tags",
        title: "Tags",
        url: "/dashboard/tags",
        icon: Tag,
      },
      {
        id: "authors",
        title: "Authors",
        url: "/dashboard/authors",
        icon: Users,
      },
      {
        id: "banners",
        title: "Banners",
        url: "/dashboard/banners",
        icon: ImageIcon,
      },
      {
        id: "blocks",
        title: "Blocks",
        url: "/dashboard/blocks",
        icon: Palette,
      },
      {
        id: "menus",
        title: "Menus",
        url: "/dashboard/menus",
        icon: Navigation,
      },
    ],
  },
  {
    id: 3,
    label: "System",
    items: [
      {
        id: "users",
        title: "Users",
        url: "/dashboard/users",
        icon: Shield,
      },
      {
        id: "roles",
        title: "Roles",
        url: "/dashboard/roles",
        icon: Lock,
      },
      {
        id: "settings",
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        id: "domains",
        title: "Domains",
        url: "/dashboard/domains",
        icon: Globe,
      },
      {
        id: "files",
        title: "Files",
        url: "/dashboard/files",
        icon: Server,
      },
      {
        id: "sessions",
        title: "Sessions",
        url: "/dashboard/sessions",
        icon: Webhook,
      },
      {
        id: "contact-submissions",
        title: "Contacts",
        url: "/dashboard/contact-submissions",
        icon: Mail,
      },
      {
        id: "crawl-sources",
        title: "Crawl Sources",
        url: "/dashboard/crawl-sources",
        icon: Link2,
      },
    ],
  },
  {
    id: 4,
    label: "Pages",
    items: [
      {
        id: "email",
        title: "Email",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        id: "calendar",
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "authentication",
        title: "Authentication",
        icon: Fingerprint,
        subItems: [
          { id: "auth-login-v1", title: "Login", url: "/auth/v1/login", newTab: true },
          { id: "auth-register-v1", title: "Register", url: "/auth/v1/register", newTab: true },
        ],
      },
    ],
  },
  {
    id: 5,
    label: "Legacy",
    items: [
      {
        id: "others",
        title: "Others",
        url: "/dashboard/coming-soon",
        icon: SquareArrowUpRight,
        badge: "soon",
        disabled: true,
      },
    ],
  },
];
