"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NavMain({
	items,
}: {
	items: {
		title: string
		url: string
		icon: LucideIcon
		isActive?: boolean
	}[]
}) {
	const pathname = usePathname()

	return (
		<SidebarMenu className="space-y-1 px-2">
			{items.map((item) => {
				const isActive = pathname === item.url
				
				return (
					<SidebarMenuItem key={item.title}>
						<Link 
							href={item.url}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
								"hover:bg-accent hover:text-accent-foreground",
								isActive 
									? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm" 
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<item.icon className={cn(
								"h-5 w-5",
								isActive ? "text-white" : ""
							)} />
							<span>{item.title}</span>
							{isActive && (
								<div className="ml-auto h-2 w-2 rounded-full bg-white" />
							)}
						</Link>
					</SidebarMenuItem>
				)
			})}
		</SidebarMenu>
	)
}
