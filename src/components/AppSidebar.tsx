import { Video, Search, Image, Scan } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const tools = [
  { title: "Video Repurposer", url: "/video-repurposer", icon: Video },
  { title: "Video Similarity", url: "/video-similarity", icon: Search },
  { title: "Image Similarity", url: "/image-similarity", icon: Scan },
  { title: "Image Spoofer", url: "/image-spoofer", icon: Image },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === tool.url}>
                    <NavLink to={tool.url}>
                      <tool.icon />
                      <span>{tool.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}