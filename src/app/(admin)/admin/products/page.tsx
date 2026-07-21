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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Products Catalog
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Manage your e-commerce catalog, price variations, and stock.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="rounded-xl bg-zinc-950 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.005] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Create Product
        </Link>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800/40 dark:bg-zinc-950">
        <input
          type="text"
          placeholder="Search catalog items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full max-w-md rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-xs text-zinc-400 font-medium">
          Fetching products from server...
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-center space-y-3 dark:border-zinc-850/40">
          <p className="text-xs text-zinc-455 font-medium">No products found in catalog.</p>
          <Link
            href="/admin/products/create"
            className="text-xs font-bold text-zinc-950 underline dark:text-zinc-50"
          >
            Create the first product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800/40 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Product Name
                </th>
                <th className="px-6 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Slug
                </th>
                <th className="px-6 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 font-semibold text-xs">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-6 py-4.5 text-zinc-950 dark:text-zinc-50 font-bold">
                    {p.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4.5 text-zinc-400 font-mono">
                    {p.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4.5">
                    <span className="inline-flex items-center rounded-full bg-emerald-50/50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      {p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4.5 text-right space-x-4">
                    <Link
                      href={`/admin/products/edit/${p.id}`}
                      className="text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={isPending}
                      className="text-rose-600 hover:underline disabled:opacity-50"
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
