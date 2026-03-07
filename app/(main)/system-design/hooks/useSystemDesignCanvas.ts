import { useReducer } from "react";
import { Node, Connection, Group } from "../types";

export type SystemDesignState = {
    nodes: Node[];
    connections: Connection[];
    groups: Group[];
    activeTool: "Select" | "Connect" | "Pan" | "Group";
    connectStart: string | null;
    showGrid: boolean;
    theme: "dark" | "light" | "neo";
    isReviewing: boolean;
    reviewResult: string | null;
    reviewScore: { overall: number; reliability: number; scalability: number; security: number; seniority: string } | null;
    activeChallengeId: string | null;
    showHelp: boolean;
    showTutorial: boolean;
};

type Action =
    | { type: "SET_NODES"; nodes: Node[] }
    | { type: "SET_CONNECTIONS"; connections: Connection[] }
    | { type: "SET_GROUPS"; groups: Group[] }
    | { type: "SET_TOOL"; tool: SystemDesignState["activeTool"] }
    | { type: "SET_CONNECT_START"; startId: string | null }
    | { type: "TOGGLE_GRID" }
    | { type: "SET_THEME"; theme: SystemDesignState["theme"] }
    | { type: "SET_REVIEWING"; isReviewing: boolean }
    | { type: "SET_REVIEW_RESULT"; result: string | null; score?: SystemDesignState["reviewScore"] }
    | { type: "SET_CHALLENGE"; id: string | null }
    | { type: "SET_SHOW_HELP"; show: boolean }
    | { type: "SET_SHOW_TUTORIAL"; show: boolean }
    | { type: "ADD_NODE"; node: Node }
    | { type: "MOVE_NODE"; id: string; x: number; y: number; groupId: string | null }
    | { type: "DELETE_NODE"; id: string }
    | { type: "ADD_CONNECTION"; connection: Connection }
    | { type: "DELETE_CONNECTION"; id: string }
    | { type: "ADD_GROUP"; group: Group }
    | { type: "DELETE_GROUP"; id: string }
    | { type: "UPDATE_GROUP_POS"; id: string; x: number; y: number }
    | { type: "UPDATE_GROUP_SIZE"; id: string; w: number; h: number }
    | { type: "CLEAR_CANVAS" }
    | { type: "LOAD_STATE"; state: Partial<SystemDesignState> };

const initialState: SystemDesignState = {
    nodes: [],
    connections: [],
    groups: [],
    activeTool: "Select",
    connectStart: null,
    showGrid: true,
    theme: "dark",
    isReviewing: false,
    reviewResult: null,
    reviewScore: null,
    activeChallengeId: null,
    showHelp: false,
    showTutorial: false,
};

export function reducer(state: SystemDesignState, action: Action): SystemDesignState {
    switch (action.type) {
        case "SET_NODES": return { ...state, nodes: action.nodes };
        case "SET_CONNECTIONS": return { ...state, connections: action.connections };
        case "SET_GROUPS": return { ...state, groups: action.groups };
        case "SET_TOOL": return { ...state, activeTool: action.tool };
        case "SET_CONNECT_START": return { ...state, connectStart: action.startId };
        case "TOGGLE_GRID": return { ...state, showGrid: !state.showGrid };
        case "SET_THEME": return { ...state, theme: action.theme };
        case "SET_REVIEWING": return { ...state, isReviewing: action.isReviewing };
        case "SET_REVIEW_RESULT": return { ...state, reviewResult: action.result, reviewScore: action.score || null };
        case "SET_CHALLENGE": return { ...state, activeChallengeId: action.id };
        case "SET_SHOW_HELP": return { ...state, showHelp: action.show };
        case "SET_SHOW_TUTORIAL": return { ...state, showTutorial: action.show };
        case "ADD_NODE": return { ...state, nodes: [...state.nodes, action.node] };
        case "MOVE_NODE":
            return {
                ...state,
                nodes: state.nodes.map(n => n.id === action.id ? { ...n, x: action.x, y: action.y, groupId: action.groupId } : n)
            };
        case "DELETE_NODE":
            return {
                ...state,
                nodes: state.nodes.filter(n => n.id !== action.id),
                connections: state.connections.filter(c => c.from !== action.id && c.to !== action.id)
            };
        case "ADD_CONNECTION": return { ...state, connections: [...state.connections, action.connection] };
        case "DELETE_CONNECTION": return { ...state, connections: state.connections.filter(c => c.id !== action.id) };
        case "ADD_GROUP": return { ...state, groups: [...state.groups, action.group] };
        case "DELETE_GROUP": return { ...state, groups: state.groups.filter(g => g.id !== action.id) };
        case "UPDATE_GROUP_POS":
            {
                const g = state.groups.find(x => x.id === action.id);
                if (!g) return state;
                const dx = action.x - g.x;
                const dy = action.y - g.y;
                return {
                    ...state,
                    groups: state.groups.map(x => x.id === action.id ? { ...x, x: action.x, y: action.y } : x),
                    nodes: state.nodes.map(n => n.groupId === action.id ? { ...n, x: n.x + dx, y: n.y + dy } : n)
                };
            }
        case "UPDATE_GROUP_SIZE":
            return {
                ...state,
                groups: state.groups.map(x => x.id === action.id ? { ...x, w: action.w, h: action.h } : x)
            };
        case "CLEAR_CANVAS": return { ...state, nodes: [], connections: [], groups: [] };
        case "LOAD_STATE": return { ...initialState, ...state, ...action.state };
        default: return state;
    }
}

export function useSystemDesignCanvas() {
    const [state, dispatch] = useReducer(reducer, initialState);

    return {
        state,
        dispatch,
        nodes: state.nodes,
        connections: state.connections,
        groups: state.groups
    };
}
