import React from 'react';
import { X, Star, MessageSquare, CheckCircle, User } from 'lucide-react';
import { Movie, MovieReview } from '../types';

interface ReviewsListModalProps {
  movie: Movie;
  reviews: MovieReview[];
  onClose: () => void;
  onOpenAddReview?: () => void;
  canReview?: boolean;
}

export const ReviewsListModal: React.FC<ReviewsListModalProps> = ({
  movie,
  reviews,
  onClose,
  onOpenAddReview,
  canReview,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f111a] border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 shrink-0">
          <div className="flex gap-3 items-center">
            <img
              src={movie.poster}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-12 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold font-display text-white">{movie.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {movie.averageRating ? `${movie.averageRating} / 5` : 'Unrated'}
                </span>
                <span>·</span>
                <span>{reviews.length} Verified Audience Reviews</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-4 overflow-y-auto flex-1 space-y-3.5 pr-1">
          {reviews.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">No audience reviews yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Book tickets for this title to be among the first to leave a verified review!
              </p>
            </div>
          ) : (
            reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px]">
                      {rev.userName.charAt(0)}
                    </div>
                    <span className="font-semibold text-white">{rev.userName}</span>
                    <span className="text-[10px] text-amber-400/80 uppercase font-semibold flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-amber-400 ml-1.5">
                    {rev.rating}.0
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Reviews from verified ticket buyers
          </span>

          <div className="flex items-center gap-2">
            {canReview && onOpenAddReview && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddReview();
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                Write a Review
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
