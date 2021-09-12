import Plate from "../core/Plate"
import BridgePlate from "./BridgePlate"
import ButtonPlate from "./ButtonPlate"
import BuzzerPlate from "./BuzzerPlate"
import CapacitorPlate from "./CapacitorPlate"
import DummyPlate from "./DummyPlate"
import InductorPlate from "./InductorPlate"
import LEDPlate from "./LEDPlate"
import PhotoresistorPlate from "./PhotoresistorPlate"
import RelayPlate from "./RelayPlate"
import ResistorPlate from "./ResistorPlate"
import RGBPlate from "./RGBPlate"
import RheostatPlate from "./RheostatPlate"
import SwitchPlate from "./SwitchPlate"
import TransistorPlate from "./TransistorPlate"

/**
 * Single option of the {@link SelectorItem}.
 * Each option represents a plate with specific property set
 * as a preset to use in {@link SelectorLayer} for instant plate selection.
 * 
 * For example, if the type is {@link ResistorPlate}, then one of its options might be '100 Ohm'.
 * 
 * @category Breadboard
 */
export type SelectorItemOption = {
    title: string,
    properties?: {[key: string]: any}
}

/**
 * Single item for the menu from {@link SelectorLayer}.
 * Each item represents a plate with specific type and it
 * can contain few options, and also the custom one to give the user
 * ability to set preferred property value on one's own.
 * 
 * @category Breadboard
 */
export type SelectorItem = {
    /** item title */
    title: string,
    /** plate type (will be used to render option previews) */
    type: new (...args: any[]) => Plate,
    /** space-delimited set of search tags  */
    tags: string,
    /** property preset options */
    options: SelectorItemOption[],
    /** option with custom property value */
    custom?: {
        /** the key of the customizable property */
        property_key: string,
        /** details of the default preset */
        default: {
            /** title of the customizable option */
            title: string,
            /** default preset that will be customized */
            properties: { [key: string]: any }
        }
    }
}

/**
 * Items for {@link SelectorLayer}'s flyout menu
 * 
 * @category Breadboard
 */
const ITEMS: SelectorItem[] = [
    {
        title: "Перемычка",
        type: BridgePlate,
        tags: "перемычка мост bridge gthtvsxrf vjcn икшвпу",
        options: [
            {title: "2 клетки", properties: {[BridgePlate.PROP_LENGTH]: 2}},
            {title: "3 клетки", properties: {[BridgePlate.PROP_LENGTH]: 3}},
            {title: "4 клетки", properties: {[BridgePlate.PROP_LENGTH]: 4}},
            {title: "5 клеток", properties: {[BridgePlate.PROP_LENGTH]: 5}},
            {title: "6 клеток", properties: {[BridgePlate.PROP_LENGTH]: 6}},
        ],
        custom: {
            default: {title: "Свой размер", properties: {[BridgePlate.PROP_LENGTH]: 2}},
            property_key: BridgePlate.PROP_LENGTH
        }
    },
    {
        title: "Светодиод",
        tags: "светодиод лампа свет led diode light cdtnjlbjl kfvgf cdtn дув вшщву дшпре",
        type: LEDPlate,
        options: [
            {title: "Красный",  properties: {[LEDPlate.PROP_COLOUR]: LEDPlate.COLOURS.RED}},
            {title: "Зелёный",  properties: {[LEDPlate.PROP_COLOUR]: LEDPlate.COLOURS.GREEN}},
            {title: "Синий",    properties: {[LEDPlate.PROP_COLOUR]: LEDPlate.COLOURS.BLUE}},
        ]
    },
    {
        title: "Резистор",
        tags: "резистор сопротивление resistor htpbcnjh cjghjnbdktybt куышыещк",
        type: ResistorPlate,
        options: [
            {title: "200 Ом",   properties: {[ResistorPlate.PROP_RESISTANCE]: 200}},
            {title: "1 кОм",    properties: {[ResistorPlate.PROP_RESISTANCE]: 1000}},
            {title: "10 кОм",   properties: {[ResistorPlate.PROP_RESISTANCE]: 10000}},
            {title: "30 кОм",   properties: {[ResistorPlate.PROP_RESISTANCE]: 30000}},
        ],
        custom: {
            default: {title: "Свой номинал (кОм)", properties: {[ResistorPlate.PROP_RESISTANCE]: 100}},
            property_key: ResistorPlate.PROP_RESISTANCE,
        }
    },
    {
        title: "Конденсатор",
        tags: "конденсатор ёмкость емкость capacitor rjyltycfnjh `vrjcnm tvrjcnm сфзфсшещк",
        type: CapacitorPlate,
        options: [
            {title: "100 мкФ", properties: {[CapacitorPlate.PROP_CAPACITANCE]: 1e-4}},
            {title: "1000 мкФ", properties: {[CapacitorPlate.PROP_CAPACITANCE]: 1e-3}},
        ],
        custom: {
            default: {title: "Своя ёмкость (пкФ)", properties: {[CapacitorPlate.PROP_CAPACITANCE]: 200}},
            property_key: CapacitorPlate.PROP_CAPACITANCE,
        }
    },
    {
        title: "Транзистор",
        tags: "транзистор transistor nhfypbcnjh екфтышыещк",
        type: TransistorPlate,
        options: [{title: "Обычный"}],
    },
    {
        title: "Фоторезистор",
        tags: "фоторезистор photoresistor ajnjhtpbcnjh зрщещкуышыещк",
        type: PhotoresistorPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Реостат",
        tags: "реостат резистор переменный rheostat resistor variable htjcnfn htpbcnjh gthtvtyysq крущыефе куышыещк",
        type: RheostatPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Кнопка",
        tags: "кнопка button ryjgrf игввещт",
        type: ButtonPlate,
        options: [{title: "Обычная"}]
    },
    {
        title: "Ключ",
        tags: "ключ switch rk.x ыцшеср",
        type: SwitchPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Индуктор",
        tags: "индуктор индуктивность катушка inductor inductance coil bylernjh bylernbdyjcnm rfneirf штвгсещк сщшд",
        type: InductorPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Реле",
        tags: "реле relay htkt кудфн",
        type: RelayPlate,
        options: [{title: "Обычное"}]
    },
    {
        title: "RGB",
        tags: "ргб диод rgb diode hu, lbjl кпи вшщву",
        type: RGBPlate,
        options: [{title: "Обычная"}]
    },
    {
        title: "Зуммер",
        tags: "зуммер пищалка buzzer beeper pevvth gbofkrf игяяук иуузук",
        type: BuzzerPlate,
        options: [{title: "Обычный"}]
    },
    {
        title: "Dummy",
        tags: "dummy вгььн",
        type: DummyPlate,
        options: [{title: "Обычная"}]
    },
]

export default ITEMS;
