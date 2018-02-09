import {BlocklyJSONGenerators as StripJSONGenerators} from './strip/generators';
import {BlocklyJSONGenerators as EventJSONGenerators} from './event/generators';

let BlocklyJSONGenerators = {};

for (let strip_generator in StripJSONGenerators) {BlocklyJSONGenerators.push(strip_block)}
for (let event_generator in EventJSONGenerators) {BlocklyJSONGenerators.push(event_block)}

export default BlocklyJSONGenerators;