import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { priorityStyles, statusStyles } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

export function ProductCard({
  product,
  boothCode
}: {
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    quantity: number;
    poDeadline: string | null;
    productLink: string | null;
    status: keyof typeof statusStyles;
    priority: keyof typeof priorityStyles;
    purchaseType: string;
    circle: { id: string; name: string };
    event: { id: string; name: string };
  };
  boothCode?: string | null;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-brand-50">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-500">No image</div>
        )}
      </div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusStyles[product.status]}>{product.status.replace("_", " ")}</Badge>
            <Badge className={priorityStyles[product.priority]}>{product.priority}</Badge>
          </div>
          <Link href={`/products/${product.id}`} className="line-clamp-2 font-[var(--font-display)] text-xl font-semibold text-ink-900 hover:text-brand-700">
            {product.name}
          </Link>
          <div className="text-sm text-ink-500">
            <p>{product.circle.name}</p>
            <p>{boothCode ? `Booth ${boothCode}` : "Booth belum diatur"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-ink-700">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-500">Harga</p>
            <p className="mt-1 font-medium">{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-500">Qty</p>
            <p className="mt-1 font-medium">{product.quantity}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-500">Deadline</p>
            <p className="mt-1 font-medium">{formatDate(product.poDeadline)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink-500">Mode</p>
            <p className="mt-1 font-medium">{product.purchaseType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${product.id}`} className="inline-flex rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white">
            Detail
          </Link>
          {product.productLink ? (
            <Link href={product.productLink} target="_blank" className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-700">
              Open link
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}


