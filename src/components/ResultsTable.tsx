import type { Product } from "../lib/types";
import { money } from "../lib/format";

export default function ResultsTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="panel px-4 py-10 text-center">
        <p className="text-[14px] text-ink">No products yet.</p>
        <p className="text-[13px] text-muted mt-1">
          Rows appear here as each category finishes.
        </p>
      </div>
    );
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-paper/70 text-left">
            {["#", "Product", "Brand", "Category", "Price", "Was", "Stock", "Rating"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-3 py-2.5 eyebrow font-normal whitespace-nowrap border-b border-line"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-line last:border-0 hover:bg-paper/50">
              <td className="px-3 py-2.5 font-mono text-muted tabular-nums">{product.sequence}</td>
              <td className="px-3 py-2.5 max-w-[380px]">
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-signal line-clamp-2"
                >
                  {product.name}
                </a>
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap">{product.brand ?? "—"}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-muted">
                {product.subcategory_name ?? "—"}
              </td>
              <td className="px-3 py-2.5 font-mono tabular-nums whitespace-nowrap">
                {money(product.price)}
              </td>
              <td className="px-3 py-2.5 font-mono tabular-nums text-muted line-through whitespace-nowrap">
                {product.old_price ? money(product.old_price) : ""}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                <span
                  className={
                    product.stock === "Out of Stock" ? "text-warn" : "text-good"
                  }
                >
                  {product.stock ?? "—"}
                </span>
              </td>
              <td className="px-3 py-2.5 font-mono tabular-nums whitespace-nowrap">
                {product.rating ? `${product.rating}★` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
