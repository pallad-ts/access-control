import {AccessQuery} from "./AccessQuery";

export interface Policy<T extends AccessQuery = AccessQuery> {
    (request: T): boolean | undefined | Promise<boolean | undefined>;
}
