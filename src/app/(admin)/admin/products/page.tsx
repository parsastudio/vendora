"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { deleteProduct } from "@/features/products/actions/product";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?search=${search}`);
      const { data } = await res.json();
      if (data && data.items) {
        setProducts(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Products
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your e-commerce catalog, variants, and stock.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Create Product
        </Link>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <input
          type="text"
          placeholder="Search catalog items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full max-w-md rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
          Fetching products from server...
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 text-sm text-zinc-500 dark:border-zinc-800">
          <span>No products found.</span>
          <Link
            href="/admin/products/create"
            className="mt-2 text-zinc-950 underline dark:text-zinc-50"
          >
            Create the first product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {p.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">{p.slug}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      {p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-xs space-x-3">
                    <Link
                      href={`/admin/products/edit/${p.id}`}
                      className="text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={isPending}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
