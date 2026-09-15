import { Link } from "wouter";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Clapperboard,
  Flag,
  Heart,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Layers,
  Megaphone,
  Package,
  Palette,
  BarChart3,
  Puzzle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  key: string;
  label: string;
  icon: typeof Megaphone;
  href?: string;
};

const createItems: NavItem[] = [
  { key: "new-ads", label: "New Ads", icon: Megaphone },
  { key: "ad-designs", label: "Ad Designs", icon: LayoutGrid },
  { key: "characters", label: "Characters", icon: Users },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "video", label: "Video", icon: Clapperboard, href: "/studio/video" },
];

const insightItems: NavItem[] = [
  { key: "your-ads", label: "Your ads", icon: Layers },
  { key: "ad-performance", label: "Ad Performance", icon: BarChart3 },
  { key: "trending-ads", label: "Trending Ads", icon: TrendingUp },
  { key: "following", label: "Following", icon: Heart },
];

const assetItems: NavItem[] = [
  { key: "albums", label: "Albums", icon: Images },
  { key: "products", label: "Products", icon: Package },
];

const brandItems: NavItem[] = [
  { key: "kit", label: "Kit", icon: Palette },
  { key: "brand-strategy", label: "Brand Strategy", icon: Flag },
];

const integrationItems: NavItem[] = [
  { key: "integrations", label: "Integrations", icon: Puzzle },
];

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const content = (
    <div
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[12.5px] hover-elevate",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
          : "text-sidebar-foreground/80",
      )}
      data-testid={`nav-${item.key}`}
    >
      <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{item.label}</span>
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{content}</Link>;
  }
  return content;
}

function NavGroup({ title, items, active }: { title: string; items: NavItem[]; active: string }) {
  return (
    <div className="flex w-full flex-col gap-0.5 pt-3">
      <p className="px-2 pb-1 text-[9.5px] font-semibold tracking-[0.08em] text-muted-foreground">
        {title}
      </p>
      {items.map((item) => (
        <NavRow key={item.key} item={item} active={item.key === active} />
      ))}
    </div>
  );
}

export function StudioSidebar({ active }: { active: string }) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 pb-2.5 pt-3.5">
      <div className="flex w-full items-center justify-between pb-3 px-1.5">
        <p className="text-[15px] font-bold text-sidebar-foreground">adza.ai</p>
        <button
          type="button"
          className="flex items-center rounded-md border px-1 py-0.5 text-muted-foreground hover-elevate"
          data-testid="button-collapse-sidebar"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
      </div>

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg border bg-background px-2 py-1.5 hover-elevate"
        data-testid="button-workspace-switcher"
      >
        <div className="h-6 w-6 shrink-0 rounded-md bg-muted" />
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="truncate text-xs font-bold text-foreground">adza.ai</span>
          <span className="truncate text-[10px] text-muted-foreground">Seevi kargwal</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      <NavGroup title="CREATE" items={createItems} active={active} />
      <NavGroup title="INSIGHTS" items={insightItems} active={active} />
      <NavGroup title="ASSETS" items={assetItems} active={active} />
      <NavGroup title="BRAND" items={brandItems} active={active} />
      <NavGroup title="INTEGRATIONS" items={integrationItems} active={active} />

      <div className="flex-1" />

      <div className="flex w-full items-center gap-2 border-t border-sidebar-border px-1.5 pt-2.5">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px]">SK</AvatarFallback>
        </Avatar>
        <span className="flex-1 truncate text-[11.5px] font-semibold text-sidebar-foreground">
          Seevi kargwal
        </span>
        <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </aside>
  );
}
