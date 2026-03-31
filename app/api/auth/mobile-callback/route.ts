import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const GET = async (request: NextRequest) => {
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") ?? "aparatus://auth";

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.session?.token) {
    return Response.redirect(`${redirectTo}?error=auth_failed`);
  }

  return Response.redirect(`${redirectTo}?token=${session.session.token}`);
};
