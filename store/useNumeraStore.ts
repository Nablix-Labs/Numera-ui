/**
 * Numera — Global Zustand store
 *
 * The frontend is a DISPLAY + INTERACTION layer only.
 * All tutoring logic and session decisions live in the backend.
 * This store holds only UI-relevant state derived from backend events.
 */
import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionState =
  | 'idle'
  | 'state_1'   // Warm-up
  | 'state_2'   // Explanation
  | 'state_3'   // Step-by-step
  | 'state_4'   // Student work
  | 'state_5';  // Review

export type DrawingTool = 'pen' | 'eraser' | 'shape' | 'ruler';

export type InputMode = 'voice' | 'text' | 'canvas';

/**
 * A single committed item on the drawing canvas.
 *  - stroke: freehand pen / eraser path (eraser uses destination-out)
 *  - line:   straight line drawn with the ruler tool
 *  - rect:   rectangle drawn with the shape tool
 * `size` is the stroke width in px.
 */
export type DrawnItem =
  | { id: string; kind: 'stroke'; tool: 'pen' | 'eraser'; points: number[]; color: string; size: number }
  | { id: string; kind: 'line'; points: number[]; color: string; size: number }
  | { id: string; kind: 'rect'; x: number; y: number; w: number; h: number; color: string; size: number };

/**
 * Tutor-drawn element, rendered on a separate (non-erasable) canvas layer.
 * Geometry is NORMALISED 0–1 relative to canvas width/height, so the backend
 * never needs to know the pixel size — the renderer multiplies by the live
 * stage dimensions. Matches the `canvas_draw` message contract.
 */
export type TutorElementKind =
  | 'text' | 'math' | 'line' | 'arrow' | 'rect' | 'ellipse' | 'freehand' | 'highlight';

export interface TutorElement {
  id: string;
  kind: TutorElementKind;
  x?: number; y?: number; w?: number; h?: number;     // normalised 0–1
  from?: [number, number]; to?: [number, number];     // normalised endpoints
  points?: number[];                                  // normalised x,y pairs
  text?: string; tex?: string;                        // text / KaTeX content
  color?: string; strokeWidth?: number; size?: number;
}

/** Payload the backend/LLM sends to draw on the canvas. */
export interface CanvasDrawPayload {
  author?: 'tutor';
  actionId?: string;
  mode?: 'append' | 'replace';
  elements: Array<Omit<TutorElement, 'id'> & { id?: string }>;
}

export interface TranscriptMessage {
  id: string;
  role: 'ai' | 'student';
  text: string;
  partial?: boolean; // true while still transcribing
  timestamp: number;
}

export interface NumeraState {
  // Session
  sessionId: string | null;
  sessionState: SessionState;
  activeSlide: number;
  totalSlides: number;

  // Question displayed on canvas (backend-controlled)
  questionText: string;
  questionNumber: number;

  // Voice
  micMuted: boolean;
  voiceStatus: 'idle' | 'listening' | 'speaking' | 'processing';

  // Transcript
  transcript: TranscriptMessage[];

  // Canvas / drawing
  activeTool: DrawingTool;
  strokeColor: string;
  strokeWidth: number;
  items: DrawnItem[];          // committed student items
  undone: DrawnItem[];         // student redo stack
  tutorElements: TutorElement[]; // AI-tutor marks (separate, non-erasable layer)

  // Input mode (voice | text | canvas)
  inputMode: InputMode;
  textInput: string;

  // UI preferences (guided-learning layout)
  panelSide: 'left' | 'right';        // assistant panel side relative to canvas
  transcriptVisible: boolean;         // transcript can be hidden
  toolbarPos: { x: number; y: number } | null; // null = default docked position
  toolbarCollapsed: boolean;          // collapsed to a small bubble

  // Runtime: canvas PNG exporter, registered by the canvas for PDF notes
  canvasExporter: (() => string | null) | null;

