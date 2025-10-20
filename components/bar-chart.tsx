"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"

interface MonthlyData {
	month: string;
	expenses: number;
	payments: number;
}

interface ChartBarMultipleProps {
	data: MonthlyData[];
}

const chartConfig = {
	expenses: {
		label: "Expenses",
		color: "hsl(0, 84%, 60%)", // Red
	},
	payments: {
		label: "Payments",
		color: "hsl(142, 76%, 36%)", // Green
	},
} satisfies ChartConfig

export function ChartBarMultiple({ data }: ChartBarMultipleProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Payments vs Expenses</CardTitle>
				<CardDescription>Last 6 months comparison</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<BarChart accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => new Intl.NumberFormat("en-US", {
								maximumFractionDigits: 0,
								notation: "compact",
							}).format(value)}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="dashed" />}
						/>
						<Bar dataKey="payments" fill="var(--color-payments)" radius={4} />
						<Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
