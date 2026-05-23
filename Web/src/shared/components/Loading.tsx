import { Icon } from "lucide-react";
import { soccerBall } from "@lucide/lab";

export const Loading = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-8 min-h-[200px]">
      <div className="animate-bounce [animation-delay:0ms]">
        <Icon iconNode={soccerBall} className="w-6 h-6 text-foreground" />
      </div>
      <div className="animate-bounce [animation-delay:150ms]">
        <Icon iconNode={soccerBall} className="w-6 h-6 text-foreground" />
      </div>
      <div className="animate-bounce [animation-delay:300ms]">
        <Icon iconNode={soccerBall} className="w-6 h-6 text-foreground" />
      </div>
    </div>
  );
};
