function formatRating(rating) {
  return typeof rating === 'number' ? rating.toFixed(1) : '-';
}

export function EntryList({ entries }) {
  if (!entries?.length) {
    return <p className="empty-state">No visits logged yet - add your first one above.</p>;
  }

  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.id} className="entry-list__item">
          {entry.photoUrl && (
            <img src={entry.photoUrl} alt={entry.caption || 'Food photo'} />
          )}
          <div>
            <div className="entry-list__rating">{formatRating(entry.rating)} star</div>
            {entry.caption && <p>{entry.caption}</p>}
            <time>{new Date(entry.visitedAt).toLocaleDateString()}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}
