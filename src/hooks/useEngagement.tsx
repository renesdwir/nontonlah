import { useState } from "react";

interface useEngagementButtonProps {
  EngagementData: {
    id: string;
    likes: number;
    dislikes: number;
  };
  viewer: {
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

export function useEngagementButton({
  EngagementData,
  viewer,
  addLikeMutation,
  addDislikeMutation,
}: useEngagementButtonProps) {
  const [likeCount, setLikeCount] = useState(EngagementData.likes);
  const [dislikeCount, setDislikeCount] = useState(EngagementData.dislikes);
  const [userChoice, setUserChoice] = useState({
    like: viewer.hasLiked,
    dislike: viewer.hasDisliked,
  });
}
