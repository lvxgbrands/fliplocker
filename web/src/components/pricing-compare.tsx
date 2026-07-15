import { Fragment } from "react";
import { Check, Minus } from "lucide-react";
import { COMPARISON, PACKAGES } from "@/lib/pricing";

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center">
        <Check className="h-4 w-4 text-brand-600" strokeWidth={2.8} />
        <span className="sr-only">Included</span>
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center">
        <Minus className="h-4 w-4 text-ink-300" strokeWidth={2.4} />
        <span className="sr-only">Not included</span>
      </span>
    );
  return <span className="text-xs font-medium text-ink-700">{value}</span>;
}

export function PricingCompare() {
  // `relative` makes this scroll container the containing block for the table's
  // absolutely-positioned `sr-only` nodes; without it they escape the clip and
  // push the page into horizontal overflow on mobile.
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">Feature comparison across the Single, Plus, and Pro packages</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[40%] px-4 py-4 text-left align-bottom">
              <span className="kicker text-[11px] text-ink-400">Compare packages</span>
            </th>
            {PACKAGES.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-4 text-center">
                <span className={`block text-base font-bold ${p.popular ? "text-brand-700" : "text-ink-900"}`}>
                  {p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((section) => (
            <Fragment key={section.heading}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="border-t border-ink-200 bg-ink-50 px-4 py-2.5 text-left"
                >
                  <span className="kicker text-[11px] text-brand-600">{section.heading}</span>
                </th>
              </tr>
              {section.rows.map((row) => (
                <tr key={row.label} className="border-t border-ink-100">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-ink-700">
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.single} />
                  </td>
                  <td className="bg-brand-50/40 px-4 py-3 text-center">
                    <Cell value={row.plus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.pro} />
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
