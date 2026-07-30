import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { reducer, SystemDesignState } from './useSystemDesignCanvas';
import { useSystemDesignPersistence } from './useSystemDesignPersistence';

const initialState: SystemDesignState = {
    nodes: [],
    connections: [],
    groups: [],
    activeTool: 'Select',
    connectStart: null,
    showGrid: true,
    theme: 'dark',
    isReviewing: false,
    reviewResult: null,
    reviewScore: null,
    activeChallengeId: null,
    showHelp: false,
    showTutorial: false,
    focusConnectionId: null,
};

describe('useSystemDesignCanvas Reducer', () => {
    it('should add a node', () => {
        const node = { id: 'n1', type: 'Load Balancer', x: 100, y: 100, name: 'LB' } as any;
        const state = reducer(initialState, { type: 'ADD_NODE', node });
        expect(state.nodes).toHaveLength(1);
        expect(state.nodes[0].id).toBe('n1');
    });

    it('should update a node', () => {
        const startState = { ...initialState, nodes: [{ id: 'n1', name: 'LB', x: 0, y: 0 }] } as any;
        const state = reducer(startState, { type: 'UPDATE_NODE', id: 'n1', updates: { name: 'NGINX' } });
        expect(state.nodes[0].name).toBe('NGINX');
    });

    it('should update a connection', () => {
        const startState = { ...initialState, connections: [{ id: 'c1', label: 'HTTP' }] } as any;
        const state = reducer(startState, { type: 'UPDATE_CONNECTION', id: 'c1', updates: { label: 'gRPC' } });
        expect(state.connections[0].label).toBe('gRPC');
    });

    it('should insert a template', () => {
        const nodes = [{ id: 'n1' }] as any;
        const connections = [{ id: 'c1' }] as any;
        const state = reducer(initialState, { type: 'INSERT_TEMPLATE', nodes, connections });
        expect(state.nodes).toHaveLength(1);
        expect(state.connections).toHaveLength(1);
    });

    it('should move nodes with group', () => {
        const startState = {
            ...initialState,
            groups: [{ id: 'g1', x: 10, y: 10, w: 100, h: 100, name: 'VPC' }],
            nodes: [{ id: 'n1', x: 20, y: 20, groupId: 'g1', name: 'Server' }]
        } as any;

        const state = reducer(startState, { type: 'UPDATE_GROUP_POS', id: 'g1', x: 50, y: 50 });

        expect(state.groups[0].x).toBe(50);
        expect(state.groups[0].y).toBe(50);
        expect(state.nodes[0].x).toBe(60);
        expect(state.nodes[0].y).toBe(60);
    });

    it('should lock children in place if lockChildren is true (shift-drag)', () => {
        const startState = {
            ...initialState,
            groups: [{ id: 'g1', x: 10, y: 10, w: 100, h: 100, name: 'VPC' }],
            nodes: [{ id: 'n1', x: 20, y: 20, groupId: 'g1', name: 'Server' }]
        } as any;

        const state = reducer(startState, { type: 'UPDATE_GROUP_POS', id: 'g1', x: 50, y: 50, lockChildren: true });

        expect(state.groups[0].x).toBe(50);
        expect(state.groups[0].y).toBe(50);
        // Node should NOT move
        expect(state.nodes[0].x).toBe(20);
        expect(state.nodes[0].y).toBe(20);
    });
});

describe('useSystemDesignPersistence Migration', () => {
    let getItemSpy: any;
    let setItemSpy: any;
    let removeItemSpy: any;

    beforeEach(() => {
        getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should migrate from legacy payload without version to version 3', () => {
        // Mock legacy data format (no version) in 'mockmate-design-pro' or 'mockmate-design-pro-v3'
        getItemSpy.mockImplementation((key: string) => {
            if (key === 'mockmate-design-pro') return null; // No new format
            if (key === 'mockmate-design-pro-v3') {
                return JSON.stringify({
                    nodes: [{ id: 'old-node' }]
                });
            }
            return null;
        });

        const dispatch = vi.fn();
        const setInitialHistory = vi.fn();

        renderHook(() => useSystemDesignPersistence({
            nodes: [], connections: [], groups: [], theme: 'dark', dispatch, setInitialHistory
        }));

        // Expect dispatch LOAD_STATE with parsed nodes
        expect(dispatch).toHaveBeenCalledWith({
            type: 'LOAD_STATE',
            state: expect.objectContaining({
                nodes: [{ id: 'old-node' }]
            })
        });

        // Expect migration save to standard key with version 3
        expect(setItemSpy).toHaveBeenCalledWith('mockmate-design-pro', expect.stringContaining('"version":3'));
        expect(setItemSpy).toHaveBeenCalledWith('mockmate-design-pro', expect.stringContaining('"nodes":[{"id":"old-node"}]'));
        
        // Expect cleanup of old legacy key
        expect(removeItemSpy).toHaveBeenCalledWith('mockmate-design-pro-v3');
    });
});
