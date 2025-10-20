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
			<SidebarHeader className="border-b pb-4">
				<div className="px-4 py-2">
					<h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						Expense Tracker
					</h2>
					<p className="text-xs text-muted-foreground">Manage your finances</p>
				</div>
			</SidebarHeader>
			<SidebarContent className="pt-4">
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
