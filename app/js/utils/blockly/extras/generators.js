require('./json');

import MathJSONGenerators       from './math/generators';
import LogicJSONGenerators      from './logic/generators';
import ControlsJSONGenerators   from './controls/generators';
import EventJSONGenerators      from './event/generators';
import StripJSONGenerators      from './strip/generators';

let JSONGenerators = {};

for (let math_generator in MathJSONGenerators) {
    JSONGenerators[math_generator] = MathJSONGenerators[math_generator]
}

for (let logic_generator in LogicJSONGenerators) {
    JSONGenerators[logic_generator] = LogicJSONGenerators[logic_generator]
}

for (let control_generator in ControlsJSONGenerators) {
    JSONGenerators[control_generator] = ControlsJSONGenerators[control_generator]
}

for (let event_generator in EventJSONGenerators) {
    JSONGenerators[event_generator] = EventJSONGenerators[event_generator]
}

for (let strip_generator in StripJSONGenerators) {
    JSONGenerators[strip_generator] = StripJSONGenerators[strip_generator]
}

export default JSONGenerators;