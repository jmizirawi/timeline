
import type { Category, Person, TimelineEvent } from '../types';

export function getCategoryColor(entity: Person | TimelineEvent): string {
    const category = entity.category || 'biblical'; // Default to biblical if missing
    const isPerson = 'born' in entity;

    // Hues - Earthy/Muted
    const hues: Record<Category, number> = {
        biblical: 2,
        secular: 40,
        theocratic: 215
    };

    const hue = hues[category];

    // Lightness: People are lighter, Events are darker
    // Adjusted for earthy feel (less contrasty, more pastel/paper-like)
    const lightness = isPerson ? 55 : 45;

    // Saturation: Lower saturation for earthy feel (was 70)
    const saturation = 40;

    // Alpha for transparency
    const alpha = 0.7;

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}
