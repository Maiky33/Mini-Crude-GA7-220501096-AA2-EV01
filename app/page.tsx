"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

const inputClassName =
  "text-black placeholder-[#7A7A7A] w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500";

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  async function loadProducts() {
    setError("");
    const res = await fetch("/api/products");
    if (!res.ok) {
      setError("No se pudieron cargar los productos");
      return;
    }
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts().finally(() => setLoading(false));
  }, []);

  function closeEditModal() {
    setEditingProduct(null);
    setEditName("");
    setEditPrice("");
    setEditCategory("");
    setEditError("");
    setEditSaving(false);
  }

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeEditModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingProduct]);

  function startEdit(product: Product) {
    setEditError("");
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditCategory(product.category);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: Number(price),
        category,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Error al crear el producto");
      return;
    }

    setName("");
    setPrice("");
    setCategory("");
    await loadProducts();
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingProduct) {
      return;
    }

    setEditSaving(true);
    setEditError("");

    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        price: Number(editPrice),
        category: editCategory,
      }),
    });

    setEditSaving(false);

    if (!res.ok) {
      setEditError("Error al actualizar el producto");
      return;
    }

    closeEditModal();
    await loadProducts();
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError("");

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!res.ok) {
      setError("Error al eliminar el producto");
      return;
    }

    if (editingProduct?.id === id) {
      closeEditModal();
    }

    await loadProducts();
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-zinc-900">Productos</h1>
          <p className="mt-1 text-zinc-600">Mini CRUD con Prisma</p>
        </header>

        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-medium text-zinc-900">
            Nuevo producto
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              className={inputClassName}
            />
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio"
              className={inputClassName}
            />
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Categoría"
              className={inputClassName}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Crear"}
          </button>
        </form>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-zinc-500">Cargando...</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-zinc-500">No hay productos todavía.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-sm text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-100">
                    <td className="text-black px-4 py-3">{product.name}</td>
                    <td className="text-black px-4 py-3">${product.price}</td>
                    <td className="text-black px-4 py-3">{product.category}</td>
                    <td className="text-black px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="cursor-pointer text-zinc-600 hover:text-zinc-900"
                          aria-label={`Editar ${product.name}`}
                          title="Editar"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product.id)}
                          className="cursor-pointer text-sm text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === product.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeEditModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="edit-product-title"
              className="text-lg font-medium text-zinc-900"
            >
              Editar producto
            </h2>
            <form onSubmit={handleEdit} className="mt-4 space-y-3">
              <input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre"
                className={inputClassName}
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Precio"
                className={inputClassName}
              />
              <input
                required
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Categoría"
                className={inputClassName}
              />
              {editError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {editError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {editSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
