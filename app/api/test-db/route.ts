import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany();

    return Response.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("PRISMA ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Error al conectar con la base de datos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}