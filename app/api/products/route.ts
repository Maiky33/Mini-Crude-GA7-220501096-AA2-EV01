import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return Response.json(products);
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Error al consultar los productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: Number(body.price),
        category: body.category,
      },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Error al crear el producto" },
      { status: 500 }
    );
  }
}