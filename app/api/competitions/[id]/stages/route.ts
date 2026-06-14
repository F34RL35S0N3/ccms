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
      name,
      order,
      status,
      startDate,
      endDate,
      description
    } = body;

    if (!name || order === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const stage = await db.competitionStage.create({
      data: {
        competitionId: resolvedParams.id,
        name,
        order,
        status: status || "PENDING",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description
      }
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("[STAGE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
