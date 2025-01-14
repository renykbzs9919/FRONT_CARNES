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
import { Package, Edit, Trash2, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinnerGuardar";

interface Producto {
  _id: string;
  nombre: string;
  cantidadDisponible: number;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProducto, setCurrentProducto] = useState<Producto | null>(null);
  const [newProducto, setNewProducto] = useState({
    nombre: "",
    cantidadDisponible: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/productos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProducto),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add product");
      }
      await fetchProductos();
      setIsAddDialogOpen(false);
      setNewProducto({ nombre: "", cantidadDisponible: 0 });
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProducto) return;
    setIsEditing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/productos/${currentProducto._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentProducto),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      await fetchProductos();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProducto = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?"))
      return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      await fetchProductos();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {(isAdding || isEditing || isDeleting) && <LoadingSpinner />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <div className="flex items-center space-x-4">
          <Package className="h-8 w-8" />
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestión de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-5">
                <Plus className="mr-2 h-4 w-4" /> Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProducto} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={newProducto.nombre}
                    onChange={(e) =>
                      setNewProducto({ ...newProducto, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cantidadDisponible">
                    Cantidad Disponible
                  </Label>
                  <Input
                    id="cantidadDisponible"
                    type="number"
                    value={newProducto.cantidadDisponible}
                    onChange={(e) =>
                      setNewProducto({
                        ...newProducto,
                        cantidadDisponible: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full mb-5"
                  disabled={isAdding}
                >
                  {isAdding ? "Guardando..." : "Guardar"}
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
                  <TableHead className="w-[200px]">Nombre</TableHead>
                  <TableHead>Cantidad Disponible</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto._id}>
                    <TableCell className="font-medium">
                      {producto.nombre}
                    </TableCell>
                    <TableCell>{producto.cantidadDisponible}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog
                          open={isEditDialogOpen}
                          onOpenChange={setIsEditDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mb-5"
                              onClick={() => setCurrentProducto(producto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Producto</DialogTitle>
                            </DialogHeader>
                            {currentProducto && (
                              <form
                                onSubmit={handleEditProducto}
                                className="space-y-4"
                              >
                                <div>
                                  <Label htmlFor="edit-nombre">Nombre</Label>
                                  <Input
                                    id="edit-nombre"
                                    value={currentProducto.nombre}
                                    onChange={(e) =>
                                      setCurrentProducto({
                                        ...currentProducto,
                                        nombre: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-cantidadDisponible">
                                    Cantidad Disponible
                                  </Label>
                                  <Input
                                    id="edit-cantidadDisponible"
                                    type="number"
                                    value={currentProducto.cantidadDisponible}
                                    onChange={(e) =>
                                      setCurrentProducto({
                                        ...currentProducto,
                                        cantidadDisponible: parseInt(
                                          e.target.value
                                        ),
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <Button
                                  type="submit"
                                  className="w-full mb-5"
                                  disabled={isEditing}
                                >
                                  {isEditing
                                    ? "Guardando..."
                                    : "Guardar Cambios"}
                                </Button>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mb-5 bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteProducto(producto._id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-4">
            {productos.map((producto) => (
              <Card key={producto._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{producto.nombre}</h3>
                      <p className="text-sm">
                        Cantidad: {producto.cantidadDisponible}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mb-5"
                            onClick={() => setCurrentProducto(producto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Producto</DialogTitle>
                          </DialogHeader>
                          {currentProducto && (
                            <form
                              onSubmit={handleEditProducto}
                              className="space-y-4"
                            >
                              <div>
                                <Label htmlFor="edit-nombre-mobile">
                                  Nombre
                                </Label>
                                <Input
                                  id="edit-nombre-mobile"
                                  value={currentProducto.nombre}
                                  onChange={(e) =>
                                    setCurrentProducto({
                                      ...currentProducto,
                                      nombre: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-cantidadDisponible-mobile">
                                  Cantidad Disponible
                                </Label>
                                <Input
                                  id="edit-cantidadDisponible-mobile"
                                  type="number"
                                  value={currentProducto.cantidadDisponible}
                                  onChange={(e) =>
                                    setCurrentProducto({
                                      ...currentProducto,
                                      cantidadDisponible: parseInt(
                                        e.target.value
                                      ),
                                    })
                                  }
                                  required
                                />
                              </div>
                              <Button
                                type="submit"
                                className="w-full mb-5"
                                disabled={isEditing}
                              >
                                {isEditing ? "Guardando..." : "Guardar Cambios"}
                              </Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDeleteProducto(producto._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
