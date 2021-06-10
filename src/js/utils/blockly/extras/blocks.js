import MathJSONBlocks       from './math/blocks';
import LogicJSONBlocks      from './logic/blocks';
import ControlsJSONBlocks   from './controls/blocks';
import EventJSONBlocks      from './event/blocks';
import StripJSONBlocks      from './strip/blocks';
import ArduinoJSONBlocks    from './arduino/blocks';
import DummyJSONBlocks        from './dummy/blocks';
import { CATEGORIES } from './constants';

const JSONBlocks = [
    {name: 'Арифметика', colour: CATEGORIES.MATH.colour,     items: {...MathJSONBlocks}},
    {name: 'Логика',     colour: CATEGORIES.LOGIC.colour,    items: {...LogicJSONBlocks}},
    {name: 'Управление', colour: CATEGORIES.LOOP.colour,     items: {...ControlsJSONBlocks, ...EventJSONBlocks}},
    {name: 'Гирлянда',   colour: CATEGORIES.COLOUR.colour,   hidden: true, items: {...StripJSONBlocks}},
    {name: 'Arduino',    colour: CATEGORIES.ARDUINO.colour,  items: {...ArduinoJSONBlocks}},
    {name: 'Dummy',      colour: CATEGORIES.DUMMY.colour,    items: {...DummyJSONBlocks}}
];

export default JSONBlocks;