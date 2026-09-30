import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        name: body.name,
        price: Number(body.price),
        category: body.category,
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    return Response.json({
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}