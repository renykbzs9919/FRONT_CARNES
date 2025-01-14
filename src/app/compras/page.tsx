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
  cantidad: number | "";
  precio: number | "";
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
    pago: "" as number | "",
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
    if (
      newCompra.productos.some(
        (p) =>
          p.cantidad === "" ||
          p.precio === "" ||
          parseFloat(p.cantidad as unknown as string) <= 0 ||
          parseFloat(p.precio as unknown as string) <= 0
      )
    ) {
      showAlert(
        "La cantidad y el precio de los productos deben ser mayores que cero.",
        "error"
      );
      setIsAddingCompra(false);
      return;
    }
    const pagoNum = parseFloat(newCompra.pago as string);
    if (
      isNaN(pagoNum) ||
      pagoNum < 0 ||
      pagoNum > calculateTotal(newCompra.productos)
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
          body: JSON.stringify({
            ...newCompra,
            pago: parseFloat(newCompra.pago as string),
          }),
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
        pago: "",
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
          cantidad: "",
          precio: "",
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
    value: string
  ) => {
    setNewCompra((prev) => ({
      ...prev,
      productos: prev.productos.map((producto, i) => {
        if (i === index) {
          const numValue = value === "" ? "" : parseFloat(value);
          const updatedProducto = {
            ...producto,
            [field]:
              value === ""
                ? ""
                : typeof numValue === "number" && numValue > 0
                ? numValue
                : "",
          };
          updatedProducto.subtotal =
            (parseFloat(updatedProducto.cantidad as string) || 0) *
            (parseFloat(updatedProducto.precio as string) || 0);
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
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
                <DialogTitle>Registrar Nueva Compra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompra} className="space-y-4 py-2">
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
                      className="grid grid-cols-1 sm:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-end mb-4 p-4 border rounded-lg"
                    >
                      <div>
                        <Label>Producto</Label>
                        <p className="mt-2">{producto.productoId.nombre}</p>
                      </div>

                      <div>
                        <Label htmlFor={`cantidad-${index}`}>Cantidad</Label>
                        <Input
                          id={`cantidad-${index}`}
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) =>
                            handleProductChange(
                              index,
                              "cantidad",
                              e.target.value
                            )
                          }
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              parseFloat(e.target.value) <= 0
                            ) {
                              handleProductChange(index, "cantidad", "");
                            }
                          }}
                          min="0.01"
                          step="0.01"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`precio-${index}`}>Precio</Label>
                        <Input
                          id={`precio-${index}`}
                          type="number"
                          value={producto.precio}
                          onChange={(e) =>
                            handleProductChange(index, "precio", e.target.value)
                          }
                          onBlur={(e) => {
                            if (
                              e.target.value === "" ||
                              parseFloat(e.target.value) <= 0
                            ) {
                              handleProductChange(index, "precio", "");
                            }
                          }}
                          min="0.01"
                          step="0.01"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Subtotal</Label>
                        <p className="mt-2 font-medium">
                          Bs.{producto.subtotal.toFixed(2)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveProductFromCompra(index)}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const producto = productos.find((p) => p._id === value);
                      if (producto) {
                        handleAddProductToCompra(producto);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Agregar otro producto" />
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
                      const value = e.target.value;
                      const numValue = value === "" ? 0 : parseFloat(value);
                      const total = calculateTotal(newCompra.productos);
                      setNewCompra({
                        ...newCompra,
                        pago:
                          value === ""
                            ? ""
                            : Math.min(Math.max(0, numValue), total),
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
                      calculateTotal(newCompra.productos) -
                      (parseFloat(newCompra.pago as string) || 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="sticky bottom-0 bg-background pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isAddingCompra}
                  >
                    {isAddingCompra ? "Registrando..." : "Registrar Compra"}
                  </Button>
                </div>
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
                      {typeof producto.precio === "number"
                        ? producto.precio.toFixed(2)
                        : producto.precio}
                      , Subtotal: Bs.
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
