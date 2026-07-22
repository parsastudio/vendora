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
    <div className="space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
            Products Catalogue
          </h1>
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
            Manage your store variants, catalog prices, and metadata definitions.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="rounded-xl bg-stone-950 px-6 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 dark:hover:bg-zinc-200"
        >
          Create Product
        </Link>
      </div>

      <div className="rounded-3xl border border-stone-200/40 bg-white p-4 dark:border-zinc-900/50 dark:bg-zinc-950 max-w-md">
        <input
          type="text"
          placeholder="Search items by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-medium"
        />
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-xs text-stone-400 dark:text-zinc-500 font-semibold font-mono">
          Querying remote database...
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 text-center space-y-4 dark:border-zinc-800">
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold">
            No active products resolved.
          </p>
          <Link
            href="/admin/products/create"
            className="text-xs font-black uppercase tracking-widest text-stone-950 underline dark:text-zinc-50"
          >
            Create first variant
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-stone-200/40 bg-white dark:border-zinc-900/50 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
            <thead className="bg-stone-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Variant Product
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  SEO Slug
                </th>
                <th className="px-6 py-4.5 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4.5 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-6 py-5 text-stone-950 dark:text-zinc-50 font-black">
                    {p.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-stone-400 dark:text-zinc-500 font-mono">
                    {p.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/[0.06] border border-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      {p.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-right space-x-6">
                    <Link
                      href={`/admin/products/edit/${p.id}`}
                      className="text-stone-900 hover:text-stone-750 dark:text-zinc-100 dark:hover:text-zinc-300 font-bold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={isPending}
                      className="text-rose-600 hover:text-rose-700 font-bold disabled:opacity-50"
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
