import { getCallbackResult } from "@/lib/moica/callbackStore";
import { RedirectResultView } from "@/components/RedirectResultView";

export default async function RedirectResultPage({
  searchParams,
}: {
  searchParams: Promise<{ tx?: string; nosid?: string }>;
}) {
  const { tx, nosid } = await searchParams;
  const entry = tx ? getCallbackResult(tx) : undefined;

  return <RedirectResultView tx={tx} nosid={nosid} entry={entry} />;
}
