/**
 * This module is used only for development purposes.
 * Some applications can optionally use this to visualize board circuit verification.
 */

import { ModelEvent } from "../../core/base/Event";
import DummyDatasource from "../../core/base/model/datasources/DummyDatasource";
import Model, { ModelState } from "../../core/base/model/Model";
import { ValidationVerdict } from "../ProgressModel";

interface AdminCheckModelState extends ModelState {}

export default class AdminCheckModel extends Model<AdminCheckModelState, DummyDatasource> {
    static alias = 'admin_check';

    protected defaultState: AdminCheckModelState = {};

    public showVerdict(verdict: ValidationVerdict) {
        this.emit(new AdminVerdictEvent({verdict}));
    }
}

export class AdminVerdictEvent extends ModelEvent<AdminVerdictEvent> {
    verdict: ValidationVerdict;
}