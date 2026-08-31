import type { Producto } from "./types";

export const mockProductos: Producto[] = [
  // Desayuno
  {
    id: "1",
    nombre: "Café con medialunas",
    descripcion: "Café de especialidad + 3 medialunas de manteca",
    precio: 3500,
    imagen_url: "",
    categoria: "desayuno",
    disponible: true,
    orden: 1,
  },
  {
    id: "2",
    nombre: "Tostado de jamón y queso",
    descripcion: "Pan de masa madre, jamón cocido y queso en plancha",
    precio: 4000,
    imagen_url: "",
    categoria: "desayuno",
    disponible: true,
    orden: 2,
  },
  // Almuerzo
  {
    id: "3",
    nombre: "Pizza muzzarella",
    descripcion: "Masa madre, salsa de tomate casera y muzzarella",
    precio: 7500,
    imagen_url: "",
    categoria: "almuerzo",
    disponible: true,
    orden: 1,
  },
  {
    id: "4",
    nombre: "Pizza fugazzeta",
    descripcion: "Masa madre con cebolla caramelizada y muzzarella",
    precio: 8000,
    imagen_url: "",
    categoria: "almuerzo",
    disponible: true,
    orden: 2,
  },
  {
    id: "5",
    nombre: "Sanguche de bondiola",
    descripcion:
      "Bondiola braseada, cebolla crispy y chimichurri en pan de masa madre",
    precio: 6500,
    imagen_url: "",
    categoria: "almuerzo",
    disponible: true,
    orden: 3,
  },
  // Merienda
  {
    id: "6",
    nombre: "Focaccia con jamón crudo",
    descripcion:
      "Focaccia de masa madre, jamón crudo, rúcula y parmesano",
    precio: 5500,
    imagen_url: "",
    categoria: "merienda",
    disponible: true,
    orden: 1,
  },
  {
    id: "7",
    nombre: "Café doble",
    descripcion: "Espresso doble de especialidad",
    precio: 2500,
    imagen_url: "",
    categoria: "merienda",
    disponible: true,
    orden: 2,
  },
  // Cena
  {
    id: "8",
    nombre: "Pizza napolitana",
    descripcion:
      "Masa madre, tomate, muzzarella, anchoas y aceitunas",
    precio: 8500,
    imagen_url: "",
    categoria: "cena",
    disponible: true,
    orden: 1,
  },
  {
    id: "9",
    nombre: "Focaccia rellena",
    descripcion:
      "Focaccia de masa madre rellena de jamón, queso y morrones asados",
    precio: 7000,
    imagen_url: "",
    categoria: "cena",
    disponible: true,
    orden: 2,
  },
  {
    id: "10",
    nombre: "Sanguche de milanesa",
    descripcion:
      "Milanesa de ternera, lechuga, tomate y mayonesa casera",
    precio: 7000,
    imagen_url: "",
    categoria: "cena",
    disponible: true,
    orden: 3,
  },
];
