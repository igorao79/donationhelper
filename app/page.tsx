import type { Metadata } from "next";
import { DonateCard } from "@/components/DonateCard";
import { getAuthor, getMethods } from "@/lib/config";

// Способ и режим стрима берутся из адреса и нужны сразу, данных для ожидания нет
export const instant = false;

const DEFAULT_ROTATE_SECONDS = 12;

function parseStream(stream: string | string[] | undefined) {
  if (typeof stream !== "string") return null;
  const seconds = Number(stream);
  return stream !== "" && seconds >= 3 ? seconds : DEFAULT_ROTATE_SECONDS;
}

export function generateMetadata(): Metadata {
  const { heading, name } = getAuthor();
  return {
    title: name ? `${heading}: ${name}` : heading,
    description: "Выбери удобный способ перевода и отсканируй QR-код.",
  };
}

export default async function Page({ searchParams }: PageProps<"/">) {
  const { m, stream } = await searchParams;

  return (
    <DonateCard
      author={getAuthor()}
      methods={getMethods()}
      initialId={typeof m === "string" ? m : undefined}
      streamSeconds={parseStream(stream)}
    />
  );
}
