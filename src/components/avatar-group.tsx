import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AvatarProps = React.ComponentProps<typeof Avatar>;

interface AvatarGroupProps extends React.ComponentProps<"div"> {
	children: React.ReactElement<AvatarProps>[];
	max?: number;
}

const AvatarGroup = ({
	children,
	max,
	className,
	...props
}: AvatarGroupProps) => {
	const totalAvatars = React.Children.count(children);
	const firstChild = React.Children.toArray(children)[0];
	const firstChildClassName = React.isValidElement<AvatarProps>(firstChild)
		? firstChild.props.className
		: undefined;
	const displayedAvatars = React.Children.toArray(children)
		.slice(0, max)
		.reverse();
	const remainingAvatars = max ? Math.max(totalAvatars - max, 1) : 0;

	return (
		<div
			className={cn("flex items-center flex-row-reverse", className)}
			{...props}
		>
			{remainingAvatars > 0 && (
				// Wears the same classes as the avatars it stands in for,
				// otherwise the counter keeps the base size while sized
				// children shrink around it.
				<Avatar
					className={cn(
						firstChildClassName,
						"-ml-2 hover:z-10 relative ring-2 ring-background",
					)}
				>
					<AvatarFallback className="bg-muted-foreground text-white">
						+{remainingAvatars}
					</AvatarFallback>
				</Avatar>
			)}
			{displayedAvatars.map((avatar, index) => {
				if (!React.isValidElement(avatar)) return null;

				return (
					<div key={index} className="-ml-2 hover:z-10 relative">
						{React.cloneElement(avatar as React.ReactElement<AvatarProps>, {
							// Merged, not replaced. Overwriting the child's
							// className threw away whatever size it was given
							// and every avatar snapped back to the default.
							className: cn(
								(avatar as React.ReactElement<AvatarProps>).props.className,
								"ring-2 ring-background",
							),
						})}
					</div>
				);
			})}
		</div>
	);
};

export { AvatarGroup };
