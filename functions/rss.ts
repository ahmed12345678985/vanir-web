import { buildRssResponse } from "./_rss";

export const onRequestGet: PagesFunction = async () => {
  return buildRssResponse();
};
