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
      type,
      url,
      size
    } = body;

    if (!name || !type || !url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const document = await db.document.create({
      data: {
        competitionId: resolvedParams.id,
        uploadedBy: session.user.id,
        name,
        type,
        url,
        size
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
