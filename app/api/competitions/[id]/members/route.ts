import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const resolvedParams = await params;

    const {
      userId,
      role
    } = body;

    if (!userId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const member = await db.teamMember.create({
      data: {
        competitionId: resolvedParams.id,
        userId,
        role: role || "MEMBER"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            skills: true,
          }
        }
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[MEMBER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
