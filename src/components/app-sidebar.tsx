"use client";

import * as React from "react";
import {
  //AudioWaveform,
  // BookOpen,
  //  Bot,
  Command,
  //Frame,
  //GalleryVerticalEnd,
  // Map,
  //  PieChart,
  //  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
//import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Max Cabezas",
    email: "admin@admin.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Carnes Mardely",
      logo: Command,
      plan: "Control",
    } /*
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },*/,
  ],
  navMain: [
    {
      title: "Dashboard", 
      url: "/",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Inicio",
          url: "/",
        },
        {
          title: "Clientes",
          url: "/clientes", // Corregido
        },
        {
          title: "Compras",
          url: "/compras", // Corregido
        },
        {
          title: "Inventario",
          url: "/inventario", // Corregido
        },
        {
          title: "Productos",
          url: "/productos", // Corregido
        },
        {
          title: "Proveedores",
          url: "/proveedores", // Corregido
        },
        {
          title: "Ventas",
          url: "/ventas", // Corregido
        },
      ],
    },
    /*
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },*/
  ],
  /* projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],*/
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}