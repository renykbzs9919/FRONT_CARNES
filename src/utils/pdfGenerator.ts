import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generatePDF = (
  summary: { ventas: { totalVentas: number }, compras: { totalCompras: number } },
  inventoryReport: { productos: { producto: string, cantidadDisponible: number, cantidadComprada: number, cantidadVendida: number, valorCompras: number, valorVentas: number }[] },
  recentSales: { clienteId: { nombre: string }, fechaVenta: string, total: number }[],
  clientsWithBalance: { clienteId: { nombre: string }, saldo: number }[],
  suppliersToPayment: { proveedorId: { nombre: string }, saldo: number }[]
) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Dashboard Report", 14, 15);

  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 25);

  // Summary
  doc.setFontSize(14);
  doc.text("Summary", 14, 35);
  doc.setFontSize(10);
  doc.text(`Total Sales: ${summary.ventas.totalVentas.toFixed(2)} Bs`, 14, 45);
  doc.text(
    `Total Purchases: ${summary.compras.totalCompras.toFixed(2)} Bs`,
    14,
    55
  );
  doc.text(
    `Profit: ${(
      summary.ventas.totalVentas - summary.compras.totalCompras
    ).toFixed(2)} Bs`,
    14,
    65
  );

  // Inventory
  doc.setFontSize(14);
  doc.text("Inventory", 14, 80);
  const inventoryTableColumn = [
    "Product",
    "Available",
    "Purchased",
    "Sold",
    "Purchase Value",
    "Sales Value",
  ];
  const inventoryTableRows = inventoryReport.productos.map((item) => [
    item.producto,
    item.cantidadDisponible,
    item.cantidadComprada,
    item.cantidadVendida,
    item.valorCompras.toFixed(2),
    item.valorVentas.toFixed(2),
  ]);

  (doc as any).autoTable({
    startY: 85,
    head: [inventoryTableColumn],
    body: inventoryTableRows,
  });

  // Recent Sales
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Recent Sales", 14, 15);
  const salesTableColumn = ["Client", "Date", "Total"];
  const salesTableRows = recentSales.map((sale) => [
    sale.clienteId.nombre,
    sale.fechaVenta,
    sale.total.toFixed(2),
  ]);

  (doc as any).autoTable({
    startY: 20,
    head: [salesTableColumn],
    body: salesTableRows,
  });

  // Clients with Balance
  doc.setFontSize(14);
  doc.text("Clients with Balance", 14, (doc as any).autoTable.previous.finalY + 10);
  const clientsTableColumn = ["Client", "Balance"];
  const clientsTableRows = clientsWithBalance.map((client) => [
    client.clienteId.nombre,
    client.saldo.toFixed(2),
  ]);

  (doc as any).autoTable({
    startY: (doc as any).autoTable.previous.finalY + 15,
    head: [clientsTableColumn],
    body: clientsTableRows,
  });

  // Suppliers to Payment
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Suppliers to Payment", 14, 15);
  const suppliersTableColumn = ["Supplier", "Balance"];
  const suppliersTableRows = suppliersToPayment.map((supplier) => [
    supplier.proveedorId.nombre,
    supplier.saldo.toFixed(2),
  ]);

  (doc as any).autoTable({
    startY: 20,
    head: [suppliersTableColumn],
    body: suppliersTableRows,
  });

  doc.save("dashboard-report.pdf");
};
