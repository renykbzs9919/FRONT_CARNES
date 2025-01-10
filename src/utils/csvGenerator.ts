export const generateCSV = (
  summary: {
    ventas: { totalVentas: number },
    compras: { totalCompras: number }
  },
  inventoryReport: { productos: { producto: string, cantidadDisponible: number, cantidadComprada: number, cantidadVendida: number, valorCompras: number, valorVentas: number }[] },
  recentSales: { clienteId: { nombre: string }, fechaVenta: string, total: number }[],
  clientsWithBalance: { clienteId: { nombre: string }, saldo: number }[],
  suppliersToPayment: { proveedorId: { nombre: string }, saldo: number }[]
) => {
  let csv = "Dashboard Report\n\n";

  // Summary
  csv += "Summary\n";
  csv += `Total Sales,${summary.ventas.totalVentas.toFixed(2)} Bs\n`;
  csv += `Total Purchases,${summary.compras.totalCompras.toFixed(2)} Bs\n`;
  csv += `Profit,${(
    summary.ventas.totalVentas - summary.compras.totalCompras
  ).toFixed(2)} Bs\n\n`;

  // Inventory
  csv += "Inventory\n";
  csv += "Product,Available,Purchased,Sold,Purchase Value,Sales Value\n";
  inventoryReport.productos.forEach((item) => {
    csv += `${item.producto},${item.cantidadDisponible},${
      item.cantidadComprada
    },${item.cantidadVendida},${item.valorCompras.toFixed(
      2
    )},${item.valorVentas.toFixed(2)}\n`;
  });

  // Recent Sales
  csv += "\nRecent Sales\n";
  csv += "Client,Date,Total\n";
  recentSales.forEach((sale) => {
    csv += `${sale.clienteId.nombre},${sale.fechaVenta},${sale.total.toFixed(
      2
    )}\n`;
  });

  // Clients with Balance
  csv += "\nClients with Balance\n";
  csv += "Client,Balance\n";
  clientsWithBalance.forEach((client) => {
    csv += `${client.clienteId.nombre},${client.saldo.toFixed(2)}\n`;
  });

  // Suppliers to Payment
  csv += "\nSuppliers to Payment\n";
  csv += "Supplier,Balance\n";
  suppliersToPayment.forEach((supplier) => {
    csv += `${supplier.proveedorId.nombre},${supplier.saldo.toFixed(2)}\n`;
  });

  // Create and download the CSV file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "dashboard-report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
