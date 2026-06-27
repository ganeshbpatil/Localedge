'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ThumbsUp, Zap, RefreshCw } from 'lucide-react';
import { reviewApi } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { useState } from 'react';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  content: string | null;
  platform: string;
  status: string;
  sentiment: string | null;
  aiReplyDraft: string | null;
  reply: string | null;
  reviewedAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const businessId = 'demo-business-id';
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', businessId],
    queryFn: () => reviewApi.list(businessId).then((r) => r.data.data),
  });

  const generateReplyMutation = useMutation({
    mutationFn: (reviewId: string) => reviewApi.generateAIReply(businessId, reviewId, 'professional'),
    onSuccess: (data, reviewId) => {
      const draft = data.data.data.draft;
      setReplyText(draft);
    },
  });

  const replyMutation = useMutation({
    mutationFn: (vars: { reviewId: string; reply: string }) =>
      reviewApi.reply(businessId, vars.reviewId, vars.reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      setSelectedReview(null);
      setReplyText('');
    },
  });

  const sentimentColors: Record<string, string> = {
    POSITIVE: 'text-green-500 bg-green-500/10',
    NEUTRAL: 'text-yellow-500 bg-yellow-500/10',
    NEGATIVE: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-muted-foreground text-sm">Manage and respond to customer reviews</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-3" />
              <div className="h-3 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))
        ) : reviews?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No reviews yet</p>
          </div>
        ) : (
          (reviews as Review[])?.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{review.authorName[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{review.authorName}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {review.platform}
                      </span>
                      {review.sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentColors[review.sentiment] ?? ''}`}>
                          {review.sentiment.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted-foreground">{formatRelative(review.reviewedAt)}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${review.status === 'REPLIED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {review.status.toLowerCase()}
                </span>
              </div>

              {review.content && (
                <p className="text-sm text-muted-foreground pl-13">{review.content}</p>
              )}

              {review.reply && (
                <div className="ml-4 pl-4 border-l-2 border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Your reply</p>
                  <p className="text-sm text-foreground">{review.reply}</p>
                </div>
              )}

              {review.status !== 'REPLIED' && (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      if (review.aiReplyDraft) setReplyText(review.aiReplyDraft);
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Reply
                  </button>
                  <button
                    onClick={() => generateReplyMutation.mutate(review.id)}
                    disabled={generateReplyMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    {generateReplyMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    AI Reply
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-semibold text-foreground mb-4">Reply to Review</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedReview.content}</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write your reply..."
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => replyMutation.mutate({ reviewId: selectedReview.id, reply: replyText })}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
              </button>
              <button
                onClick={() => { setSelectedReview(null); setReplyText(''); }}
                className="px-4 py-2 bg-accent text-foreground rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
