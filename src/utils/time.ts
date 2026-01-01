/**
 * Converts a historical year (where 1 BCE is followed by 1 CE)
 * into a continuous mathematical timeline.
 * 
 * Rules:
 * - Years > 0 (CE) are shifted -1 (1 CE becomes 0).
 * - Years < 0 (BCE) remain the same (-1 BCE remains -1).
 * - Year 0 is invalid input.
 */
export function countYears(year: number): number {
    if (year === 0) return 0; // Handle 0 as safe fallback to prevent crash
    return year > 0 ? year - 1 : year;
}

/**
 * Converts internal continuous years back to display years.
 * 0 -> 1 CE
 * -1 -> 1 BCE
 */
export function displayYear(internalYear: number): number {
    return internalYear >= 0 ? internalYear + 1 : internalYear;
}

/**
 * Formats a year for display (e.g. "1513 BCE" or "2026 CE")
 */
export function formatYearLabel(year: number): string {
    if (year === 0) return ""; // Should not happen with displayYear, but safety
    const abs = Math.abs(year);
    return year < 0 ? `${abs} BCE` : `${abs} CE`;
}

export type DateCertainty = 'circa' | 'guess' | 'before' | 'after';

export function formatDateWithCertainty(year: number, certainty?: string): string {
    const label = formatYearLabel(year);
    if (certainty === 'circa') return `c. ${label}`;
    if (certainty === 'guess') return `~ ${label}`;
    if (certainty === 'before') return `b. ${label}`;
    if (certainty === 'after') return `a. ${label}`;
    return label;
}

/**
 * Converts a user year to pixel position relative to start of time (-4026)
 * @param year The historical year
 * @param scale Pixels per year
 * @param startDate User's start year (default -4026)
 */
export function yearToPx(year: number, scale: number, startDate: number = -4026): number {
    const internalTarget = countYears(year);
    const internalStart = countYears(startDate);
    return (internalTarget - internalStart) * scale;
}
