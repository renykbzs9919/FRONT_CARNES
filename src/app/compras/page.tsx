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
import { ShoppingCart, Trash2, Plus, DollarSign, Eye } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { showAlert } from "@/utils/alerts";
import { LoadingSpinner } from "@/components/LoadingSpinnerGuardar";

interface Producto {
  _id: string;
  nombre: string;
  cantidadDisponible: number;
}

interface Proveedor {
  _id: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface ProductoCompra {
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

interface Compra {
  _id: string;
  proveedorId: Proveedor;
  productos: ProductoCompra[];
  total: number;
  montoPagado: number;
  saldo: number;
  estado: string;
  fechaCompra: string;
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

const calculateTotal = (productos: ProductoCompra[]) => {
  return productos.reduce((total, producto) => total + producto.subtotal, 0);
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentCompra, setCurrentCompra] = useState<Compra | null>(null);
  const [newCompra, setNewCompra] = useState({
    proveedorId: "",
    productos: [] as ProductoCompra[],
    fechaCompra: getCurrentDate(),
    pago: 0,
  });
  const [newPayment, setNewPayment] = useState({
    proveedorId: "",
    compraId: "none",
    montoPago: 0,
    fechaPago: getCurrentDate(),
  });
  const [proveedoresConDeuda, setProveedoresConDeuda] = useState<string[]>([]);
  const [isAddingCompra, setIsAddingCompra] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  useEffect(() => {
    fetchCompras();
    fetchProductos();
    fetchProveedores();
  }, []);

  const fetchCompras = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compras`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch purchases");
      }
      const data = await response.json();
      setCompras(data);
      updateProveedoresConDeuda(data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      showAlert("Error al cargar las compras", "error");
    }
  };

  const updateProveedoresConDeuda = (compras: Compra[]) => {
    const proveedoresDeudores = compras
      .filter((compra) => compra.saldo > 0)
      .map((compra) => compra.proveedorId._id);
    setProveedoresConDeuda([...new Set(proveedoresDeudores)]);
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
      setProductos(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("Error al cargar los productos", "error");
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/proveedores`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showAlert("Error al cargar los proveedores", "error");
    }
  };

