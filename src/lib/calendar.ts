/**
 * Utility to generate direct "Add to Calendar" links for emails and web pages.
 */

export interface CalendarEventDetails {
  title: string;
  description?: string | null;
  venue: string;
  startDate: Date | string;
  endDate?: Date | string | null;
}

/**
 * Generates a direct Google Calendar template URL that pre-fills event details.
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  venue,
  startDate,
  endDate,
}: CalendarEventDetails): string {
  const start = new Date(startDate);
  const end = endDate
    ? new Date(endDate)
    : new Date(start.getTime() + 3 * 60 * 60 * 1000); // Default to 3 hours if no end date

  const formatUtcTime = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const detailsText = `${description || title}\n\nVenue: ${venue}\nOrganised by Schools Voice (Formerly Port Harcourt Schools)`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: detailsText,
    location: venue,
    dates: `${formatUtcTime(start)}/${formatUtcTime(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
