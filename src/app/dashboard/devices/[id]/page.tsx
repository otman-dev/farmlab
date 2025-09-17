import DeviceDetail from '@/components/dashboard/DeviceDetail';
import { notFound } from 'next/navigation';

// In Next.js 14, this is the recommended way to handle dynamic route parameters

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Ensure the id exists, otherwise return a 404
  if (!id) {
    notFound();
  }
  // Access the id safely after validation
  return (
    <div>
      <DeviceDetail deviceId={id} />
    </div>
  );
}