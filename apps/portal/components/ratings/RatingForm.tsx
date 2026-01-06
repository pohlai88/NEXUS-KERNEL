/**
 * Rating Form Component
 * 
 * Two-Way Rating: Vendor rates Company/Staff, Company rates Vendor.
 * Transparency: Blackbox (private) or Whitebox (public).
 */

'use client';

import { useState, useTransition } from 'react';
import { createRatingAction } from '@/app/ratings/actions';

interface RatingFormProps {
  ratingType: 'vendor_to_company' | 'vendor_to_staff' | 'vendor_to_department' | 'company_to_vendor';
  ratedEntityId: string;
  ratedEntityType: 'vendor' | 'user' | 'department' | 'company';
  ratedEntityName: string;
  relatedCaseId?: string;
  relatedInvoiceId?: string;
  relatedEscalationId?: string;
  onRated?: () => void;
}

export function RatingForm({
  ratingType,
  ratedEntityId,
  ratedEntityType,
  ratedEntityName,
  relatedCaseId,
  relatedInvoiceId,
  relatedEscalationId,
  onRated,
}: RatingFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [problemResolutionRating, setProblemResolutionRating] = useState(0);
  const [ratingText, setRatingText] = useState('');
  const [positiveAspects, setPositiveAspects] = useState<string[]>([]);
  const [negativeAspects, setNegativeAspects] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'blackbox' | 'whitebox'>('whitebox');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (overallRating === 0) {
      setError('Overall rating is required');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('rating_type', ratingType);
      formData.append('visibility', visibility);
      formData.append('overall_rating', overallRating.toString());
      formData.append('communication_rating', communicationRating.toString());
      formData.append('professionalism_rating', professionalismRating.toString());
      formData.append('timeliness_rating', timelinessRating.toString());
      formData.append('problem_resolution_rating', problemResolutionRating.toString());
      formData.append('rating_text', ratingText);
      formData.append('positive_aspects', JSON.stringify(positiveAspects));
      formData.append('negative_aspects', JSON.stringify(negativeAspects));
      formData.append('is_anonymous', isAnonymous.toString());

      if (ratedEntityType === 'vendor') {
        formData.append('rated_vendor_id', ratedEntityId);
      } else if (ratedEntityType === 'user') {
        formData.append('rated_user_id', ratedEntityId);
      } else if (ratedEntityType === 'department') {
        formData.append('rated_department', ratedEntityId);
      } else if (ratedEntityType === 'company') {
        formData.append('rated_company_id', ratedEntityId);
      }

      if (relatedCaseId) formData.append('related_case_id', relatedCaseId);
      if (relatedInvoiceId) formData.append('related_invoice_id', relatedInvoiceId);
      if (relatedEscalationId) formData.append('related_escalation_id', relatedEscalationId);

      const result = await createRatingAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onRated?.();
      }
    });
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="mb-4">
      <label className="caption mb-2 block">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= value ? 'text-nx-warning' : 'text-nx-text-muted'}`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <h3 className="section mb-4">Rate {ratedEntityName}</h3>

      <StarRating value={overallRating} onChange={setOverallRating} label="Overall Rating *" />
      <StarRating value={communicationRating} onChange={setCommunicationRating} label="Communication" />
      <StarRating value={professionalismRating} onChange={setProfessionalismRating} label="Professionalism" />
      <StarRating value={timelinessRating} onChange={setTimelinessRating} label="Timeliness" />
      <StarRating value={problemResolutionRating} onChange={setProblemResolutionRating} label="Problem Resolution" />

      <div className="mb-4">
        <label className="caption mb-2 block">Feedback</label>
        <textarea
          value={ratingText}
          onChange={(e) => setRatingText(e.target.value)}
          className="input w-full"
          rows={4}
          placeholder="Share your experience..."
        />
      </div>

      <div className="mb-4">
        <label className="caption mb-2 block">Visibility</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="whitebox"
              checked={visibility === 'whitebox'}
              onChange={() => setVisibility('whitebox')}
            />
            <span>Whitebox (Public)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="blackbox"
              checked={visibility === 'blackbox'}
              onChange={() => setVisibility('blackbox')}
            />
            <span>Blackbox (Private)</span>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <span>Submit anonymously</span>
        </label>
      </div>

      {error && (
        <div className="card p-4 bg-nx-danger-bg text-nx-danger mb-4">
          <p className="caption">{error}</p>
        </div>
      )}

      <button
        className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full"
        onClick={handleSubmit}
        disabled={isPending || overallRating === 0}
      >
        {isPending ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
}

