
import { data as biblicalData } from './biblical';
import { data as secularData } from './secular';
import { data as theocraticData } from './theocratic';
import type { ChronologyData } from '../types';

const chronologyData: ChronologyData = {
    people: [
        ...biblicalData.people.map(p => ({ ...p, category: 'biblical' as const })),
        ...secularData.people.map(p => ({ ...p, category: 'secular' as const })),
        ...theocraticData.people.map(p => ({ ...p, category: 'theocratic' as const }))
    ],
    events: [
        ...biblicalData.events.map(e => ({ ...e, category: 'biblical' as const })),
        ...secularData.events.map(e => ({ ...e, category: 'secular' as const })),
        ...theocraticData.events.map(e => ({ ...e, category: 'theocratic' as const }))
    ]
};

export default chronologyData;
