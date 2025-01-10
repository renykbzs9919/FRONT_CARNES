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
import { Users, Edit, Trash2, Plus } from "lucide-react";

interface Proveedor {
  _id: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(
    null
  );
  const [newProveedor, setNewProveedor] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/proveedores`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch proveedores");
      }
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
    }
  };

  const handleAddProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/proveedores`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProveedor),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add proveedor");
      }
      await fetchProveedores();
      setIsAddDialogOpen(false);
      setNewProveedor({ nombre: "", telefono: "", direccion: "" });
    } catch (error) {
      console.error("Error adding proveedor:", error);
    }
  };

  const handleEditProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProveedor) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/proveedores/${currentProveedor._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentProveedor),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update proveedor");
      }
      await fetchProveedores();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating proveedor:", error);
    }
  };

  const handleDeleteProveedor = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proveedor?"))
      return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/proveedores/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete proveedor");
      }
      await fetchProveedores();
    } catch (error) {
      console.error("Error deleting proveedor:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8" />
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestión de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-5">
              <Plus className="mr-2 h-4 w-4" />Agregar Proveedor</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProveedor} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={newProveedor.nombre}
                    onChange={(e) =>
                      setNewProveedor({
                        ...newProveedor,
                        nombre: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={newProveedor.telefono}
                    onChange={(e) =>
                      setNewProveedor({
                        ...newProveedor,
                        telefono: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={newProveedor.direccion}
                    onChange={(e) =>
                      setNewProveedor({
                        ...newProveedor,
                        direccion: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full mb-5">
                  Guardar
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
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((proveedor) => (
                  <TableRow key={proveedor._id}>
                    <TableCell className="font-medium">
                      {proveedor.nombre}
                    </TableCell>
                    <TableCell>{proveedor.telefono}</TableCell>
                    <TableCell>{proveedor.direccion}</TableCell>
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
                              onClick={() => setCurrentProveedor(proveedor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Proveedor</DialogTitle>
                            </DialogHeader>
                            {currentProveedor && (
                              <form
                                onSubmit={handleEditProveedor}
                                className="space-y-4"
                              >
                                <div>
                                  <Label htmlFor="edit-nombre">Nombre</Label>
                                  <Input
                                    id="edit-nombre"
                                    value={currentProveedor.nombre}
                                    onChange={(e) =>
                                      setCurrentProveedor({
                                        ...currentProveedor,
                                        nombre: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-telefono">
                                    Teléfono
                                  </Label>
                                  <Input
                                    id="edit-telefono"
                                    value={currentProveedor.telefono}
                                    onChange={(e) =>
                                      setCurrentProveedor({
                                        ...currentProveedor,
                                        telefono: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-direccion">
                                    Dirección
                                  </Label>
                                  <Input
                                    id="edit-direccion"
                                    value={currentProveedor.direccion}
                                    onChange={(e) =>
                                      setCurrentProveedor({
                                        ...currentProveedor,
                                        direccion: e.target.value,
                                      })
                                    }
                                    required
                                  />
                                </div>
                                <Button type="submit" className="w-full mb-5">
                                  Guardar Cambios
                                </Button>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteProveedor(proveedor._id)}
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
            {proveedores.map((proveedor) => (
              <Card key={proveedor._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{proveedor.nombre}</h3>
                      <p className="text-sm">{proveedor.telefono}</p>
                      <p className="text-sm text-gray-500">
                        {proveedor.direccion}
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
                            onClick={() => setCurrentProveedor(proveedor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Proveedor</DialogTitle>
                          </DialogHeader>
                          {currentProveedor && (
                            <form
                              onSubmit={handleEditProveedor}
                              className="space-y-4"
                            >
                              <div>
                                <Label htmlFor="edit-nombre-mobile">
                                  Nombre
                                </Label>
                                <Input
                                  id="edit-nombre-mobile"
                                  value={currentProveedor.nombre}
                                  onChange={(e) =>
                                    setCurrentProveedor({
                                      ...currentProveedor,
                                      nombre: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-telefono-mobile">
                                  Teléfono
                                </Label>
                                <Input
                                  id="edit-telefono-mobile"
                                  value={currentProveedor.telefono}
                                  onChange={(e) =>
                                    setCurrentProveedor({
                                      ...currentProveedor,
                                      telefono: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-direccion-mobile">
                                  Dirección
                                </Label>
                                <Input
                                  id="edit-direccion-mobile"
                                  value={currentProveedor.direccion}
                                  onChange={(e) =>
                                    setCurrentProveedor({
                                      ...currentProveedor,
                                      direccion: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full mb-5">
                                Guardar Cambios
                              </Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDeleteProveedor(proveedor._id)}
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
