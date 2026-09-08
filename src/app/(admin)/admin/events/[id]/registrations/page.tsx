import { redirect } from "next/navigation";

interface EventRegistrationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventRegistrationsPage({
  params,
}: EventRegistrationsPageProps) {
  const { id } = await params;
  redirect(`/admin/events/registrations?eventId=${id}`);
}
