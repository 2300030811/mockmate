import { useCallback } from "react";
import { toast } from "sonner";
import { Node, Connection } from "../types";
import { CHALLENGES } from "../challenges";
import { reviewSystemDesignAction } from "@/app/actions/system-design";

interface UseSystemDesignReviewProps {
  nodes: Node[];
  connections: Connection[];
  activeChallengeId: string | null;
  dispatch: any;
}

export function useSystemDesignReview({
  nodes,
  connections,
  activeChallengeId,
  dispatch,
}: UseSystemDesignReviewProps) {

  const handleReview = useCallback(async () => {
    if (nodes.length === 0) return;
    dispatch({ type: "SET_REVIEWING", isReviewing: true });
    try {
      const activeChallenge = CHALLENGES.find(c => c.id === activeChallengeId);
      const challengeContext = activeChallenge ? {
        title: activeChallenge.title,
        objectives: activeChallenge.objectives,
        constraints: activeChallenge.constraints,
        metrics: activeChallenge.metrics
      } : undefined;

      const result = await reviewSystemDesignAction(nodes, connections, challengeContext);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      dispatch({ type: "SET_REVIEW_RESULT", result: result.markdown, score: result.score });
      toast.success("Audit Complete");
    } catch (err) {
      toast.error("Audit Failed");
    } finally {
      dispatch({ type: "SET_REVIEWING", isReviewing: false });
    }
  }, [nodes, connections, activeChallengeId, dispatch]);

  const onCloseReview = useCallback(() => {
    dispatch({ type: "SET_REVIEW_RESULT", result: null });
  }, [dispatch]);

  return { handleReview, onCloseReview };
}
