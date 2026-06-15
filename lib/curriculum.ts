/**
 * Curriculum mock data for the learning library (frontend-only).
 *
 * Shape: topic → subtopic → lesson, each lesson carrying a learning status.
 * In production this comes from the backend; the UI only reads it. Kept here
 * behind a tiny accessor so swapping to a real source is a one-file change.
 */

export type LessonStatus = 'mastered' | 'in-progress' | 'not-started';

export interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
}

export interface Subtopic {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Topic {
  id: string;
  title: string;
  blurb: string;
  subtopics: Subtopic[];
}

export const CURRICULUM: Topic[] = [
  {
    id: 'algebra',
    title: 'Algebra',
    blurb: 'Equations, expressions and graphs.',
    subtopics: [
      {
        id: 'linear-equations',
        title: 'Linear equations',
        lessons: [
          { id: 'one-step', title: 'One-step equations', status: 'mastered' },
          { id: 'two-step', title: 'Two-step equations', status: 'mastered' },
          { id: 'solving-for-x', title: 'Solving for x', status: 'in-progress' },
          { id: 'both-sides', title: 'Variables on both sides', status: 'not-started' },
        ],
      },
      {
        id: 'expressions',
        title: 'Expressions',
        lessons: [
          { id: 'simplifying', title: 'Simplifying expressions', status: 'mastered' },
          { id: 'expanding', title: 'Expanding brackets', status: 'in-progress' },
          { id: 'factorising', title: 'Factorising', status: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'number',
    title: 'Number',
    blurb: 'Fractions, ratio and percentages.',
    subtopics: [
      {
        id: 'fractions',
        title: 'Fractions',
        lessons: [
          { id: 'equivalent', title: 'Equivalent fractions', status: 'mastered' },
          { id: 'add-subtract', title: 'Adding & subtracting', status: 'in-progress' },
          { id: 'multiply-divide', title: 'Multiplying & dividing', status: 'not-started' },
        ],
      },
      {
        id: 'ratio',
        title: 'Ratio & proportion',
        lessons: [
          { id: 'simplify-ratio', title: 'Simplifying ratios', status: 'not-started' },
          { id: 'sharing', title: 'Sharing in a ratio', status: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'geometry',
    title: 'Geometry',
    blurb: 'Shapes, angles and measures.',
    subtopics: [
      {
        id: 'angles',
        title: 'Angles',
        lessons: [
          { id: 'angle-rules', title: 'Angle rules', status: 'not-started' },
          { id: 'polygons', title: 'Angles in polygons', status: 'not-started' },
        ],
      },
      {
        id: 'area',
        title: 'Area & perimeter',
        lessons: [
          { id: 'rectangles', title: 'Rectangles & triangles', status: 'not-started' },
          { id: 'circles', title: 'Circles', status: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 'statistics',
    title: 'Statistics',
    blurb: 'Data, averages and charts.',
    subtopics: [
      {
        id: 'averages',
        title: 'Averages',
        lessons: [
          { id: 'mean-median-mode', title: 'Mean, median & mode', status: 'not-started' },
          { id: 'range', title: 'Range', status: 'not-started' },
        ],
      },
    ],
  },
];

/** All lessons in a topic, flattened. */
export function topicLessons(t: Topic): Lesson[] {
  return t.subtopics.flatMap((s) => s.lessons);
}

/** Percentage of a topic's lessons that are mastered. */
export function topicProgress(t: Topic): number {
  const all = topicLessons(t);
  if (all.length === 0) return 0;
  const done = all.filter((l) => l.status === 'mastered').length;
  return Math.round((done / all.length) * 100);
}

export function getTopic(id: string): Topic | undefined {
  return CURRICULUM.find((t) => t.id === id);
}
