import {BasicPrincipal} from '@pallad/access-control';

export type Principal = 'logged-in' | BasicPrincipal.Anonymous;

export type Action = 'read' | 'read-draft' | 'create' | 'update' | 'delete' | 'publish';

export type Subject = 'article';
