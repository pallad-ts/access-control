import {Annotation, Service, ServiceName} from "alpha-dic";
import {ruleAnnotation} from "./ruleAnnotation";

export function AccessControlRuleService(name?: ServiceName) {
    return function (clazz: { new(...args: any[]): any }) {
        Service(name)(clazz);
        Annotation(ruleAnnotation())(clazz);
    }
}