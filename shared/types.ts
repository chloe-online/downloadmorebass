export interface WebProfile {
  service: string;
  title: string;
  url: string;
  username: string;
}

export interface ArtistProfile {
  username: string;
  permalinkUrl: string;
  avatarUrl: string;
  description: string;
  city: string;
  country: string;
  followersCount: number;
  trackCount: number;
  createdAt: string;
  webProfiles: WebProfile[];
}

export interface Track {
  id: number;
  cover: string;
  title: string;
  description: string;
  duration: string;
  artist: string;
  listens: number;
  likes: number;
  artistUrl: string;
  url: string;
  stars: number;
  isNew: boolean;
  publishedAt: string;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  timestamp: number | null;
  user: {
    username: string;
    avatarUrl: string;
    profileUrl: string;
  };
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface TracksResponse {
  user: ArtistProfile;
  tracks: Track[];
}

export interface StreamResponse {
  url: string;
  format: "mp3" | "hls";
}
