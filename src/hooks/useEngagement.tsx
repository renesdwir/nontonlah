interface useEngagementButtonProps {
  EngagementData: {
    id: string;
    likes: number;
    dislikes: number;
  };
  Viewer: {
    hasLiked: boolean;
    hasDisliked: boolean;
  };
  addLikeMutation: {
    mutate: (input: { id: string; userId: string }) => void;
  };
  addDislikeMutation: {
    mutate: (input: { id: string; userId: string }) => void;
  };
}
