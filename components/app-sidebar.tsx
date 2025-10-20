"use client"

import * as React from "react"
import {
	DollarSign,
	Home,
	ShoppingCart,
	SquareDashed,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar"

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: Home,
		},
		{
			title: "Expenses",
			url: "/expenses",
			icon: ShoppingCart,
		},
		{
			title: "Payments",
			url: "/payments",
			icon: DollarSign,
		},
		{
			title: "Categories",
			url: "/categories",
			icon: SquareDashed,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader>
				<NavMain items={data.navMain} />
			</SidebarHeader>
			<SidebarContent>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
