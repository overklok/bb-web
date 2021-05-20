import Presenter, {on, restore} from "../../core/base/Presenter";
import BlocklyView, {BlocklyCodeChangeEvent} from "../../views/common/BlocklyView";
import AdminCodeModel, {
    BlockTypeLimitsUpdatedEvent,
    CodeXmlUpdatedEvent,
} from "../../models/common/AdminCodeModel";

export default class AdminBlocklyPresenter extends Presenter<BlocklyView> {
    private model: AdminCodeModel;

    public getInitialProps() {
        this.model = this.getModel(AdminCodeModel);
    }

    @on(BlocklyCodeChangeEvent)
    private onUserCodeChange() {
        const chainset = this.view.getChainset(),
              xml = this.view.getCodeTree(),
              limit = this.view.getBlockLimit();

        const block_type_limits = this.view.getBlockLimitInputsByType();

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
        const chainset = this.view.getChainset(),
              xml = this.view.getCodeTree(),
              limit = this.view.getBlockLimit();

        const block_type_limits = this.view.getBlockLimitInputsByType();

        this.model.setCode(xml, chainset, limit, block_type_limits);
    }
}