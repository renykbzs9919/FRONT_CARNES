import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryItem {
  producto: string;
  cantidadDisponible: number;
  cantidadComprada: number;
  cantidadVendida: number;
  valorCompras: number;
  valorVentas: number;
}

interface InventoryProps {
  data: InventoryItem[];
}

export function Inventory({ data }: InventoryProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Disponible</TableHead>
          <TableHead>Comprado</TableHead>
          <TableHead>Vendido</TableHead>
          <TableHead>Valor Compras</TableHead>
          <TableHead>Valor Ventas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.producto}>
            <TableCell>{item.producto}</TableCell>
            <TableCell>{item.cantidadDisponible}</TableCell>
            <TableCell>{item.cantidadComprada}</TableCell>
            <TableCell>{item.cantidadVendida}</TableCell>
            <TableCell>Bs{item.valorCompras.toFixed(2)}</TableCell>
            <TableCell>Bs{item.valorVentas.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
