import type { DefaultTheme } from "vitepress";

export const creators: DefaultTheme.TeamMember[] = [
  {
    name: "Br4voCode",
    avatar: "https://avatars.githubusercontent.com/u/196562378?s=400&u=9098ee191aaa9324fda32b6c9b3172c979484207&v=4",
    links: [{ icon: "github", link: "https://github.com/Br4voCode" }],
  },
  {
    name: "KITEG21",
    avatar: "https://avatars.githubusercontent.com/u/150097269?v=4",
    links: [{ icon: "github", link: "https://github.com/KITEG21" }],
  },
  {
    name: "hasielrb",
    avatar: "https://avatars.githubusercontent.com/u/198116826?v=4",
    links: [{ icon: "github", link: "https://github.com/hasielrb" }],
  },
  {
    name: "IsaacAlefGarciaBatista",
    avatar: "https://avatars.githubusercontent.com/u/261979035?v=4",
    links: [{ icon: "github", link: "https://github.com/IsaacAlefGarciaBatista" }],
  },
];

export const creatorCredits = creators.map((creator) =>
  `<a href="${creator.links![0].link}" target="_blank" rel="noopener noreferrer">${creator.name}</a>`,
).join(" · ");
