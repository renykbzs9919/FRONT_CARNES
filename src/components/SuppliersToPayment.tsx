import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Supplier {
  _id: string;
  proveedorId: {
    _id: string;
    nombre: string;
  };
  saldo: number;
}

interface SuppliersToPaymentProps {
  suppliers: Supplier[];
}

export function SuppliersToPayment({ suppliers }: SuppliersToPaymentProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proveedor</TableHead>
          <TableHead>Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier._id}>
            <TableCell>{supplier.proveedorId.nombre}</TableCell>
            <TableCell>Bs{supplier.saldo.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