  // Actions
  setSessionId: (id: string) => void;
  setSessionState: (s: SessionState) => void;
  setActiveSlide: (n: number) => void;
  setTotalSlides: (n: number) => void;
  setQuestionText: (q: string) => void;
  setQuestionNumber: (n: number) => void;
  toggleMic: () => void;
  setVoiceStatus: (s: NumeraState['voiceStatus']) => void;
  addTranscriptMessage: (msg: Omit<TranscriptMessage, 'id' | 'timestamp'>) => void;
  updatePartialTranscript: (text: string) => void;
  setActiveTool: (t: DrawingTool) => void;
  setStrokeColor: (c: string) => void;
  setStrokeWidth: (w: number) => void;
  addItem: (item: DrawnItem) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  applyCanvasDraw: (payload: CanvasDrawPayload) => void;
  clearTutorMarks: () => void;
  setInputMode: (m: InputMode) => void;
  setTextInput: (v: string) => void;
  setPanelSide: (s: 'left' | 'right') => void;
  togglePanelSide: () => void;
  toggleTranscript: () => void;
  setToolbarPos: (pos: { x: number; y: number } | null) => void;
  toggleToolbarCollapsed: () => void;
  setCanvasExporter: (fn: (() => string | null) | null) => void;
  reset: () => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initial: Omit<
  NumeraState,
  | 'setSessionId' | 'setSessionState' | 'setActiveSlide' | 'setTotalSlides'
  | 'setQuestionText' | 'setQuestionNumber' | 'toggleMic' | 'setVoiceStatus'
  | 'addTranscriptMessage' | 'updatePartialTranscript' | 'setActiveTool'
  | 'setStrokeColor' | 'setStrokeWidth' | 'addItem' | 'undo' | 'redo'
  | 'clearCanvas' | 'applyCanvasDraw' | 'clearTutorMarks'
  | 'setInputMode' | 'setTextInput' | 'setPanelSide' | 'togglePanelSide'
  | 'toggleTranscript' | 'setToolbarPos' | 'toggleToolbarCollapsed'
  | 'setCanvasExporter' | 'reset'
> = {
  sessionId: null,
  sessionState: 'idle',
  activeSlide: 2,
  totalSlides: 9,
  questionText: '2x + 5 = 13',
  questionNumber: 3,
  micMuted: false,
  voiceStatus: 'listening',
  transcript: [
    {
      id: '1',
      role: 'ai',
      text: 'What do we do first to get the x term on its own?',
      timestamp: Date.now() - 30_000,
    },
    {
      id: '2',
      role: 'student',
      text: 'Subtract 5 from both sides?',
      timestamp: Date.now() - 20_000,
    },
    {
      id: '3',
      role: 'ai',
      text: 'Exactly. So what does the left side become?',
      timestamp: Date.now() - 10_000,
    },
  ],
  activeTool: 'pen',
  strokeColor: '#1a1a1a',
  strokeWidth: 3,
  items: [],
  undone: [],
  tutorElements: [],
  inputMode: 'voice',
  textInput: '',
  panelSide: 'left',
  transcriptVisible: true,
  toolbarPos: null,
  toolbarCollapsed: false,
  canvasExporter: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNumeraStore = create<NumeraState>((set) => ({
  ...initial,

  setSessionId: (id) => set({ sessionId: id }),
  setSessionState: (sessionState) => set({ sessionState }),
  setActiveSlide: (activeSlide) => set({ activeSlide }),
  setTotalSlides: (totalSlides) => set({ totalSlides }),
  setQuestionText: (questionText) => set({ questionText }),
  setQuestionNumber: (questionNumber) => set({ questionNumber }),

  toggleMic: () =>
    set((s) => ({
      micMuted: !s.micMuted,
      voiceStatus: s.micMuted ? 'listening' : 'idle',
    })),

  setVoiceStatus: (voiceStatus) => set({ voiceStatus }),

  addTranscriptMessage: (msg) =>
    set((s) => ({
      transcript: [
        ...s.transcript,
        { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    })),

  updatePartialTranscript: (text) =>
    set((s) => {
      const last = s.transcript[s.transcript.length - 1];
      if (last?.partial) {
        return {
          transcript: [
            ...s.transcript.slice(0, -1),
            { ...last, text },
          ],
        };
      }
      return {
        transcript: [
          ...s.transcript,
          {
            id: crypto.randomUUID(),
            role: 'student',
            text,
            partial: true,
            timestamp: Date.now(),
          },
        ],
      };
    }),

  setActiveTool: (activeTool) => set({ activeTool }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  addItem: (item) =>
    set((s) => ({ items: [...s.items, item], undone: [] })),

  undo: () =>
    set((s) => {
      if (s.items.length === 0) return s;
      const last = s.items[s.items.length - 1];
      return { items: s.items.slice(0, -1), undone: [...s.undone, last] };
    }),

  redo: () =>
    set((s) => {
      if (s.undone.length === 0) return s;
      const last = s.undone[s.undone.length - 1];
      return { items: [...s.items, last], undone: s.undone.slice(0, -1) };
    }),

  clearCanvas: () => set({ items: [], undone: [] }),

  applyCanvasDraw: (payload) =>
    set((s) => {
      const incoming: TutorElement[] = payload.elements.map((el) => ({
        ...el,
        id: el.id ?? crypto.randomUUID(),
      }));
      return {
        tutorElements:
          payload.mode === 'replace' ? incoming : [...s.tutorElements, ...incoming],
      };
    }),

  clearTutorMarks: () => set({ tutorElements: [] }),

  setInputMode: (inputMode) => set({ inputMode }),
  setTextInput: (textInput) => set({ textInput }),

  setPanelSide: (panelSide) => set({ panelSide }),
  togglePanelSide: () => set((s) => ({ panelSide: s.panelSide === 'left' ? 'right' : 'left' })),
  toggleTranscript: () => set((s) => ({ transcriptVisible: !s.transcriptVisible })),
  setToolbarPos: (toolbarPos) => set({ toolbarPos }),
  toggleToolbarCollapsed: () => set((s) => ({ toolbarCollapsed: !s.toolbarCollapsed })),
  setCanvasExporter: (canvasExporter) => set({ canvasExporter }),

  reset: () => set({ ...initial }),
}));
