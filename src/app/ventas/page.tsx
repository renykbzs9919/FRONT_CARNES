"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Trash2, Plus, DollarSign, Eye } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { showAlert } from "@/utils/alerts";
import { LoadingSpinner } from "@/components/LoadingSpinnerGuardar";

interface Producto {
  _id: string;
  nombre: string;
  cantidadDisponible: number;
}

interface Cliente {
  _id: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface ProductoVenta {
  productoId: Producto;
  cantidad: number;
  precio: number;
  subtotal: number;
  _id: string;
}

interface Pago {
  monto: number;
  fecha: string;
  _id: string;
}

interface Venta {
  _id: string;
  clienteId: Cliente;
  productos: ProductoVenta[];
  total: number;
  montoPagado: number;
  saldo: number;
  estado: string;
  fechaVenta: string;
  pagos: Pago[];
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateTotal = (productos: ProductoVenta[]) => {
  return productos.reduce((total, producto) => total + producto.subtotal, 0);
};

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentVenta, setCurrentVenta] = useState<Venta | null>(null);
  const [newVenta, setNewVenta] = useState({
    clienteId: "",
    productos: [] as ProductoVenta[],
    fechaVenta: getCurrentDate(),
    pago: 0,
  });
  const [newPayment, setNewPayment] = useState({
    clienteId: "",
    ventaId: "none",
    montoPago: 0,
    fechaPago: getCurrentDate(),
  });
  const [clientesConDeuda, setClientesConDeuda] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingVenta, setIsAddingVenta] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  useEffect(() => {
    fetchVentas();
    fetchProductos();
    fetchClientes();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventas`);
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      const data = await response.json();
      setVentas(data);
      updateClientesConDeuda(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      showAlert("Error al cargar las ventas", "error");
    }
  };

  const updateClientesConDeuda = (ventas: Venta[]) => {
    const clientesDeudores = ventas
      .filter((venta) => venta.saldo > 0)
      .map((venta) => venta.clienteId._id);
    setClientesConDeuda([...new Set(clientesDeudores)]);
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/productos`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProductos(
        data.filter((producto: Producto) => producto.cantidadDisponible > 0)
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("Error al cargar los productos", "error");
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clientes`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      showAlert("Error al cargar los clientes", "error");
    }
  };

  const handleAddVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newVenta.clienteId === "" || newVenta.productos.length === 0) {
      showAlert("Por favor, complete todos los campos requeridos.", "error");
      return;
    }
    if (newVenta.productos.some((p) => p.cantidad <= 0 || p.precio <= 0)) {
      showAlert(
        "La cantidad y el precio de los productos deben ser mayores que cero.",
        "error"
      );
      return;
    }
    if (
      newVenta.pago < 0 ||
      newVenta.pago > calculateTotal(newVenta.productos)
    ) {
      showAlert(
        "El pago inicial no puede ser negativo ni exceder el total de la venta.",
        "error"
      );
      return;
    }
    if (
      newVenta.productos.some(
        (p) => p.cantidad > p.productoId.cantidadDisponible
      )
    ) {
      showAlert(
        "No hay suficiente stock disponible para uno o más productos.",
        "error"
      );
      return;
    }
    setIsAddingVenta(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ventas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newVenta),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add sale");
      }
      await fetchVentas();
      setIsAddDialogOpen(false);
      setNewVenta({
        clienteId: "",
        productos: [],
        fechaVenta: getCurrentDate(),
        pago: 0,
      });
      showAlert("Venta registrada exitosamente.", "success");
    } catch (error) {
      console.error("Error adding sale:", error);
      showAlert(
        "Error al agregar la venta. Por favor, intente de nuevo.",
        "error"
      );
    } finally {
      setIsAddingVenta(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.clienteId === "" || newPayment.montoPago <= 0) {
      showAlert(
        "Por favor, seleccione un cliente y especifique un monto de pago válido.",
        "error"
      );
      return;
    }

    const clienteVentas = ventas.filter(
      (v) => v.clienteId._id === newPayment.clienteId
    );
    const totalSaldo = clienteVentas.reduce((sum, v) => sum + v.saldo, 0);

    if (newPayment.montoPago > totalSaldo) {
      showAlert(
        "El monto del pago no puede exceder el saldo total del cliente.",
        "error"
      );
      return;
    }

    setIsAddingPayment(true);
    try {
      const paymentData = {
        clienteId: newPayment.clienteId,
        montoPago: newPayment.montoPago,
        fechaPago: newPayment.fechaPago,
        ...(newPayment.ventaId !== "none" && { ventaId: newPayment.ventaId }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ventas/pago`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add payment");
      }

      await fetchVentas();
      setIsPaymentDialogOpen(false);
      setNewPayment({
        clienteId: "",
        ventaId: "none",
        montoPago: 0,
        fechaPago: getCurrentDate(),
      });
      showAlert("Pago registrado exitosamente.", "success");
    } catch (error) {
      console.error("Error adding payment:", error);
      showAlert(
        "Error al registrar el pago. Por favor, intente de nuevo.",
        "error"
      );
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleAddProductToVenta = (producto: Producto) => {
    setNewVenta((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          productoId: producto,
          cantidad: 1,
          precio: 0,
          subtotal: 0,
          _id: "",
        },
      ],
    }));
  };

  const handleRemoveProductFromVenta = (index: number) => {
    setNewVenta((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const handleProductChange = (
    index: number,
    field: "cantidad" | "precio",
    value: number
  ) => {
    setNewVenta((prev) => ({
      ...prev,
      productos: prev.productos.map((producto, i) => {
        if (i === index) {
          let updatedValue = Math.max(0.01, value);
          if (field === "cantidad") {
            updatedValue = Math.min(
              updatedValue,
              producto.productoId.cantidadDisponible
            );
          }
          const updatedProducto = {
            ...producto,
            [field]: updatedValue,
          };
          updatedProducto.subtotal =
            updatedProducto.cantidad * updatedProducto.precio;
          return updatedProducto;
        }
        return producto;
      }),
    }));
  };

  return (
    <>
      {(isAddingVenta || isAddingPayment) && <LoadingSpinner />}
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Ventas</h1>
          <div className="flex items-center space-x-4">
            <ShoppingBag className="h-8 w-8" />
          </div>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gestión de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mb-5">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Venta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Venta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVenta} className="space-y-4">
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select
                      onValueChange={(value) =>
                        setNewVenta({ ...newVenta, clienteId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente._id} value={cliente._id}>
                            {cliente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fechaVenta">Fecha de Venta</Label>
                    <Input
                      id="fechaVenta"
                      type="date"
                      value={newVenta.fechaVenta}
                      onChange={(e) =>
                        setNewVenta({ ...newVenta, fechaVenta: e.target.value })
                      }
                      max={getCurrentDate()}
                      required
                    />
                  </div>
                  <div>
                    <Label>Productos</Label>
                    {newVenta.productos.map((producto, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <span>{producto.productoId.nombre}</span>
                        <div className="flex flex-col">
                          <Label htmlFor={`cantidad-${index}`}>Cantidad</Label>
                          <Input
                            id={`cantidad-${index}`}
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "cantidad",
                                parseFloat(e.target.value)
                              )
                            }
                            placeholder="Cantidad"
                            className="w-20"
                            min="0.01"
                            step="0.01"
                            max={producto.productoId.cantidadDisponible}
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label htmlFor={`precio-${index}`}>Precio</Label>
                          <Input
                            id={`precio-${index}`}
                            type="number"
                            value={producto.precio}
                            onChange={(e) =>
                              handleProductChange(
                                index,
                                "precio",
                                parseFloat(e.target.value)
                              )
                            }
                            placeholder="Precio"
                            className="w-20"
                            min="0.01"
                            step="0.01"
                          />
                        </div>
                        <span>Subtotal: Bs.{producto.subtotal.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveProductFromVenta(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Select
                      onValueChange={(value) => {
                        const producto = productos.find((p) => p._id === value);
                        if (producto) {
                          handleAddProductToVenta(producto);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Agregar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((producto) => (
                          <SelectItem key={producto._id} value={producto._id}>
                            {producto.nombre} (Disponible:{" "}
                            {producto.cantidadDisponible})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pago">Pago Inicial</Label>
                    <Input
                      id="pago"
                      type="number"
                      value={newVenta.pago}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const total = calculateTotal(newVenta.productos);
                        setNewVenta({
                          ...newVenta,
                          pago: Math.min(Math.max(0, value), total),
                        });
                      }}
                      min="0"
                      max={calculateTotal(newVenta.productos)}
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <p>
                      Total: Bs.{calculateTotal(newVenta.productos).toFixed(2)}
                    </p>
                    <p>
                      Saldo: Bs.
                      {(
                        calculateTotal(newVenta.productos) - newVenta.pago
                      ).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full mb-5"
                    disabled={isAddingVenta}
                  >
                    {isAddingVenta ? "Registrando..." : "Registrar Venta"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="mb-5 ml-2">
                  <DollarSign className="mr-2 h-4 w-4" /> Registrar Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Pago</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select
                      onValueChange={(value) => {
                        setNewPayment({
                          ...newPayment,
                          clienteId: value,
                          ventaId: "none",
                          montoPago: 0,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes
                          .filter((cliente) =>
                            clientesConDeuda.includes(cliente._id)
                          )
                          .map((cliente) => (
                            <SelectItem key={cliente._id} value={cliente._id}>
                              {cliente.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newPayment.clienteId && (
                    <div>
                      <Label htmlFor="venta">Venta (Opcional)</Label>
                      <Select
                        value={newPayment.ventaId}
                        onValueChange={(value) => {
                          if (value === "none") {
                            setNewPayment({
                              ...newPayment,
                              ventaId: "none",
                              montoPago: 0,
                            });
                          } else {
                            const selectedVenta = ventas.find(
                              (v) => v._id === value
                            );
                            setNewPayment({
                              ...newPayment,
                              ventaId: value,
                              montoPago: selectedVenta
                                ? selectedVenta.saldo
                                : 0,
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar venta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Ninguna venta específica
                          </SelectItem>
                          {ventas
                            .filter(
                              (venta) =>
                                venta.clienteId._id === newPayment.clienteId &&
                                venta.saldo > 0
                            )
                            .map((venta) => (
                              <SelectItem key={venta._id} value={venta._id}>
                                {formatDate(venta.fechaVenta)} - Saldo: Bs.
                                {venta.saldo.toFixed(2)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="montoPago">Monto del Pago</Label>
                    <Input
                      id="montoPago"
                      type="number"
                      value={newPayment.montoPago}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (newPayment.ventaId === "none") {
                          const clienteVentas = ventas.filter(
                            (v) => v.clienteId._id === newPayment.clienteId
                          );
                          const totalSaldo = clienteVentas.reduce(
                            (sum, v) => sum + v.saldo,
                            0
                          );
                          setNewPayment({
                            ...newPayment,
                            montoPago: Math.min(Math.max(0, value), totalSaldo),
                          });
                        }
                      }}
                      min="0.01"
                      step="0.01"
                      required
                      disabled={newPayment.ventaId !== "none"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaPago">Fecha del Pago</Label>
                    <Input
                      id="fechaPago"
                      type="date"
                      value={newPayment.fechaPago}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          fechaPago: e.target.value,
                        })
                      }
                      max={getCurrentDate()}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full mb-5"
                    disabled={isAddingPayment}
                  >
                    {isAddingPayment ? "Registrando..." : "Registrar Pago"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta._id}>
                      <TableCell>{venta.clienteId.nombre}</TableCell>
                      <TableCell>{formatDate(venta.fechaVenta)}</TableCell>
                      <TableCell>Bs.{venta.total.toFixed(2)}</TableCell>
                      <TableCell>Bs.{venta.montoPagado.toFixed(2)}</TableCell>
                      <TableCell>Bs.{venta.saldo.toFixed(2)}</TableCell>
                      <TableCell>{venta.estado}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentVenta(venta);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-4">
              {ventas.map((venta) => (
                <Card key={venta._id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p>
                        <strong>Cliente:</strong> {venta.clienteId.nombre}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {formatDate(venta.fechaVenta)}
                      </p>
                      <p>
                        <strong>Total:</strong> Bs.{venta.total.toFixed(2)}
                      </p>
                      <p>
                        <strong>Pagado:</strong> Bs.
                        {venta.montoPagado.toFixed(2)}
                      </p>
                      <p>
                        <strong>Saldo:</strong> Bs.{venta.saldo.toFixed(2)}
                      </p>
                      <p>
                        <strong>Estado:</strong> {venta.estado}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentVenta(venta);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalles de la Venta</DialogTitle>
            </DialogHeader>
            {currentVenta && (
              <div className="space-y-4">
                <p>
                  <strong>Cliente:</strong> {currentVenta.clienteId.nombre}
                </p>
                <p>
                  <strong>Fecha de Venta:</strong>{" "}
                  {formatDate(currentVenta.fechaVenta)}
                </p>
                <p>
                  <strong>Total:</strong> Bs.{currentVenta.total.toFixed(2)}
                </p>
                <p>
                  <strong>Pago Inicial:</strong> Bs.
                  {currentVenta.montoPagado.toFixed(2)}
                </p>
                <p>
                  <strong>Saldo:</strong> Bs.{currentVenta.saldo.toFixed(2)}
                </p>
                <p>
                  <strong>Estado:</strong> {currentVenta.estado}
                </p>
                <div>
                  <h4 className="font-bold mb-2">Productos:</h4>
                  <ul className="list-disc pl-5">
                    {currentVenta.productos.map((producto, index) => (
                      <li key={index}>
                        {producto.productoId.nombre} - Cantidad:{" "}
                        {producto.cantidad}, Precio: Bs.
                        {producto.precio.toFixed(2)}, Subtotal: Bs.
                        {producto.subtotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Pagos Realizados:</h4>
                  {currentVenta.pagos && currentVenta.pagos.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {currentVenta.pagos.map((pago, index) => (
                        <li key={index}>
                          Monto: Bs.{pago.monto.toFixed(2)}, Fecha:{" "}
                          {formatDate(pago.fecha)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No se han realizado pagos aún.</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Toaster />
      </div>
    </>
  );
}
