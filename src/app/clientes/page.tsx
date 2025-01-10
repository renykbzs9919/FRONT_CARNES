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

interface Cliente {
  _id: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [newCliente, setNewCliente] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

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
    }
  };

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clientes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCliente),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add client");
      }
      await fetchClientes();
      setIsAddDialogOpen(false);
      setNewCliente({ nombre: "", telefono: "", direccion: "" });
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleEditCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCliente) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clientes/${currentCliente._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentCliente),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update client");
      }
      await fetchClientes();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clientes/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete client");
      }
      await fetchClientes();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8" />
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-5">
                <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCliente} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={newCliente.nombre}
                    onChange={(e) =>
                      setNewCliente({ ...newCliente, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={newCliente.telefono}
                    onChange={(e) =>
                      setNewCliente({ ...newCliente, telefono: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={newCliente.direccion}
                    onChange={(e) =>
                      setNewCliente({
                        ...newCliente,
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
                {clientes.map((cliente) => (
                  <TableRow key={cliente._id}>
                    <TableCell className="font-medium">
                      {cliente.nombre}
                    </TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{cliente.direccion}</TableCell>
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
                              onClick={() => setCurrentCliente(cliente)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Cliente</DialogTitle>
                            </DialogHeader>
                            {currentCliente && (
                              <form
                                onSubmit={handleEditCliente}
                                className="space-y-4"
                              >
                                <div>
                                  <Label htmlFor="edit-nombre">Nombre</Label>
                                  <Input
                                    id="edit-nombre"
                                    value={currentCliente.nombre}
                                    onChange={(e) =>
                                      setCurrentCliente({
                                        ...currentCliente,
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
                                    value={currentCliente.telefono}
                                    onChange={(e) =>
                                      setCurrentCliente({
                                        ...currentCliente,
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
                                    value={currentCliente.direccion}
                                    onChange={(e) =>
                                      setCurrentCliente({
                                        ...currentCliente,
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
                          className="mb-5 bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteCliente(cliente._id)}
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
            {clientes.map((cliente) => (
              <Card key={cliente._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{cliente.nombre}</h3>
                      <p className="text-sm">{cliente.telefono}</p>
                      <p className="text-sm text-gray-500">
                        {cliente.direccion}
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
                            onClick={() => setCurrentCliente(cliente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Editar Cliente</DialogTitle>
                          </DialogHeader>
                          {currentCliente && (
                            <form
                              onSubmit={handleEditCliente}
                              className="space-y-4"
                            >
                              <div>
                                <Label htmlFor="edit-nombre-mobile">
                                  Nombre
                                </Label>
                                <Input
                                  id="edit-nombre-mobile"
                                  value={currentCliente.nombre}
                                  onChange={(e) =>
                                    setCurrentCliente({
                                      ...currentCliente,
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
                                  value={currentCliente.telefono}
                                  onChange={(e) =>
                                    setCurrentCliente({
                                      ...currentCliente,
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
                                  value={currentCliente.direccion}
                                  onChange={(e) =>
                                    setCurrentCliente({
                                      ...currentCliente,
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
                        onClick={() => handleDeleteCliente(cliente._id)}
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
