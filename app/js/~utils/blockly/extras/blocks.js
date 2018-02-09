import StripJSONBlocks from './strip/blocks';
import EventJSONBlocks from './event/blocks';

let JSONBlocks = {};

for (let strip_block in StripJSONBlocks)    {JSONBlocks[strip_block] = StripJSONBlocks[strip_block]}
for (let event_block in EventJSONBlocks)    {JSONBlocks[event_block] = EventJSONBlocks[event_block]}

export default JSONBlocks;