import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, stageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const resolvedParams = await params;

    const {
      name,
      order,
      status,
      startDate,
      endDate,
      description
    } = body;

    const stage = await db.competitionStage.update({
      where: {
        id: resolvedParams.stageId,
        competitionId: resolvedParams.id
      },
      data: {
        name,
        order,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description
      }
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("[STAGE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, stageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    await db.competitionStage.delete({
      where: {
        id: resolvedParams.stageId,
        competitionId: resolvedParams.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
