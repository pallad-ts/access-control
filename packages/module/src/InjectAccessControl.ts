import {Inject, reference} from "alpha-dic";
import {References} from "./References";

export function InjectAccessControl() {
    return Inject(reference(References.ACCESS_CONTROL));
}