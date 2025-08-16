import type { VerticalPack } from "./vertical";
import type { HomeContent } from "./pages/home";

export type SitePack = VerticalPack & {
  pages: {
    home: HomeContent;
  };
};
