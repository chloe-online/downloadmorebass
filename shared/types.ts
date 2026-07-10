export interface Track {
  cover: string;
  title: string;
  description: string;
  duration: string;
  artist: string;
  listens: number;
  artistUrl: string;
  url: string;
  stars: number;
  isNew: boolean;
}

export interface TracksResponse {
  user: {
    username: string;
    permalinkUrl: string;
  };
  tracks: Track[];
}
