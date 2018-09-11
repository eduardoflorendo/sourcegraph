import * as assert from 'assert'
import { BehaviorSubject, Subject } from 'rxjs'
import { DocumentSelector } from 'sourcegraph'
import {
    ClientCapabilities,
    DidCloseTextDocumentNotification,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentNotification,
    DidOpenTextDocumentParams,
    TextDocumentRegistrationOptions,
} from '../../protocol'
import { Client } from '../client'
import { createObservableEnvironment, EMPTY_ENVIRONMENT, Environment } from '../environment'
import { TextDocumentItem } from '../types/textDocument'
import {
    TextDocumentDidCloseFeature,
    TextDocumentDidOpenFeature,
    TextDocumentNotificationFeature as AbstractTextDocumentNotificationFeature,
} from './textDocument'

describe('TextDocumentNotificationFeature', () => {
    const create = <F extends AbstractTextDocumentNotificationFeature<any, any>>(
        FeatureClass: new (client: Client) => F
    ): {
        client: Client
        feature: F
    } => {
        const client = {} as Client
        const feature = new FeatureClass(client)
        return { client, feature }
    }

    class TextDocumentNotificationFeature extends AbstractTextDocumentNotificationFeature<any, any> {
        constructor(client: Client) {
            super(client, new Subject<any>(), DidOpenTextDocumentNotification.type, () => void 0)
        }
        public readonly messages = 'm'
        public fillClientCapabilities(): void {
            /* noop */
        }
        public initialize(): void {
            /* noop */
        }
    }

    const FIXTURE_REGISTER_OPTIONS: TextDocumentRegistrationOptions = { documentSelector: ['*'] }

    describe('registration', () => {
        it('supports dynamic registration and unregistration', () => {
            const { feature } = create(TextDocumentNotificationFeature)
            feature.register(feature.messages, { id: 'a', registerOptions: FIXTURE_REGISTER_OPTIONS })
            feature.unregister('a')
        })

        it('supports multiple dynamic registrations and unregistrations', () => {
            const { feature } = create(TextDocumentNotificationFeature)
            feature.register(feature.messages, { id: 'a', registerOptions: FIXTURE_REGISTER_OPTIONS })
            feature.register(feature.messages, { id: 'b', registerOptions: FIXTURE_REGISTER_OPTIONS })
            feature.unregister('b')
            feature.unregister('a')
        })

        it('prevents registration with conflicting IDs', () => {
            const { feature } = create(TextDocumentNotificationFeature)
            feature.register(feature.messages, { id: 'a', registerOptions: FIXTURE_REGISTER_OPTIONS })
            assert.throws(() => {
                feature.register(feature.messages, { id: 'a', registerOptions: FIXTURE_REGISTER_OPTIONS })
            })
        })

        it('throws an error if ID to unregister is not registered', () => {
            const { feature } = create(TextDocumentNotificationFeature)
            assert.throws(() => feature.unregister('a'))
        })
    })
})

describe('TextDocumentDidOpenFeature', () => {
    const create = (): {
        client: Client
        environment: BehaviorSubject<Environment>
        feature: TextDocumentDidOpenFeature & { readonly selectors: Map<string, DocumentSelector> }
    } => {
        const environment = new BehaviorSubject<Environment>(EMPTY_ENVIRONMENT)
        const client = { options: {} } as Client
        const feature = new class extends TextDocumentDidOpenFeature {
            public readonly selectors!: Map<string, DocumentSelector>
        }(client, createObservableEnvironment(environment).textDocument)
        return { client, environment, feature }
    }

    it('reports client capabilities', () => {
        const capabilities: ClientCapabilities = {}
        create().feature.fillClientCapabilities(capabilities)
        assert.deepStrictEqual(capabilities, {
            textDocument: { synchronization: { dynamicRegistration: true } },
        } as ClientCapabilities)
    })

    describe('when a text document is opened', () => {
        it('sends a textDocument/didOpen notification to the server', done => {
            const { client, environment, feature } = create()
            feature.register(feature.messages, {
                id: 'a',
                registerOptions: { documentSelector: ['l'] },
            })

            const textDocument: TextDocumentItem = {
                uri: 'file:///f',
                languageId: 'l',
                text: '',
            }

            function mockSendNotification(method: string, params: any): void {
                assert.strictEqual(method, DidOpenTextDocumentNotification.type)
                assert.deepStrictEqual(params, { textDocument } as DidOpenTextDocumentParams)
                done()
            }
            client.sendNotification = mockSendNotification

            environment.next({
                ...environment.value,
                component: { document: textDocument },
            })
        })
    })
})

describe('TextDocumentDidCloseFeature', () => {
    const create = (): {
        client: Client
        environment: BehaviorSubject<Environment>
        feature: TextDocumentDidCloseFeature & { readonly selectors: Map<string, DocumentSelector> }
    } => {
        const environment = new BehaviorSubject<Environment>(EMPTY_ENVIRONMENT)
        const client = { options: {} } as Client
        const feature = new class extends TextDocumentDidCloseFeature {
            public readonly selectors!: Map<string, DocumentSelector>
        }(client, createObservableEnvironment(environment).textDocument)
        return { client, environment, feature }
    }

    it('reports client capabilities', () => {
        const capabilities: ClientCapabilities = {}
        create().feature.fillClientCapabilities(capabilities)
        assert.deepStrictEqual(capabilities, {
            textDocument: { synchronization: { dynamicRegistration: true } },
        } as ClientCapabilities)
    })

    describe('when a text document is opened and then closed', () => {
        it('sends a textDocument/didClose notification to the server', done => {
            const { client, environment, feature } = create()
            feature.register(feature.messages, {
                id: 'a',
                registerOptions: { documentSelector: ['l'] },
            })

            const textDocument: TextDocumentItem = {
                uri: 'file:///f',
                languageId: 'l',
                text: '',
            }

            let didCloseNotifications: DidCloseTextDocumentParams[] = []
            function mockSendNotification(method: string, params: any): void {
                assert.strictEqual(method, DidCloseTextDocumentNotification.type)
                didCloseNotifications.push(params)
            }
            client.sendNotification = mockSendNotification

            // Open the document.
            environment.next({
                ...environment.value,
                component: { document: textDocument },
            })
            assert.deepStrictEqual(didCloseNotifications, [])
            didCloseNotifications = []

            // Close the document by setting component to null.
            environment.next({
                ...environment.value,
                component: null,
            })
            assert.deepStrictEqual(didCloseNotifications, [
                {
                    textDocument: { uri: textDocument.uri },
                },
            ] as DidCloseTextDocumentParams[])
            didCloseNotifications = []

            // Reopen the document.
            environment.next({
                ...environment.value,
                component: { document: textDocument },
            })
            assert.deepStrictEqual(didCloseNotifications, [])
            didCloseNotifications = []

            // Close the document by setting component to a different document.
            environment.next({
                ...environment.value,
                component: { document: { ...textDocument, uri: 'file:///f2' } },
            })
            assert.deepStrictEqual(didCloseNotifications, [
                {
                    textDocument: { uri: textDocument.uri },
                },
            ] as DidCloseTextDocumentParams[])
            didCloseNotifications = []

            done()
        })
    })
})