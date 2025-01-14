"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/Overview";
import { RecentSales } from "@/components/RecentSales";
import { Inventory } from "@/components/Inventory";
import { ClientsWithBalance } from "@/components/ClientsWithBalance";
import { SuppliersToPayment } from "@/components/SuppliersToPayment";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { generateCSV } from "@/utils/csvGenerator";
import { LoadingSpinner } from "@/components/LoadingSpinner"; // Import LoadingSpinner

interface DashboardSummary {
  ventas: {
    totalVentas: number;
    totalPagado: number;
    totalSaldo: number;
  };
  compras: {
    totalCompras: number;
    totalPagado: number;
    totalSaldo: number;
  };
}

interface InventoryReport {
  fechaFiltro: {
    dia: number;
    mes: number;
    anio: number;
  };
  productos: {
    producto: string;
    cantidadDisponible: number;
    cantidadComprada: number;
    cantidadVendida: number;
    valorCompras: number;
    valorVentas: number;
  }[];
  comprasVsVentas: {
    totalComprasKg: number;
    totalComprasDinero: number;
    totalVentasKg: number;
    totalVentasDinero: number;
    ganancia: number;
  };
}

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [inventoryReport, setInventoryReport] =
    useState<InventoryReport | null>(null);
  const [recentSales, setRecentSales] = useState([]);
  const [clientsWithBalance, setClientsWithBalance] = useState([]);
  const [suppliersToPayment, setSuppliersToPayment] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState<"dia" | "mes" | "año">("dia");
  const [filtroDia, setFiltroDia] = useState(getCurrentDate());
  const [filtroMes, setFiltroMes] = useState(getCurrentDate().substring(0, 7));
  const [filtroAño, setFiltroAño] = useState(getCurrentDate().substring(0, 4));
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchDashboardData();
  }, [filtroTipo, filtroDia, filtroMes, filtroAño]);

  const fetchDashboardData = async () => {
    setIsLoading(true); // Set loading to true before fetching data
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
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

      const queryString = params.toString();

      const summaryResponse = await fetch(
        `${baseUrl}/reportes/summary?${queryString}`
      );
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

      const inventoryResponse = await fetch(
        `${baseUrl}/inventario/reporte-inventario?${queryString}`
      );
      const inventoryData = await inventoryResponse.json();
      setInventoryReport(inventoryData);

      const salesResponse = await fetch(`${baseUrl}/ventas?${queryString}`);
      const salesData = await salesResponse.json();
      setRecentSales(salesData.slice(0, 5));
      setClientsWithBalance(
        salesData.filter((sale: { saldo: number }) => sale.saldo > 0)
      );

      const purchasesResponse = await fetch(
        `${baseUrl}/compras?${queryString}`
      );
      const purchasesData = await purchasesResponse.json();
      setSuppliersToPayment(
        purchasesData.filter(
          (purchase: { saldo: number }) => purchase.saldo > 0
        )
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching data, regardless of success or failure
    }
  };

  const handleDownloadPDF = () => {
    if (summary && inventoryReport) {
      generatePDF(
        summary,
        inventoryReport,
        recentSales,
        clientsWithBalance,
        suppliersToPayment
      );
    }
  };

  const handleDownloadCSV = () => {
    if (summary && inventoryReport) {
      generateCSV(
        summary,
        inventoryReport,
        recentSales,
        clientsWithBalance,
        suppliersToPayment
      );
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {isLoading && <LoadingSpinner />} {/* Add LoadingSpinner */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Image
              src="/logo_pollo.png"
              alt="Logo Carnicería"
              width={80}
              height={80}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
            />
            <Button onClick={handleDownloadPDF} className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button onClick={handleDownloadCSV} className="flex items-center">
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
        {summary && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ventas
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Bs.{summary.ventas.totalVentas.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saldo: Bs.{summary.ventas.totalSaldo.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Compras
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Bs.{summary.compras.totalCompras.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saldo: Bs.{summary.compras.totalSaldo.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Bs.
                  {(
                    summary.ventas.totalVentas - summary.compras.totalCompras
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(
                    ((summary.ventas.totalVentas -
                      summary.compras.totalCompras) /
                      summary.compras.totalCompras) *
                    100
                  ).toFixed(2)}
                  % de margen
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Productos Activos
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryReport?.productos.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Productos en inventario
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Resumen de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview data={inventoryReport?.productos || []} />
            </CardContent>
          </Card>
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSales sales={recentSales} />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Clientes con Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsWithBalance clients={clientsWithBalance} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Proveedores por Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <SuppliersToPayment suppliers={suppliersToPayment} />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <Inventory data={inventoryReport?.productos || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
