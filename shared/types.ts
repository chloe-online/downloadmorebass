export interface ArtistProfile {
  username: string;
  permalinkUrl: string;
  avatarUrl: string;
  description: string;
  city: string;
  country: string;
  followersCount: number;
  trackCount: number;
}

export interface Track {
  id: number;
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
