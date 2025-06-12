import ResetPassword from "@/components/ResetPassword";

export default async function page({
  params,
}: {
  params: { token: string };
}) {
  const { token } = await params;
  
  return <ResetPassword token={token} />;
}