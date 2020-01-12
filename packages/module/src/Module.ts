import {References} from "./References";
import {Container, Definition, onActivation} from "alpha-dic";
import {AccessControl} from "alpha-ac";
import {PREDICATE} from "./ruleAnnotation";
import {Module as _Module, StandardActions} from '@pallad/modules';

export class Module extends _Module<{ container: Container }> {
    constructor() {
        super('alpha-ac');
    }

    protected init(): void {
        this.registerAction(StandardActions.INITIALIZATION, context => {
            context.container.registerDefinition(
                Module.getAccessControlDefinition()
            );
        })
    }

    static getAccessControlDefinition() {
        return Definition.create(References.ACCESS_CONTROL)
            .useConstructor(AccessControl)
            .annotate(onActivation(async function (this: Container, service: AccessControl) {
                for (const rule of await this.getByAnnotation(PREDICATE)) {
                    service.registerRule(rule);
                }
                return service;
            }));
    }
}