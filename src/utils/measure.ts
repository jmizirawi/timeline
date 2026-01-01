
let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;

export function measureTextWidth(text: string, font: string): number {
    // Check for environment (SSR safety, though this app is CSR)
    if (typeof document === 'undefined') return text.length * 10;

    if (!canvas) {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
    }

    if (context) {
        context.font = font;
        return context.measureText(text).width;
    }

    return text.length * 10; // Fallback
}
