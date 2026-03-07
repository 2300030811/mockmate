export const isInputActive = () => {
    if (typeof window === 'undefined') return false;
    const el = document.activeElement;
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
};

export const getSnappedPos = (x: number, y: number, gridSize: number) => {
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
};
