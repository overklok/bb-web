import Presenter, {on, restore} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/common/BlocklyView";
import AdminCodeModel, {
    BlockTypeLimitsUpdatedEvent,
    CodeXmlUpdatedEvent,
} from "../../models/common/AdminCodeModel";
import Blockly from "blockly";

export default class AdminBlocklyPresenter extends Presenter<BlocklyView> {
    private model: AdminCodeModel;
    private workspace: Blockly.Workspace;

    public getInitialProps() {
        this.model = this.getModel(AdminCodeModel);
    }

    @on(BlocklyCodeChangeEvent)
    private onUserCodeChange(evt: BlocklyCodeChangeEvent) {
        this.workspace = evt.workspace;

        const chainset = BlocklyView.getChainset(evt.workspace),
              xml = BlocklyView.getCodeTree(evt.workspace),
              limit = BlocklyView.getBlockLimit(evt.workspace);

        const block_type_limits = BlocklyView.getBlockLimitInputsByType(evt.workspace);

        this.model.setUserCode(xml, chainset, limit, block_type_limits);
    }

    @restore() @on(CodeXmlUpdatedEvent)
    private onCodeChange(evt: CodeXmlUpdatedEvent) {
        this.view.setCodeTree(evt.code_xml);

        this.setModelData();
    }

    @restore() @on(BlockTypeLimitsUpdatedEvent)
    private onBlockTypeLimitsChange(evt: BlockTypeLimitsUpdatedEvent) {
        this.view.setBlockLimitInputsByType(evt.block_type_limits);

        this.setModelData();
    }

    private setModelData() {
        if (!this.workspace) return;

        const chainset = BlocklyView.getChainset(this.workspace),
              xml = BlocklyView.getCodeTree(this.workspace),
              limit = BlocklyView.getBlockLimit(this.workspace);

        const block_type_limits = BlocklyView.getBlockLimitInputsByType(this.workspace);

        this.model.setCode(xml, chainset, limit, block_type_limits);
    }
}