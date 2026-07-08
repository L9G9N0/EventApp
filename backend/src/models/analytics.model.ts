import { Schema, model, Document } from 'mongoose';

export type AnalyticsEventType =
  | 'event_list_viewed'
  | 'event_search_performed'
  | 'event_filter_applied'
  | 'event_card_clicked'
  | 'registration_submitted'
  | 'registration_success'
  | 'registration_failed'
  | 'dashboard_opened'
  | 'dashboard_export_csv';

export interface IAnalytics extends Document {
  eventType: AnalyticsEventType;
  payload: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'event_list_viewed',
        'event_search_performed',
        'event_filter_applied',
        'event_card_clicked',
        'registration_submitted',
        'registration_success',
        'registration_failed',
        'dashboard_opened',
        'dashboard_export_csv',
      ],
    },
    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userAgent: { type: String },
    ipAddress: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexing eventType and createdAt for rapid dashboard retrieval
analyticsSchema.index({ eventType: 1, createdAt: -1 });

export const AnalyticsLog = model<IAnalytics>('AnalyticsLog', analyticsSchema);
