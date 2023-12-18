import React from "react";

interface LikeDislikeButtonProps {
  EngagementData: {
    id: string;
    likes: number;
    dislikes: number;
  };
  viewer: {
    hasLiked: boolean;
    hasDisliked: boolean;
  };
}

export default function LikeDislikeButton({
  EngagementData,
  viewer,
}: LikeDislikeButtonProps) {
  return (
    <>
      <p>Like Dislike</p>
    </>
  );
}
