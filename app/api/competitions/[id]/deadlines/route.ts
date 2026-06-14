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
      type,
      date,
      description
    } = body;

    if (!title || !type || !date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const deadline = await db.deadline.create({
      data: {
        competitionId: resolvedParams.id,
        title,
        type,
        date: new Date(date),
        description
      }
    });

    return NextResponse.json(deadline);
  } catch (error) {
    console.error("[DEADLINE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
