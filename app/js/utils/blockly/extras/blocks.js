import MathJSONBlocks       from './math/blocks';
import LogicJSONBlocks      from './logic/blocks';
import ControlsJSONBlocks   from './controls/blocks';
import EventJSONBlocks      from './event/blocks';
import StripJSONBlocks      from './strip/blocks';
import ArduinoJSONBlocks    from './arduino/blocks';

let JSONBlocks = {};

for (let math_block     in MathJSONBlocks)          {JSONBlocks[math_block] = MathJSONBlocks[math_block]}
for (let logic_block    in LogicJSONBlocks)         {JSONBlocks[logic_block] = LogicJSONBlocks[logic_block]}
for (let control_block  in ControlsJSONBlocks)      {JSONBlocks[control_block] = ControlsJSONBlocks[control_block]}
for (let event_block    in EventJSONBlocks)         {JSONBlocks[event_block] = EventJSONBlocks[event_block]}
for (let strip_block    in StripJSONBlocks)         {JSONBlocks[strip_block] = StripJSONBlocks[strip_block]}
for (let arduino_block  in ArduinoJSONBlocks)       {JSONBlocks[arduino_block] = ArduinoJSONBlocks[arduino_block]}

export default JSONBlocks;