export type DateCertainty = 'circa' | 'guess' | 'before' | 'after';
export type Category = 'biblical' | 'secular' | 'theocratic';

export interface LifeEvent {
    // Year e.g. -1513
    startDate?: number;
    startDateCertainty?: DateCertainty;
    location?: string;
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
}

export interface Person {
    id: string;
    name: string;
    born: number;
    bornCertainty?: DateCertainty;
    died?: number;
    diedCertainty?: DateCertainty;
    lifeEvents: LifeEvent[];
    url?: string;
    category?: Category;
    living?: boolean;
    verified?: boolean;
    description?: string;
    imageUrl?: string;
}

export interface TimelineEvent {
    id: string;
    title: string;
    startDate: number;
    startDateCertainty?: DateCertainty;
    endDate?: number;
    endDateCertainty?: DateCertainty;
    description?: string;
    url?: string;
    subEvents?: LifeEvent[];
    category?: Category;
    ongoing?: boolean;
    verified?: boolean;
    imageUrl?: string;
}

export interface ChronologyData {
    people: Person[];
    events: TimelineEvent[];
}
