import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Sale {
  _id: string;
  clienteId: {
    _id: string;
    nombre: string;
  };
  total: number;
  fechaVenta: string;
}

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale._id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${sale.clienteId.nombre}`} alt="Avatar" />
            <AvatarFallback>{sale.clienteId.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.clienteId.nombre}</p>
            <p className="text-sm text-muted-foreground">
              {sale.fechaVenta}
            </p>
          </div>
          <div className="ml-auto font-medium">+Bs{sale.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

