"use client"; 

import React, { useState, useEffect } from "react";
import Textinput from "@/components/ui/Textinput";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { db } from "@/configs/firebaseConfig";
import Select from "@/components/ui/Select";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"; // Métodos de Firestore

const StarterPage = () => {
  const [catalogName, setCatalogName] = useState(""); // Estado para el nombre del catálogo
  const [articleName, setArticleName] = useState(""); // Estado para el nombre del artículo
  const [articleDescription, setArticleDescription] = useState(""); // Estado para la descripción del artículo
  const [selectedCategory, setSelectedCategory] = useState(""); // Estado para la categoría seleccionada
  const [selectedArticle, setSelectedArticle] = useState(null); // Estado para el artículo seleccionado para editar
  const [selectedCatalog, setSelectedCatalog] = useState(null); // Estado para el catálogo seleccionado para editar
  const [catalogs, setCatalogs] = useState([]); // Estado para almacenar los catálogos
  const [articles, setArticles] = useState([]); // Estado para almacenar los artículos

  // Función para obtener los catálogos de Firestore
  const getCatalogs = async () => {
    const querySnapshot = await getDocs(collection(db, "catalogos"));
    const catalogsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setCatalogs(catalogsList);
  };

  // Función para obtener los artículos de Firestore y llenar los nombres de las categorías
    const getArticles = async () => {
      const querySnapshot = await getDocs(collection(db, "articulos"));
      const articlesList = [];
      const catalogsSnapshot = await getDocs(collection(db, "catalogos"));
    
      // Crear un mapa de catálogos (ID -> Nombre)
      const catalogsMap = catalogsSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name;
        return acc;
      }, {});
    
      querySnapshot.docs.forEach((doc) => {
        const articleData = doc.data();
        articlesList.push({
          id: doc.id,
          name: articleData.name,
          description: articleData.description,
          category: catalogsMap[articleData.categoryId] || "Categoría no encontrada",
          quantity: articleData.quantity || 0, // Incluimos la cantidad
        });
      });
    
      setArticles(articlesList); // Guardamos todos los artículos en el estado
    };
  
    

  useEffect(() => {
    getCatalogs(); // Cargar catálogos al iniciar la página
    getArticles(); // Cargar artículos al iniciar la página
  }, []);

  // Función para agregar un catálogo
  const handleAddCatalog = async () => {
    if (!catalogName.trim()) {
      alert("Por favor, ingresa un nombre para el catálogo.");
      return;
    }

    try {
      if (selectedCatalog) {
        // Actualizar catálogo existente
        const catalogRef = doc(db, "catalogos", selectedCatalog.id);
        await updateDoc(catalogRef, {
          name: catalogName,
        });
        alert("Catálogo actualizado con éxito");
      } else {
        // Agregar un nuevo catálogo
        const docRef = await addDoc(collection(db, "catalogos"), {
          name: catalogName,
          createdAt: new Date(),
        });
        alert(`Catálogo agregado con ID: ${docRef.id}`);
      }

      setCatalogName(""); // Limpia el campo de entrada
      setSelectedCatalog(null); // Resetea el estado de catálogo seleccionado
      getCatalogs(); // Actualiza la lista de catálogos
    } catch (error) {
      console.error("Error al guardar el catálogo:", error);
      alert("Ocurrió un error al guardar el catálogo.");
    }
  };

  // Función para eliminar un catálogo
  const handleDeleteCatalog = async (catalogId) => {
    try {
      await deleteDoc(doc(db, "catalogos", catalogId));
      alert("Catálogo eliminado con éxito");
      getCatalogs(); // Actualiza la lista de catálogos
    } catch (error) {
      console.error("Error al eliminar el catálogo:", error);
      alert("Ocurrió un error al eliminar el catálogo.");
    }
  };

  // Función para agregar un artículo
  const handleAddArticle = async () => {
    if (!articleName.trim() || !articleDescription.trim() || !selectedCategory) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const selectedCategoryId = catalogs.find(
        (catalog) => catalog.name === selectedCategory
      )?.id;

      // Agregar un nuevo artículo con categoryId y cantidad
      const docRef = await addDoc(collection(db, "articulos"), {
        name: articleName,
        description: articleDescription,
        categoryId: selectedCategoryId,
        quantity: 0, // Inicializamos la cantidad en 0
      });
      alert(`Artículo agregado con ID: ${docRef.id}`);

      // Limpiar los campos después de agregar el artículo
      setArticleName("");
      setArticleDescription("");
      setSelectedCategory(""); // Reiniciar la categoría seleccionada
      setSelectedArticle(null); // Resetea el artículo seleccionado

      getArticles(); // Actualizar la lista de artículos
    } catch (error) {
      console.error("Error al guardar el artículo:", error);
      alert("Ocurrió un error al guardar el artículo.");
    }
  };

  // Función para actualizar la cantidad de un artículo en Firestore
  const handleUpdateQuantity = async (articleId, newQuantity) => {
    try {
      const articleRef = doc(db, "articulos", articleId);
      await updateDoc(articleRef, {
        quantity: newQuantity,
      });

      alert("Cantidad actualizada correctamente.");
      getArticles(); // Actualiza la lista de artículos para reflejar el cambio
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      alert("Ocurrió un error al actualizar la cantidad.");
    }
  };


  // Función para eliminar un artículo
  const handleDeleteArticle = async (articleId) => {
    try {
      await deleteDoc(doc(db, "articulos", articleId));
      alert("Artículo eliminado con éxito");
      getArticles(); // Actualiza la lista de artículos
    } catch (error) {
      console.error("Error al eliminar el artículo:", error);
      alert("Ocurrió un error al eliminar el artículo.");
    }
  };

  // Función para seleccionar un catálogo para modificar
  const handleEditCatalog = (catalog) => {
    setCatalogName(catalog.name);
    setSelectedCatalog(catalog); // Marca el catálogo como el seleccionado para edición
  };

  // Función para seleccionar un artículo para modificar
  const handleEditArticle = (article) => {
    setArticleName(article.name);
    setArticleDescription(article.description);
    setSelectedCategory(article.category);
    setSelectedArticle(article); // Marca el artículo como el seleccionado para edición
  };

  // Agrupar artículos por categoría
  const groupedArticles = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []; // Si no existe la categoría, la creamos
    }
    acc[article.category].push(article); // Agregamos el artículo a la categoría correspondiente
    return acc;
  }, {});
  

  return (
    <div className="grid xl:grid-cols-2 gap-5">
      {/* Formulario para agregar o modificar un catálogo */}
      <Card title={selectedCatalog ? "Modificar Catalogo" : "Agregar Nuevo Catalogo"}>
        <div className="space-y-3 gap-4">
          <Textinput
            label="Nombre del Catalogo"
            id="pn"
            type="text"
            placeholder="Cremas, Papitas, Sodas, etc..."
            value={catalogName}
            onChange={(e) => setCatalogName(e.target.value)}
          />
          <Button
            text={selectedCatalog ? "Actualizar Catalogo" : "Agregar Catalogo"}
            className="btn-primary block-btn py-1"
            type="button"
            onClick={handleAddCatalog} // Llama a la función para agregar o actualizar el catálogo
          />
        </div>
      </Card>

      {/* Formulario para agregar o modificar un artículo */}
      <Card title={selectedArticle ? "Modificar Artículo" : "Agregar Nuevo Artículo"}>
        <div className="space-y-3 gap-4">
          <Textinput
            label="Nombre del Artículo"
            id="articleName"
            type="text"
            placeholder="Ej. Crema de chocolate"
            value={articleName}
            onChange={(e) => setArticleName(e.target.value)}
          />
          <Textinput
            label="Descripción del Artículo"
            id="articleDescription"
            type="text"
            placeholder="Descripción del artículo"
            value={articleDescription}
            onChange={(e) => setArticleDescription(e.target.value)}
          />
          <Select
            options={catalogs.map((catalog) => catalog.name)} // Mostrar los nombres de los catálogos
            label="Selecciona la categoría"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)} // Asignar el nombre de la categoría seleccionada
          />

          <Button
            text={selectedArticle ? "Actualizar Artículo" : "Agregar Artículo"}
            className="btn-primary block-btn py-1"
            type="button"
            onClick={handleAddArticle} // Llama a la función para agregar o actualizar el artículo
          />
        </div>
      </Card>

      {/* Lista de catálogos */}
      <Card title="Catálogos Existentes">
        <div className="space-y-3">
          {catalogs.length === 0 ? (
            <p>No hay catálogos registrados.</p>
          ) : (
            <ul>
              {catalogs.map((catalog) => (
                <li key={catalog.id} className="flex justify-between items-center">
                  <span>{catalog.name}</span>
                  <div className="flex space-x-2">
                    <Button
                      text="Modificar"
                      className="btn-secondary block-btn py-1 w-full mt-2"
                      onClick={() => handleEditCatalog(catalog)}
                    />
                    <Button
                      text="Eliminar"
                      className="btn-danger block-btn py-1 w-full mt-2"
                      onClick={() => handleDeleteCatalog(catalog.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Lista de artículos con contador por categoría */}
      <Card title="Artículos por Categoría">
        <div className="space-y-3">
          {Object.entries(groupedArticles).length === 0 ? (
            <p>No hay artículos registrados.</p>
          ) : (
            Object.entries(groupedArticles).map(([category, articlesInCategory]) => (
              <div key={category}>
                <h3 className="font-bold">{category}</h3> {/* Título de la categoría */}
                <ul>
                  {articlesInCategory.map((article) => (
                    <li key={article.id} className="flex justify-between items-center">
                      <span>
                        {article.name} - {article.description} (Cantidad: {article.quantity})
                      </span>
                      <div className="flex space-x-2">
                        {/* Input para modificar cantidad con Enter */}
                        <input
                          type="number"
                          min="0"
                          defaultValue={article.quantity} // Usamos defaultValue para controlarlo
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newQuantity = parseInt(e.target.value, 10);
                              if (!isNaN(newQuantity)) {
                                handleUpdateQuantity(article.id, newQuantity); // Actualiza la cantidad
                              }
                            }
                          }}
                          className="input"
                        />
                        <Button
                          text="Modificar"
                          className="btn-secondary block-btn py-1 w-full mt-2"
                          onClick={() => handleEditArticle(article)}
                        />
                        <Button
                          text="Eliminar"
                          className="btn-danger block-btn py-1 w-full mt-2"
                          onClick={() => handleDeleteArticle(article.id)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </Card>



    </div>
  );
};

export default StarterPage;
