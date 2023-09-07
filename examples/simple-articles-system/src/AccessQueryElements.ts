import {Principal as _Principal} from '@pallad/access-control';

export type Principal = 'logged-in' | _Principal.Anonymous;

export type Action = 'read' | 'read-draft' | 'create' | 'update' | 'delete' | 'publish';

export type Subject = 'article';
