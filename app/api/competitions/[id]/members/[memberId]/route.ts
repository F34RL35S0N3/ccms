import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, memberId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    await db.teamMember.delete({
      where: {
        id: resolvedParams.memberId,
        competitionId: resolvedParams.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
