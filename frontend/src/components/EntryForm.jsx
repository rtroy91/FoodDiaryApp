import { useState } from 'react';
import { StarRatingInput } from './StarRatingInput';
import { uploadPhoto } from '../api/entries';
import { useCreateEntry } from '../hooks/useDiaryData';

export function EntryForm({ restaurantId, onSaved }) {
  const [rating, setRating] = useState(0);
  const [caption, setCaption] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const createEntry = useCreateEntry();

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Pick a rating from 1 to 5 stars.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      await createEntry.mutateAsync({
        restaurantId,
        visitedAt: new Date().toISOString(),
        rating,
        caption,
        photoUrl
      });

      setRating(0);
      setCaption('');
      setPhotoFile(null);
      setPhotoPreview(null);
      onSaved?.();
    } catch (err) {
      setErrorMessage('Could not save your entry. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <label>
        Rating
        <StarRatingInput value={rating} onChange={setRating} />
      </label>

      <label>
        Caption
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What did you have? How was it?"
          rows={3}
        />
      </label>

      <label>
        Photo
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </label>

      {photoPreview && (
        <img src={photoPreview} alt="Preview" className="entry-form__preview" />
      )}

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Log this visit'}
      </button>
    </form>
  );
}
