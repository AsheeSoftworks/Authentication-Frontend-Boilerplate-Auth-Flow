import VerifyEmail from "@/components/VerifyEmail";


export default async function page({
  params,
}: {
  params: { token: string };
}) {
  const { token } = await params;
  
  return <VerifyEmail token={token} />;
}