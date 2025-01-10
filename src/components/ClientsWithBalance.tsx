import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  _id: string;
  clienteId: {
    _id: string;
    nombre: string;
  };
  saldo: number;
}

interface ClientsWithBalanceProps {
  clients: Client[];
}

export function ClientsWithBalance({ clients }: ClientsWithBalanceProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client._id}>
            <TableCell>{client.clienteId.nombre}</TableCell>
            <TableCell>Bs{client.saldo.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

