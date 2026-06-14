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
      title,
      date,
      type,
      description
    } = body;

    if (!title || !date || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const event = await db.competitionTimeline.create({
      data: {
        competitionId: resolvedParams.id,
        title,
        date: new Date(date),
        type,
        description
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[TIMELINE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
