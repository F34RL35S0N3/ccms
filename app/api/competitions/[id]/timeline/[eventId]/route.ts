import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, eventId: string }> }
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

    const event = await db.competitionTimeline.update({
      where: {
        id: resolvedParams.eventId,
        competitionId: resolvedParams.id
      },
      data: {
        title,
        date: date ? new Date(date) : undefined,
        type,
        description
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[TIMELINE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, eventId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    await db.competitionTimeline.delete({
      where: {
        id: resolvedParams.eventId,
        competitionId: resolvedParams.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TIMELINE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
