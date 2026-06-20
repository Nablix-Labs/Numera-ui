import { CURRICULUM } from '@/lib/curriculum';
import OrientationClient from './OrientationClient';

// Static export — pre-render orientation for every topic.
export function generateStaticParams() {
  return CURRICULUM.map((t) => ({ topic: t.id }));
}

export default function Page({ params }: { params: { topic: string } }) {
  return <OrientationClient topicId={params.topic} />;
}
