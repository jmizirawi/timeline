
import biblical from './biblical.yml';
import secular from './secular.yml';
import theocratic from './theocratic.yml';
import type { ChronologyData } from '../types';

const biblicalData = biblical as ChronologyData;
const secularData = secular as ChronologyData;
const theocraticData = theocratic as ChronologyData;

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
