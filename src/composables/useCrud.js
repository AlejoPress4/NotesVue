import { ref, reactive } from "vue";

export function useCrud(apiUrl) {
  const items = ref([]);
  const item = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const totalItems = ref(0); // Total items for pagination

  const list = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const url = new URL(apiUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString());
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Backend response:", data); // Log backend response for debugging
      items.value = Array.isArray(data.notes) ? data.notes : [];
      totalItems.value = data.pagination?.total || 0; // Ensure proper handling of pagination
      return data; // Return the backend response
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id) => {
    loading.value = true;
    error.value = null;
    item.value = null;
    try {
      const response = await fetch(`${apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      item.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const create = async (newItem) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const createdItem = await response.json();
      items.value.push(createdItem); // actualizar la lista localmente
      return createdItem;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id, updatedItem) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedData = await response.json();
      // Opcional: actualizar la lista localmente
      const index = items.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        items.value[index] = updatedData;
      }
      return updatedData;
    } catch (err) {
      error.value = err;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Opcional: eliminar de la lista localmente
      items.value = items.value.filter((item) => item.id !== id);
      return true;
    } catch (err) {
      error.value = err;
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    item,
    loading,
    error,
    totalItems, // Add totalItems to the returned object
    list,
    getById,
    create,
    update,
    remove,
  };
}
