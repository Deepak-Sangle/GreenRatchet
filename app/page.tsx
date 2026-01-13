import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  redirect("/auth/signin");
}
