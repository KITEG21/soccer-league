import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

const CREATORS = [
  {
    name: "Br4voCode",
    github: "https://github.com/Br4voCode",
    avatar:
      "https://avatars.githubusercontent.com/u/196562378?s=400&u=9098ee191aaa9324fda32b6c9b3172c979484207&v=4",
    initials: "BC",
  },
  {
    name: "KITEG21",
    github: "https://github.com/KITEG21",
    avatar: "https://avatars.githubusercontent.com/u/150097269?v=4",
    initials: "K",
  },
  {
    name: "hasielrb",
    github: "https://github.com/hasielrb",
    avatar: "https://avatars.githubusercontent.com/u/198116826?v=4",
    initials: "H",
  },
];

const CURRENT_YEAR = new Date().getFullYear();

export const AppFooter = () => {
  return (
    <footer className="sticky bottom-0 z-10 mt-auto border-t bg-background/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {CURRENT_YEAR} Soccer League Manager. Todos los derechos reservados.
        </p>

        <div className="flex items-center gap-2">
          <span>Desarrollado por</span>
          <div className="flex items-center gap-1">
            {CREATORS.map((creator) => (
              <Tooltip key={creator.name}>
                <TooltipTrigger asChild>
                  <a
                    href={creator.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={creator.name}
                    className="rounded-full ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Avatar className="size-6 ring-1 ring-border">
                      <AvatarImage src={creator.avatar} alt="" />
                      <AvatarFallback className="text-[9px]">
                        {creator.initials}
                      </AvatarFallback>
                    </Avatar>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2">
                  <Avatar className="size-5">
                    <AvatarImage src={creator.avatar} alt="" />
                    <AvatarFallback className="text-[8px]">
                      {creator.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{creator.name}</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
