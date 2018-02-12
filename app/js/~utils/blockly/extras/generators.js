require('./json');

import StripJSONGenerators from './strip/generators';
import EventJSONGenerators from './event/generators';

let JSONGenerators = {};

for (let strip_generator in StripJSONGenerators) {
    JSONGenerators[strip_generator] = StripJSONGenerators[strip_generator]
}

for (let event_generator in EventJSONGenerators) {
    JSONGenerators[event_generator] = EventJSONGenerators[event_generator]
}

export default JSONGenerators;