  const handleAddCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCompra(true);
    if (newCompra.proveedorId === "" || newCompra.productos.length === 0) {
      showAlert("Por favor, complete todos los campos requeridos.", "error");
      setIsAddingCompra(false);
      return;
    }
    if (newCompra.productos.some((p) => p.cantidad <= 0 || p.precio <= 0)) {
      showAlert(
        "La cantidad y el precio de los productos deben ser mayores que cero.",
        "error"
      );
      setIsAddingCompra(false);
      return;
    }
    if (
      newCompra.pago < 0 ||
      newCompra.pago > calculateTotal(newCompra.productos)
    ) {
      showAlert(
        "El pago inicial no puede ser negativo ni exceder el total de la compra.",
        "error"
      );
      setIsAddingCompra(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compras`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCompra),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add purchase");
      }
      await fetchCompras();
      setIsAddDialogOpen(false);
      setNewCompra({
        proveedorId: "",
        productos: [],
        fechaCompra: getCurrentDate(),
        pago: 0,
      });
      showAlert("Compra registrada exitosamente.", "success");
    } catch (error) {
      console.error("Error adding purchase:", error);
      showAlert(
        "Error al agregar la compra. Por favor, intente de nuevo.",
        "error"
      );
    } finally {
      setIsAddingCompra(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPayment(true);
    if (newPayment.proveedorId === "" || newPayment.montoPago <= 0) {
      showAlert(
        "Por favor, seleccione un proveedor y especifique un monto de pago válido.",
        "error"
      );
      setIsAddingPayment(false);
      return;
    }

    const proveedorCompras = compras.filter(
      (c) => c.proveedorId._id === newPayment.proveedorId
    );
    const totalSaldo = proveedorCompras.reduce((sum, c) => sum + c.saldo, 0);

    if (newPayment.montoPago > totalSaldo) {
      showAlert(
        "El monto del pago no puede exceder el saldo total del proveedor.",
        "error"
      );
      setIsAddingPayment(false);
      return;
    }

    try {
      const paymentData = {
        proveedorId: newPayment.proveedorId,
        montoPago: newPayment.montoPago,
        fechaPago: newPayment.fechaPago,
        ...(newPayment.compraId !== "none" && {
          compraId: newPayment.compraId,
        }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compras/pago`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add payment");
      }

      await fetchCompras();
      setIsPaymentDialogOpen(false);
      setNewPayment({
        proveedorId: "",
        compraId: "none",
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

  const handleAddProductToCompra = (producto: Producto) => {
    setNewCompra((prev) => ({
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

  const handleRemoveProductFromCompra = (index: number) => {
    setNewCompra((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  const handleProductChange = (
    index: number,
    field: "cantidad" | "precio",
    value: number
  ) => {
    setNewCompra((prev) => ({
      ...prev,
      productos: prev.productos.map((producto, i) => {
        if (i === index) {
          const updatedProducto = {
            ...producto,
            [field]: Math.max(0.01, value),
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
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {(isAddingCompra || isAddingPayment) && <LoadingSpinner />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compras</h1>
        <div className="flex items-center space-x-4">
          <ShoppingCart className="h-8 w-8" />
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestión de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-5">
                <Plus className="mr-2 h-4 w-4" /> Nueva Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Compra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompra} className="space-y-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewCompra({ ...newCompra, proveedorId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor._id} value={proveedor._id}>
                          {proveedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fechaCompra">Fecha de Compra</Label>
                  <Input
                    id="fechaCompra"
                    type="date"
                    value={newCompra.fechaCompra}
                    onChange={(e) =>
                      setNewCompra({
                        ...newCompra,
                        fechaCompra: e.target.value,
                      })
                    }
                    max={getCurrentDate()}
                    required
                  />
                </div>
                <div>
                  <Label>Productos</Label>
                  {newCompra.productos.map((producto, index) => (
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
                        onClick={() => handleRemoveProductFromCompra(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Select
                    onValueChange={(value) => {
                      const producto = productos.find((p) => p._id === value);
                      if (producto) {
                        handleAddProductToCompra(producto);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Agregar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto._id} value={producto._id}>
                          {producto.nombre}
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
                    value={newCompra.pago}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      const total = calculateTotal(newCompra.productos);
                      setNewCompra({
                        ...newCompra,
                        pago: Math.min(Math.max(0, value), total),
                      });
                    }}
                    min="0"
                    max={calculateTotal(newCompra.productos)}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <p>
                    Total: Bs.{calculateTotal(newCompra.productos).toFixed(2)}
                  </p>
                  <p>
                    Saldo: Bs.
                    {(
                      calculateTotal(newCompra.productos) - newCompra.pago
                    ).toFixed(2)}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full mb-5"
                  disabled={isAddingCompra}
                >
                  {isAddingCompra ? "Registrando..." : "Registrar Compra"}
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
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Select
                    onValueChange={(value) => {
                      setNewPayment({
                        ...newPayment,
                        proveedorId: value,
                        compraId: "none",
                        montoPago: 0,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores
                        .filter((proveedor) =>
                          proveedoresConDeuda.includes(proveedor._id)
                        )
                        .map((proveedor) => (
                          <SelectItem key={proveedor._id} value={proveedor._id}>
                            {proveedor.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {newPayment.proveedorId && (
                  <div>
                    <Label htmlFor="compra">Compra (Opcional)</Label>
                    <Select
                      value={newPayment.compraId}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setNewPayment({
                            ...newPayment,
                            compraId: "none",
                            montoPago: 0,
                          });
                        } else {
                          const selectedCompra = compras.find(
                            (c) => c._id === value
                          );
                          setNewPayment({
                            ...newPayment,
                            compraId: value,
                            montoPago: selectedCompra
                              ? selectedCompra.saldo
                              : 0,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar compra" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          Ninguna compra específica
                        </SelectItem>
                        {compras
                          .filter(
                            (compra) =>
                              compra.proveedorId._id ===
                                newPayment.proveedorId && compra.saldo > 0
                          )
                          .map((compra) => (
                            <SelectItem key={compra._id} value={compra._id}>
                              {formatDate(compra.fechaCompra)} - Saldo: Bs.
                              {compra.saldo.toFixed(2)}
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
                      if (newPayment.compraId === "none") {
                        const proveedorCompras = compras.filter(
                          (c) => c.proveedorId._id === newPayment.proveedorId
                        );
                        const totalSaldo = proveedorCompras.reduce(
                          (sum, c) => sum + c.saldo,
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
                    disabled={newPayment.compraId !== "none"}
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
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra._id}>
                    <TableCell>{compra.proveedorId.nombre}</TableCell>
                    <TableCell>{formatDate(compra.fechaCompra)}</TableCell>
                    <TableCell>Bs.{compra.total.toFixed(2)}</TableCell>
                    <TableCell>Bs.{compra.montoPagado.toFixed(2)}</TableCell>
                    <TableCell>Bs.{compra.saldo.toFixed(2)}</TableCell>
                    <TableCell>{compra.estado}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentCompra(compra);
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
            {compras.map((compra) => (
              <Card key={compra._id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p>
                      <strong>Proveedor:</strong> {compra.proveedorId.nombre}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {formatDate(compra.fechaCompra)}
                    </p>
                    <p>
                      <strong>Total:</strong> Bs.{compra.total.toFixed(2)}
                    </p>
                    <p>
                      <strong>Pagado:</strong> Bs.
                      {compra.montoPagado.toFixed(2)}
                    </p>
                    <p>
                      <strong>Saldo:</strong> Bs.{compra.saldo.toFixed(2)}
                    </p>
                    <p>
                      <strong>Estado:</strong> {compra.estado}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentCompra(compra);
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
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Compra</DialogTitle>
          </DialogHeader>
          {currentCompra && (
            <div className="space-y-4">
              <p>
                <strong>Proveedor:</strong> {currentCompra.proveedorId.nombre}
              </p>
              <p>
                <strong>Fecha de Compra:</strong>{" "}
                {formatDate(currentCompra.fechaCompra)}
              </p>
              <p>
                <strong>Total:</strong> Bs.{currentCompra.total.toFixed(2)}
              </p>
              <p>
                <strong>Monto Pagado:</strong> Bs.
                {currentCompra.montoPagado.toFixed(2)}
              </p>
              <p>
                <strong>Saldo:</strong> Bs.{currentCompra.saldo.toFixed(2)}
              </p>
              <p>
                <strong>Estado:</strong> {currentCompra.estado}
              </p>
              <div>
                <h4 className="font-bold mb-2">Productos:</h4>
                <ul className="list-disc pl-5">
                  {currentCompra.productos.map((producto, index) => (
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
                {currentCompra.pagos && currentCompra.pagos.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {currentCompra.pagos.map((pago, index) => (
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
  );
}
