import Model, {ModelState} from "../../core/base/model/Model";
import {ModelEvent} from "../../core/base/Event";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import {CodeChainset} from "./CodeModel";

type BlockTypeLimits = {[block_type: string]: number}

interface AdminBlocklyModelState extends ModelState {
    code_xml: string;
    chainset: CodeChainset;
    block_limit: number;
    block_type_limits: any;
}

export default class AdminCodeModel extends Model<AdminBlocklyModelState, DummyDatasource> {
    static alias = 'code_admin';

    private __legacy_onuserchange: Function;

    protected defaultState: AdminBlocklyModelState = {
        code_xml: undefined,
        chainset: undefined,
        block_limit: undefined,
        block_type_limits: undefined
    }

    public setCodeXml(xml: string) {
        this.emit(new CodeXmlUpdatedEvent({code_xml: xml}));
    }

    public setBlockTypeLimits(block_type_limits: BlockTypeLimits) {
        this.emit(new BlockTypeLimitsUpdatedEvent({block_type_limits}));
    }

    public setCode(xml: string, chainset: CodeChainset, block_limit: number, block_type_limits: BlockTypeLimits) {
        this.setState({code_xml: xml, block_limit, chainset, block_type_limits});
    }

    public setUserCode(xml: string, chainset: CodeChainset, block_limit: number, block_type_limits: BlockTypeLimits) {
        this.setState({code_xml: xml, block_limit, chainset, block_type_limits});

        this.__legacy_onuserchange && this.__legacy_onuserchange();
    }

    public onUserChange(cb: Function) {
        this.__legacy_onuserchange = cb;
    }
}

export class CodeXmlUpdatedEvent extends ModelEvent<CodeXmlUpdatedEvent> {
    code_xml: string;
}

export class BlockTypeLimitsUpdatedEvent extends ModelEvent<BlockTypeLimitsUpdatedEvent> {
    block_type_limits: BlockTypeLimits;
}