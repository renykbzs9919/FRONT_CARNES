"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, BarChart, PieChart, Download } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ProductoInventario {
  producto: string;
  cantidadDisponible: number;
  cantidadComprada: number;
  cantidadVendida: number;
  valorCompras: number;
  valorVentas: number;
}

interface ComprasVsVentas {
  totalComprasKg: number;
  totalComprasDinero: number;
  totalVentasKg: number;
  totalVentasDinero: number;
  ganancia: number;
}

interface InventarioData {
  fechaFiltro: {
    dia: number;
    mes: number;
    anio: number;
  };
  productos: ProductoInventario[];
  comprasVsVentas: ComprasVsVentas;
}

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function InventarioPage() {
  const [inventarioData, setInventarioData] = useState<InventarioData | null>(
    null
  );
  const [filtroTipo, setFiltroTipo] = useState<"dia" | "mes" | "año">("dia");
  const [filtroDia, setFiltroDia] = useState(getCurrentDate());
  const [filtroMes, setFiltroMes] = useState(getCurrentDate().substring(0, 7));
  const [filtroAño, setFiltroAño] = useState(getCurrentDate().substring(0, 4));

  useEffect(() => {
    fetchData();
  }, [filtroTipo, filtroDia, filtroMes, filtroAño]);

  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      let url = `${baseUrl}/inventario/reporte-inventario`;
      const params = new URLSearchParams();

      switch (filtroTipo) {
        case "dia":
          const [year, month, day] = filtroDia.split("-");
          params.append("dia", day);
          params.append("mes", month);
          params.append("anio", year);
          break;
        case "mes":
          const [yearMonth, monthMonth] = filtroMes.split("-");
          params.append("mes", monthMonth);
          params.append("anio", yearMonth);
          break;
        case "año":
          params.append("anio", filtroAño);
          break;
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setInventarioData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Resumen de Inventario",
      },
    },
  };

  const barChartData = inventarioData
    ? {
        labels: inventarioData.productos.map((item) => item.producto),
        datasets: [
          {
            label: "Cantidad Disponible",
            data: inventarioData.productos.map(
              (item) => item.cantidadDisponible
            ),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
          {
            label: "Cantidad Vendida",
            data: inventarioData.productos.map((item) => item.cantidadVendida),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
          {
            label: "Cantidad Comprada",
            data: inventarioData.productos.map((item) => item.cantidadComprada),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      }
    : null;

  const pieChartData = inventarioData
    ? {
        labels: ["Valor Compras", "Valor Ventas"],
        datasets: [
          {
            data: [
              inventarioData.comprasVsVentas.totalComprasDinero,
              inventarioData.comprasVsVentas.totalVentasDinero,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(53, 162, 235, 0.5)",
            ],
            borderColor: ["rgba(255, 99, 132, 1)", "rgba(53, 162, 235, 1)"],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const downloadPDF = () => {
    if (!inventarioData) return;

    const doc = new jsPDF();
    doc.text("Reporte de Inventario", 14, 15);

    // Add date information
    const { dia, mes, anio } = inventarioData.fechaFiltro;
    doc.text(
      `Fecha: ${dia.toString()}/${mes.toString()}/${anio.toString()}`,
      14,
      25
    );

    // Add table
    const tableColumn = [
      "Producto",
      "Disponible",
      "Comprado",
      "Vendido",
      "Valor Compras",
      "Valor Ventas",
    ];
    const tableRows = inventarioData.productos.map((item) => [
      item.producto,
      item.cantidadDisponible,
      item.cantidadComprada,
      item.cantidadVendida,
      item.valorCompras.toFixed(2),
      item.valorVentas.toFixed(2),
    ]);

    let finalY = 35;
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      didDrawPage: (data) => {
        if (data.cursor) {
          finalY = data.cursor.y;
        }
      },
    });

    // Add summary
    const { comprasVsVentas } = inventarioData;
    doc.text("Resumen:", 14, finalY + 10);
    doc.text(
      `Total Compras: ${
        comprasVsVentas.totalComprasKg
      } Kg - ${comprasVsVentas.totalComprasDinero.toFixed(2)} Bs`,
      14,
      finalY + 20
    );
    doc.text(
      `Total Ventas: ${
        comprasVsVentas.totalVentasKg
      } Kg - ${comprasVsVentas.totalVentasDinero.toFixed(2)} Bs`,
      14,
      finalY + 30
    );
    doc.text(
      `Ganancia: ${comprasVsVentas.ganancia.toFixed(2)} Bs`,
      14,
      finalY + 40
    );

    doc.save("reporte-inventario.pdf");
  };

  const downloadCSV = () => {
    if (!inventarioData) return;

    const { productos, comprasVsVentas, fechaFiltro } = inventarioData;
    let csv =
      "Producto,Cantidad Disponible,Cantidad Comprada,Cantidad Vendida,Valor Compras,Valor Ventas\n";

    productos.forEach((item) => {
      csv += `${item.producto},${item.cantidadDisponible},${
        item.cantidadComprada
      },${item.cantidadVendida},${item.valorCompras.toFixed(
        2
      )},${item.valorVentas.toFixed(2)}\n`;
    });

    csv += `\nResumen\n`;
    csv += `Fecha,${fechaFiltro.dia}/${fechaFiltro.mes}/${fechaFiltro.anio}\n`;
    csv += `Total Compras,${
      comprasVsVentas.totalComprasKg
    } Kg,${comprasVsVentas.totalComprasDinero.toFixed(2)} Bs\n`;
    csv += `Total Ventas,${
      comprasVsVentas.totalVentasKg
    } Kg,${comprasVsVentas.totalVentasDinero.toFixed(2)} Bs\n`;
    csv += `Ganancia,${comprasVsVentas.ganancia.toFixed(2)} Bs\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "reporte-inventario.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Inventario</h1>
        <div className="flex items-center space-x-4">
          <Package className="h-8 w-8" />
          <Button onClick={downloadPDF} className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={downloadCSV} className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtroTipo">Tipo de Filtro</Label>
              <Select
                value={filtroTipo}
                onValueChange={(value: "dia" | "mes" | "año") =>
                  setFiltroTipo(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Día</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                  <SelectItem value="año">Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filtroTipo === "dia" && (
              <div>
                <Label htmlFor="filtroDia">Fecha</Label>
                <Input
                  id="filtroDia"
                  type="date"
                  value={filtroDia}
                  onChange={(e) => setFiltroDia(e.target.value)}
                />
              </div>
            )}
            {filtroTipo === "mes" && (
              <div>
                <Label htmlFor="filtroMes">Mes</Label>
                <Input
                  id="filtroMes"
                  type="month"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                />
              </div>
            )}
            {filtroTipo === "año" && (
              <div>
                <Label htmlFor="filtroAño">Año</Label>
                <Input
                  id="filtroAño"
                  type="number"
                  value={filtroAño}
                  onChange={(e) => setFiltroAño(e.target.value)}
                  min="2000"
                  max="2100"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Cantidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[400px]">
              {barChartData && (
                <Bar options={chartOptions} data={barChartData} />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor Compras vs Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[400px]">
              {pieChartData && (
                <Pie data={pieChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Vendido</TableHead>
                  <TableHead>Comprado</TableHead>
                  <TableHead>Valor Compras</TableHead>
                  <TableHead>Valor Ventas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventarioData?.productos.map((item) => (
                  <TableRow key={item.producto}>
                    <TableCell>{item.producto}</TableCell>
                    <TableCell>{item.cantidadDisponible}</TableCell>
                    <TableCell>{item.cantidadVendida}</TableCell>
                    <TableCell>{item.cantidadComprada}</TableCell>
                    <TableCell>{item.valorCompras.toFixed(2)} Bs</TableCell>
                    <TableCell>{item.valorVentas.toFixed(2)} Bs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {inventarioData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen de Compras vs Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold">Total Compras:</p>
                <p>{inventarioData.comprasVsVentas.totalComprasKg} Kg</p>
                <p>
                  {inventarioData.comprasVsVentas.totalComprasDinero.toFixed(2)}{" "}
                  Bs
                </p>
              </div>
              <div>
                <p className="font-semibold">Total Ventas:</p>
                <p>{inventarioData.comprasVsVentas.totalVentasKg} Kg</p>
                <p>
                  {inventarioData.comprasVsVentas.totalVentasDinero.toFixed(2)}{" "}
                  Bs
                </p>
              </div>
              <div>
                <p className="font-semibold">Ganancia:</p>
                <p>{inventarioData.comprasVsVentas.ganancia.toFixed(2)} Bs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
