import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function AvatarTooltip({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className='bg-gray-700'>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
