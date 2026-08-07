import { redirect } from "next/navigation";

/** Alias — Diego's public menu lives at /menu/[id]. */
export default async function LegacyPublicMenuRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/menu/${id}`);
}
