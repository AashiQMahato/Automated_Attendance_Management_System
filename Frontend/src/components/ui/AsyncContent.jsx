import { Card } from "./Card";
import { ErrorState } from "./States";
import { LoadingRegion } from "./Skeleton";

// Shared loading → error → content switch. `skeleton` should mirror the final
// layout so nothing shifts when data arrives.
const AsyncContent = ({ loading, error, onRetry, skeleton, errorTitle, loadingLabel = "Loading", bare = false, children }) => {
  if (loading) return <LoadingRegion label={loadingLabel}>{skeleton}</LoadingRegion>;
  if (error) {
    const state = <ErrorState title={errorTitle} onRetry={() => onRetry?.()} />;
    return bare ? state : <Card>{state}</Card>;
  }
  return typeof children === "function" ? children() : children;
};

export default AsyncContent;
