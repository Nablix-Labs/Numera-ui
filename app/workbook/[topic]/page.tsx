import { CURRICULUM } from '@/lib/curriculum';
import TopicClient from './TopicClient';

// Pre-render one page per topic (required for static export / GitHub Pages).
export function generateStaticParams() {
  return CURRICULUM.map((t) => ({ topic: t.id }));
}
export const dynamicParams = false;

export default function TopicPage({ params }: { params: { topic: string } }) {
  return <TopicClient topicId={params.topic} />;
}
