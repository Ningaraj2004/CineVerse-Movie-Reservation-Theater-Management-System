import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Movie, MovieReview } from '../types';
import { apiService } from '../services/apiService';

interface ReviewModalProps {
  movie: Movie;
  reservationId?: string;
  initialReview?: MovieReview | null;
  onClose: () => void;
  onSuccess: (review: MovieReview) => void;
  onDelete?: (reviewId: string) => void;
}

const RATING_LABELS: { [key: number]: string } = {
  1: '1 Star · Poor',
  2: '2 Stars · Fair',
  3: '3 Stars · Good',
  4: '4 Stars · Great',
  5: '5 Stars · Masterpiece',
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  movie,
  reservationId,
  initialReview,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const [rating, setRating] = useState<number>(initialReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(initialReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRating = hoverRating || rating;
  const maxChars = 280;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short review comment.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await apiService.createOrUpdateReview({
      movieId: movie.id,
      reservationId,
      rating,
      comment: comment.trim(),
    });

    setSubmitting(false);

    if (res.status === 200 && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setError(res.error || 'Failed to submit review.');
    }
  };

  const handleDelete = async () => {
    if (!initialReview) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    setSubmitting(true);
    const res = await apiService.deleteReview(initialReview.id);
    setSubmitting(false);

    if (res.status === 200) {
      if (onDelete) onDelete(initialReview.id);
      onClose();
    } else {
      setError(res.error || 'Failed to delete review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f111a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-center pb-4 border-b border-slate-800">
          <img
            src={movie.poster}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-14 h-20 object-cover rounded-xl border border-slate-700 shrink-0 shadow-md"
          />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              Verified Ticket Holder Review
            </div>
            <h3 className="text-xl font-black font-display text-white leading-tight mt-0.5">
              {movie.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {movie.genre} · Directed by {movie.director}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
          {/* Star Rating Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Your Star Rating:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= activeRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-amber-300">
                {RATING_LABELS[activeRating]}
              </span>
            </div>
          </div>

          {/* Comment input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-300 font-semibold">
                Your Review & Impressions:
              </label>
              <span className={`text-[11px] ${comment.length > maxChars ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                {comment.length} / {maxChars}
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={maxChars}
              required
              placeholder="What did you think of the cinematography, acting, sound, or theater experience?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            {initialReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{initialReview ? 'Update Review' : 'Submit Review'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
