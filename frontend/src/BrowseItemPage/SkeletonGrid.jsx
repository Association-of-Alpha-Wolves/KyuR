export default function SkeletonGrid() {
  return (
    <div className="item-grid" aria-label="Loading items">
      {Array.from({ length: 6 }, (_, index) => (
        <article className="item-card skeleton-card" key={index}>
          <div className="skeleton skeleton-image" />
          <div className="item-card-body">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        </article>
      ))}
    </div>
  )
}
