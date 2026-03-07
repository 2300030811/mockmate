import { describe, it, expect } from 'vitest';
import { reducer, SystemDesignState } from './useSystemDesignCanvas';

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
};

describe('useSystemDesignCanvas Reducer', () => {
    it('should add a node', () => {
        const node = { id: 'n1', type: 'Load Balancer', x: 100, y: 100, name: 'LB' } as any;
        const state = reducer(initialState, { type: 'ADD_NODE', node });
        expect(state.nodes).toHaveLength(1);
        expect(state.nodes[0].id).toBe('n1');
    });

    it('should update node position', () => {
        const startState = { ...initialState, nodes: [{ id: 'n1', x: 0, y: 0, name: 'LB' }] } as any;
        const state = reducer(startState, { type: 'UPDATE_NODE_POS', id: 'n1', x: 50, y: 50 });
        expect(state.nodes[0].x).toBe(50);
        expect(state.nodes[0].y).toBe(50);
    });

    it('should move nodes with group', () => {
        const startState = {
            ...initialState,
            groups: [{ id: 'g1', x: 10, y: 10, w: 100, h: 100, name: 'VPC' }],
            nodes: [{ id: 'n1', x: 20, y: 20, groupId: 'g1', name: 'Server' }]
        } as any;

        const state = reducer(startState, { type: 'UPDATE_GROUP_POS', id: 'g1', x: 50, y: 50 });

        // Group moved from (10,10) to (50,50) -> dx=40, dy=40
        expect(state.groups[0].x).toBe(50);
        expect(state.groups[0].y).toBe(50);

        // Node should move by same delta
        expect(state.nodes[0].x).toBe(60); // 20 + 40
        expect(state.nodes[0].y).toBe(60); // 20 + 40
    });

    it('should assign node to group', () => {
        const startState = { ...initialState, nodes: [{ id: 'n1', x: 0, y: 0, name: 'LB' }] } as any;
        const state = reducer(startState, { type: 'ASSIGN_NODE_TO_GROUP', nodeId: 'n1', groupId: 'g1' });
        expect(state.nodes[0].groupId).toBe('g1');
    });

    it('should clear canvas', () => {
        const startState = {
            ...initialState,
            nodes: [{ id: 'n1' } as any],
            connections: [{ id: 'c1' } as any],
            groups: [{ id: 'g1' } as any]
        };
        const state = reducer(startState, { type: 'CLEAR_CANVAS' });
        expect(state.nodes).toHaveLength(0);
        expect(state.connections).toHaveLength(0);
        expect(state.groups).toHaveLength(0);
    });
});
