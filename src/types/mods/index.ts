export type Mod = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastChangeLog: string;
};

export type ModJson = {
  publishedfileid: string;
  result: number;
  creator: string;
  creator_app_id: number;
  consumer_app_id: number;
  filename: string;
  file_size: string;
  file_url: string;
  hcontent_file: string;
  preview_url: string;
  hcontent_preview: string;
  title: string;
  description: string;
  time_created: number;
  time_updated: number;
  visibility: number;
  banned: number;
  ban_reason: string;
  subscriptions: number;
  favorited: number;
  lifetime_subscriptions: number;
  lifetime_favorited: number;
  views: number;
  tags: Tag[];
};

export type Tag = {
  tag: string;
};
